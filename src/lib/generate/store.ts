import { createAdminClient } from '@/lib/supabase/admin';
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

// Genereert een concept-site voor een lead en slaat hem op.
export async function createGeneratedSite(leadId: string): Promise<GenerateOutcome> {
  const db = createAdminClient();

  const { data: lead, error } = await db.from('leads').select('*').eq('id', leadId).single();
  if (error || !lead) throw new Error('Lead niet gevonden');

  const result = await generateSite(lead as Lead);

  // Uniek slug: bedrijfsnaam + kort willekeurig achtervoegsel (uit de lead-id).
  const suffix = leadId.replace(/-/g, '').slice(0, 6);
  const slug = `${slugify(lead.company_name) || 'site'}-${suffix}`;
  const previewUrl = `${config.siteUrl}/preview/${slug}`;

  const { data: site, error: upErr } = await db
    .from('generated_sites')
    .upsert(
      {
        lead_id: leadId,
        status: 'ready',
        preview_slug: slug,
        preview_url: previewUrl,
        source_website_url: lead.website_url,
        content: result.content,
        modules: result.modules,
      },
      { onConflict: 'preview_slug' }
    )
    .select('id')
    .single();

  if (upErr) throw new Error(`Opslaan mislukt: ${upErr.message}`);

  // Lead bijwerken + event loggen.
  await db.from('leads').update({ status: 'site_generated' }).eq('id', leadId);
  await db.from('events').insert({
    lead_id: leadId,
    type: 'site_generated',
    data: { slug, modules: result.modules },
  });

  return { siteId: site.id, slug, previewUrl };
}
