import { getSql } from '@/lib/db';
import { sendEmail } from '@/lib/email/send';
import { config, renderTemplate } from '@/lib/config';

export interface FollowupSummary {
  enabled: boolean;
  due: number;
  sent: number;
  skipped: number;
  failed: number;
  emailConfigured: boolean;
}

// Verwerkt openstaande follow-up-taken waarvan de tijd verstreken is.
export async function runFollowups(): Promise<FollowupSummary> {
  const enabled = process.env.OUTREACH_ENABLED === 'true';
  const emailConfigured = !!process.env.RESEND_API_KEY;
  const summary: FollowupSummary = { enabled, due: 0, sent: 0, skipped: 0, failed: 0, emailConfigured };
  if (!enabled || !emailConfigured) return summary;

  const sql = getSql();
  const tpl = (await sql`select id, subject, body_html, body_text from email_templates where step = 'followup_2day' and is_active limit 1`)[0];
  const profile = (await sql`select * from company_profile limit 1`)[0];
  if (!tpl || !profile) return summary;

  const tasks = await sql`
    select t.id as task_id, l.*, gs.preview_url
    from tasks t
    join leads l on l.id = t.lead_id
    left join lateral (
      select preview_url from generated_sites where lead_id = l.id order by created_at desc limit 1
    ) gs on true
    where t.type = 'followup_2day' and t.status = 'pending' and t.due_at <= now()
    limit 100`;

  summary.due = tasks.length;

  for (const row of tasks) {
    try {
      // Niet meer opvolgen als de lead al gereageerd heeft of is afgemeld.
      const stop = ['replied', 'interested', 'won', 'lost', 'unsubscribed'].includes(row.status as string);
      if (stop || !row.email) {
        await sql`update tasks set status = 'cancelled', completed_at = now() where id = ${row.task_id}`;
        summary.skipped++;
        continue;
      }

      const vars = {
        company_name: row.company_name as string,
        preview_url: (row.preview_url as string) || config.siteUrl,
        sender_name: (profile.sender_name as string) || 'Team WebDiscovery',
        kvk_number: (profile.kvk_number as string) || '',
        unsubscribe_url: `${config.siteUrl}/api/unsubscribe?email=${encodeURIComponent(row.email as string)}`,
      };

      const result = await sendEmail({
        to: row.email as string,
        subject: renderTemplate(tpl.subject as string, vars),
        html: renderTemplate(tpl.body_html as string, vars),
        text: tpl.body_text ? renderTemplate(tpl.body_text as string, vars) : undefined,
        leadId: row.id as string,
        templateId: tpl.id as string,
        step: 'followup_2day',
      });

      await sql`update tasks set status = 'done', completed_at = now() where id = ${row.task_id}`;
      if (result.skipped) {
        summary.skipped++;
        continue;
      }
      await sql`update leads set status = 'followed_up', updated_at = now() where id = ${row.id} and status = 'sent_preview'`;
      summary.sent++;
    } catch (e) {
      console.error('[followups] task', row.task_id, e);
      summary.failed++;
    }
  }

  return summary;
}
