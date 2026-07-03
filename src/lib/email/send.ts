import { Resend } from 'resend';
import { getSql } from '@/lib/db';

// Dunne wrapper rond Resend. Respecteert de suppressielijst (AVG/afmeldingen)
// en logt elke verzending in de messages-tabel (Neon).

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
  const sql = getSql();

  // 1. Suppressie-check — nooit mailen naar afgemelde/bounced adressen.
  const suppressed = await sql`select id from suppressions where lower(email) = ${args.to.toLowerCase()} limit 1`;
  if (suppressed[0]) return { skipped: true as const, reason: 'suppressed' };

  if (!resend) throw new Error('RESEND_API_KEY ontbreekt — mail niet verzonden');

  const from = process.env.MAIL_FROM ?? 'Webdiscovery <hallo@mail.webdiscovery.nl>';

  // 2. Verzenden via Resend.
  const { data, error } = await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
    headers: {
      'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_SITE_URL}/api/unsubscribe?email=${encodeURIComponent(args.to)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  // 3. Loggen in messages.
  await sql`
    insert into messages (lead_id, campaign_id, template_id, step, direction, status, subject, body_html, body_text, provider_id, sent_at)
    values (${args.leadId ?? null}, ${args.campaignId ?? null}, ${args.templateId ?? null}, ${args.step ?? null},
            'outbound', ${error ? 'failed' : 'sent'}, ${args.subject}, ${args.html}, ${args.text ?? null},
            ${data?.id ?? null}, ${error ? null : new Date().toISOString()})`;

  if (error) throw new Error(`Resend fout: ${error.message}`);
  return { skipped: false as const, id: data?.id };
}
