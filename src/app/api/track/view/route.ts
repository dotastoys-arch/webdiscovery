import { NextRequest, NextResponse } from 'next/server';
import { getSql, hasDb } from '@/lib/db';

// Registreert dat een preview-site bekeken is (aangeroepen door de ViewTracker).
// Werkt de lead-status bij naar 'opened' zodat de follow-up weet dat 'ie bekeken is.
export async function POST(req: NextRequest) {
  if (!hasDb()) return NextResponse.json({ ok: false });
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug ontbreekt' }, { status: 400 });

  const sql = getSql();
  try {
    const rows = await sql`
      update generated_sites
      set view_count = view_count + 1,
          viewed_at = coalesce(viewed_at, now())
      where preview_slug = ${slug}
      returning lead_id, view_count`;
    const site = rows[0];
    if (site?.lead_id) {
      // Alleen 'opgewaardeerd' als de lead nog niet verder is dan verstuurd.
      await sql`
        update leads set status = 'opened', updated_at = now()
        where id = ${site.lead_id} and status in ('contacted', 'sent_preview', 'site_generated')`;
      if (site.view_count === 1) {
        await sql`insert into events (lead_id, type, data) values (${site.lead_id}, 'preview_viewed', ${JSON.stringify({ slug })}::jsonb)`;
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[track/view]', e);
    return NextResponse.json({ ok: false });
  }
}
