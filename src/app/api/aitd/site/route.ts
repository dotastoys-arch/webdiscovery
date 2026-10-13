import { NextRequest, NextResponse } from 'next/server';
import { guard, err, actorOf } from '@/lib/aitd/api';
import { getSiteRow, saveDraft, audit } from '@/lib/aitd/db';
import { parseSite } from '@/lib/aitd/types';

// Concept van de site ophalen/opslaan (klant + beheerder).
export async function GET(req: NextRequest) {
  const g = await guard(req);
  if ('response' in g) return g.response;
  const row = await getSiteRow();
  return NextResponse.json(
    { draft: row.draft, rev: row.rev, clientLocked: row.clientLocked, publishedAt: row.publishedAt },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function PUT(req: NextRequest) {
  const g = await guard(req, { mutating: true });
  if ('response' in g) return g.response;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.rev !== 'number') return err(400, 'Ongeldig verzoek.');
  if (JSON.stringify(body.doc ?? null).length > 600_000) return err(413, 'De site is te groot om op te slaan.');

  const row = await getSiteRow();
  if (row.clientLocked && g.editor.kind === 'client') {
    return err(423, 'Bewerken is tijdelijk uitgeschakeld door de beheerder.');
  }
  const parsed = parseSite(body.doc);
  if (!parsed.ok) return err(400, parsed.error);

  const saved = await saveDraft(parsed.site, body.rev, actorOf(g.editor));
  if (!saved.ok) {
    return err(409, 'Iemand anders heeft de site intussen aangepast. Laad de pagina opnieuw om de nieuwste versie te zien.');
  }
  await audit(actorOf(g.editor), 'concept opgeslagen');
  return NextResponse.json({ ok: true, rev: saved.rev });
}
