import { getSql } from '@/lib/db';
import { sendEmail } from '@/lib/email/send';
import { createGeneratedSite } from '@/lib/generate/store';
import { config, renderTemplate } from '@/lib/config';

export const DEFAULT_DAILY_LIMIT = 25;

export interface OutreachSummary {
  eligible: number;
  sent: number;
  skipped: number;
  failed: number;
  emailConfigured: boolean;
}

// Stuurt intro-mails naar nieuwe leads met een e-mailadres.
// Zet automatisch een concept-site klaar als die er nog niet is, en plant een
// follow-up-taak in over 2 dagen. Respecteert een dagelijkse verzendlimiet.
export async function runOutreach(opts: { limit?: number } = {}): Promise<OutreachSummary> {
  const emailConfigured = !!process.env.RESEND_API_KEY;
  const summary: OutreachSummary = { eligible: 0, sent: 0, skipped: 0, failed: 0, emailConfigured };
  if (!emailConfigured) return summary;

  const sql = getSql();

  // Sjabloon + bedrijfsprofiel.
  const tpl = (await sql`select id, subject, body_html, body_text from email_templates where step = 'intro' and is_active limit 1`)[0];
  const profile = (await sql`select * from company_profile limit 1`)[0];
  if (!tpl || !profile) return summary;

  // Dagelijkse limiet respecteren.
  const dailyLimit = opts.limit ?? DEFAULT_DAILY_LIMIT;
  const sentToday = Number(
    (await sql`select count(*)::int as c from messages where step = 'intro' and direction = 'outbound' and sent_at::date = current_date`)[0].c
  );
  const remaining = Math.max(0, dailyLimit - sentToday);
  if (remaining === 0) return summary;

  // Kandidaten: e-mail aanwezig, nog niet benaderd, niet afgemeld.
  const leads = await sql`
    select l.*, gs.preview_slug, gs.preview_url
    from leads l
    left join lateral (
      select preview_slug, preview_url from generated_sites where lead_id = l.id order by created_at desc limit 1
    ) gs on true
    where l.email is not null
      and l.status in ('new', 'queued', 'site_generated')
      and not exists (select 1 from suppressions s where lower(s.email) = lower(l.email))
    order by l.score desc nulls last, l.created_at desc
    limit ${remaining}`;

  summary.eligible = leads.length;

  for (const lead of leads) {
    try {
      // Zorg dat er een preview-site is.
      let previewUrl: string | null = lead.preview_url;
      if (!previewUrl) {
        const outcome = await createGeneratedSite(lead.id as string);
        previewUrl = outcome.previewUrl;
      }

      const vars = {
        company_name: lead.company_name as string,
        preview_url: previewUrl!,
        sender_name: (profile.sender_name as string) || 'Team WebDiscovery',
        kvk_number: (profile.kvk_number as string) || '',
        unsubscribe_url: `${config.siteUrl}/api/unsubscribe?email=${encodeURIComponent(lead.email as string)}`,
      };

      const result = await sendEmail({
        to: lead.email as string,
        subject: renderTemplate(tpl.subject as string, vars),
        html: renderTemplate(tpl.body_html as string, vars),
        text: tpl.body_text ? renderTemplate(tpl.body_text as string, vars) : undefined,
        leadId: lead.id as string,
        templateId: tpl.id as string,
        step: 'intro',
      });

      if (result.skipped) {
        summary.skipped++;
        continue;
      }

      // Lead bijwerken + follow-up over 2 dagen inplannen.
      await sql`update leads set status = 'sent_preview', updated_at = now() where id = ${lead.id}`;
      await sql`
        insert into tasks (lead_id, type, due_at, payload)
        values (${lead.id}, 'followup_2day', now() + interval '2 days', ${JSON.stringify({ preview_url: previewUrl })}::jsonb)`;
      summary.sent++;
    } catch (e) {
      console.error('[outreach] lead', lead.id, e);
      summary.failed++;
    }
  }

  return summary;
}
