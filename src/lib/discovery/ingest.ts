import { createAdminClient } from '@/lib/supabase/admin';
import { enrichFromWebsite, type Enrichment } from './enrich';
import type { RawBusiness } from './places';

export interface IngestSummary {
  found: number;
  created: number;
  updated: number;
  withEmail: number;
  outdated: number;
  noWebsite: number;
}

// Segmenteert en slaat bedrijven op als leads.
//   - website + verouderd + e-mail  => beste e-mailprospect (rebranding)
//   - geen website                  => bellijst (later), niet mailbaar
// Dedupliceert op source_ref (place_id) en anders op e-mail.
export async function ingestBusinesses(
  businesses: RawBusiness[],
  opts: { enrich?: boolean; source?: string } = {}
): Promise<IngestSummary> {
  const db = createAdminClient();
  const source = opts.source ?? 'google_places';
  const summary: IngestSummary = {
    found: businesses.length,
    created: 0,
    updated: 0,
    withEmail: 0,
    outdated: 0,
    noWebsite: 0,
  };

  for (const b of businesses) {
    const hasWebsite = !!b.website;
    if (!hasWebsite) summary.noWebsite++;

    let enrich: Enrichment = { email: null, outdated: false, outdatedReasons: [] };
    // Alleen scrapen als er een website is én we nog geen e-mail hebben.
    if (hasWebsite && opts.enrich !== false && b.website && !b.email) {
      enrich = await enrichFromWebsite(b.website);
    }
    const email = b.email ?? enrich.email;
    if (email) summary.withEmail++;
    if (enrich.outdated) summary.outdated++;

    // Score: hoger = betere e-mailprospect.
    let score = 0;
    if (email) score += 3;
    if (enrich.outdated) score += 2;
    if (!hasWebsite) score -= 1;

    const notesParts: string[] = [];
    if (enrich.outdatedReasons.length) notesParts.push('Verouderd: ' + enrich.outdatedReasons.join(', '));
    if (!hasWebsite) notesParts.push('Geen website — bellijst');

    const values = {
      company_name: b.name,
      website_url: b.website,
      has_website: hasWebsite,
      email,
      phone: b.phone,
      address: b.address,
      city: b.city,
      source,
      source_ref: b.placeId,
      notes: notesParts.join(' · ') || null,
      score,
      status: 'new' as const,
    };

    // Dedup op place_id.
    let existingId: string | null = null;
    if (b.placeId) {
      const { data } = await db.from('leads').select('id').eq('source_ref', b.placeId).maybeSingle();
      existingId = data?.id ?? null;
    }
    // Anders op e-mail.
    if (!existingId && email) {
      const { data } = await db.from('leads').select('id').ilike('email', email).maybeSingle();
      existingId = data?.id ?? null;
    }

    if (existingId) {
      await db.from('leads').update(values).eq('id', existingId);
      summary.updated++;
    } else {
      const { error } = await db.from('leads').insert(values);
      if (!error) summary.created++;
    }
  }

  return summary;
}
