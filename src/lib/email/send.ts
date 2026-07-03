import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

// Dunne wrapper rond Resend. Respecteert de suppressielijst (AVG/afmeldingen)
// en logt elke verzending in de messages-tabel.

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  leadId?: string;
  campaignId?: string;
  templateId?: string;
  step?: string;
}

export async function sendEmail(args: SendArgs) {
  const db = createAdminClient();

  // 1. Suppressie-check — nooit mailen naar afgemelde/bounced adressen.
  const { data: suppressed } = await db
    .from('suppressions')
    .select('id')
    .ilike('email', args.to)
    .maybeSingle();
  if (suppressed) {
    return { skipped: true as const, reason: 'suppressed' };
  }

  if (!resend) {
    throw new Error('RESEND_API_KEY ontbreekt — mail niet verzonden');
  }

  const from = process.env.MAIL_FROM ?? 'Webdiscovery <hallo@mail.webdiscovery.nl>';

  // 2. Verzenden via Resend.
  const { data, error } = await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
    headers: {
      // Verplichte one-click unsubscribe voor goede deliverability.
      'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_SITE_URL}/api/unsubscribe?email=${encodeURIComponent(args.to)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  // 3. Loggen in messages.
  await db.from('messages').insert({
    lead_id: args.leadId ?? null,
    campaign_id: args.campaignId ?? null,
    template_id: args.templateId ?? null,
    step: args.step ?? null,
    direction: 'outbound',
    status: error ? 'failed' : 'sent',
    subject: args.subject,
    body_html: args.html,
    body_text: args.text ?? null,
    provider_id: data?.id ?? null,
    sent_at: error ? null : new Date().toISOString(),
  });

  if (error) throw new Error(`Resend fout: ${error.message}`);
  return { skipped: false as const, id: data?.id };
}
