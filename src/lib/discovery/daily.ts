import { getSql } from '@/lib/db';
import { searchBusinesses } from './places';
import { ingestBusinesses } from './ingest';

export interface DailySummary {
  configured: boolean;
  searches: number;
  found: number;
  created: number;
  targets: string[];
}

// Draait de dagelijkse discovery: werkt zoek-targets af (Den Haag eerst) tot er
// ~targetNew nieuwe leads bij zijn, of maxSearches bereikt is (kostenbeheersing).
export async function runDailyDiscovery(
  opts: { targetNew?: number; maxSearches?: number } = {}
): Promise<DailySummary> {
  const configured = !!process.env.GOOGLE_PLACES_API_KEY;
  const summary: DailySummary = { configured, searches: 0, found: 0, created: 0, targets: [] };
  if (!configured) return summary;

  const targetNew = opts.targetNew ?? 20;
  const maxSearches = opts.maxSearches ?? 3;
  const sql = getSql();

  const targets = await sql`
    select * from search_targets
    where active
    order by last_run_at asc nulls first, priority desc, created_at asc
    limit ${maxSearches}`;

  for (const t of targets) {
    if (summary.created >= targetNew) break;
    try {
      const query = `${t.branche} in ${t.plaats}`;
      const businesses = await searchBusinesses(query, 20);
      const s = await ingestBusinesses(businesses, { enrich: true, source: 'google_places' });
      summary.searches++;
      summary.found += s.found;
      summary.created += s.created;
      summary.targets.push(`${t.branche} · ${t.plaats}`);
    } catch (e) {
      console.error('[daily discovery] target', t.id, e);
    } finally {
      await sql`update search_targets set last_run_at = now() where id = ${t.id}`;
    }
  }

  return summary;
}
