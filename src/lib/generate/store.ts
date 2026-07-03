import { getSql } from '@/lib/db';
import { config } from '@/lib/config';
import { generateSite } from './generate';
import type { Lead } from '@/types/db';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export interface GenerateOutcome {
  siteId: string;
  slug: string;
  previewUrl: string;
}

// Genereert een concept-site voor een lead en slaat hem op (Neon).
export async function createGeneratedSite(leadId: string): Promise<GenerateOutcome> {
  const sql = getSql();

  const rows = await sql`select * from leads where id = ${leadId} limit 1`;
  const lead = rows[0] as Lead | undefined;
  if (!lead) throw new Error('Lead niet gevonden');

  const result = await generateSite(lead);

  const suffix = leadId.replace(/-/g, '').slice(0, 6);
  const slug = `${slugify(lead.company_name) || 'site'}-${suffix}`;
  const previewUrl = `${config.siteUrl}/preview/${slug}`;
  const contentJson = JSON.stringify(result.content);
  const modulesJson = JSON.stringify(result.modules);

  const site = await sql`
    insert into generated_sites (lead_id, status, preview_slug, preview_url, source_website_url, content, modules)
    values (${leadId}, 'ready', ${slug}, ${previewUrl}, ${lead.website_url}, ${contentJson}::jsonb, ${modulesJson}::jsonb)
    on conflict (preview_slug) do update set
      status = 'ready', preview_url = ${previewUrl}, source_website_url = ${lead.website_url},
      content = ${contentJson}::jsonb, modules = ${modulesJson}::jsonb, updated_at = now()
    returning id`;

  await sql`update leads set status = 'site_generated', updated_at = now() where id = ${leadId}`;
  await sql`
    insert into events (lead_id, type, data)
    values (${leadId}, 'site_generated', ${JSON.stringify({ slug, modules: result.modules })}::jsonb)`;

  return { siteId: site[0].id as string, slug, previewUrl };
}
