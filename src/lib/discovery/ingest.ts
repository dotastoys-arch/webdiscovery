import { getSql } from '@/lib/db';
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

// Segmenteert en slaat bedrijven op als leads (Neon).
//   - website + verouderd + e-mail  => beste e-mailprospect (rebranding)
//   - geen website                  => bellijst (later), niet mailbaar
// Dedupliceert op source_ref (place_id) en anders op e-mail.
export async function ingestBusinesses(
  businesses: RawBusiness[],
  opts: { enrich?: boolean; source?: string } = {}
): Promise<IngestSummary> {
  const sql = getSql();
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
    if (hasWebsite && opts.enrich !== false && b.website && !b.email) {
      enrich = await enrichFromWebsite(b.website);
    }
    const email = (b.email ?? enrich.email)?.toLowerCase() ?? null;
    if (email) summary.withEmail++;
    if (enrich.outdated) summary.outdated++;

    let score = 0;
    if (email) score += 3;
    if (enrich.outdated) score += 2;
    if (!hasWebsite) score -= 1;

    const notesParts: string[] = [];
    if (enrich.outdatedReasons.length) notesParts.push('Verouderd: ' + enrich.outdatedReasons.join(', '));
    if (!hasWebsite) notesParts.push('Geen website — bellijst');
    const notes = notesParts.join(' · ') || null;

    // Dedup op place_id, anders op e-mail.
    let existingId: string | null = null;
    if (b.placeId) {
      const r = await sql`select id from leads where source_ref = ${b.placeId} limit 1`;
      existingId = (r[0]?.id as string) ?? null;
    }
    if (!existingId && email) {
      const r = await sql`select id from leads where lower(email) = ${email} limit 1`;
      existingId = (r[0]?.id as string) ?? null;
    }

    if (existingId) {
      await sql`
        update leads set
          company_name = ${b.name}, website_url = ${b.website}, has_website = ${hasWebsite},
          email = ${email}, phone = ${b.phone}, address = ${b.address}, city = ${b.city},
          source = ${source}, source_ref = ${b.placeId}, notes = ${notes}, score = ${score},
          updated_at = now()
        where id = ${existingId}`;
      summary.updated++;
    } else {
      await sql`
        insert into leads (company_name, website_url, has_website, email, phone, address, city, source, source_ref, notes, score, status)
        values (${b.name}, ${b.website}, ${hasWebsite}, ${email}, ${b.phone}, ${b.address}, ${b.city},
                ${source}, ${b.placeId}, ${notes}, ${score}, 'new')`;
      summary.created++;
    }
  }

  return summary;
}
