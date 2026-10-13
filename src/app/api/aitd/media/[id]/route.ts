import { NextRequest, NextResponse } from 'next/server';
import { getSql, hasDb } from '@/lib/db';
import { guard, err, actorOf } from '@/lib/aitd/api';
import { audit, ensureSchema, getSiteRow } from '@/lib/aitd/db';

type Ctx = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Publiek: foto tonen. Id's zijn onveranderlijk → lang cachen.
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!UUID.test(id) || !hasDb()) return new NextResponse('Not found', { status: 404 });
  await ensureSchema();
  const rows = await getSql()`select mime, data_b64 from aitd_media where id = ${id} limit 1`;
  if (!rows[0]) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(Buffer.from(rows[0].data_b64 as string, 'base64'), {
    headers: {
      'Content-Type': rows[0].mime as string,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    },
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const g = await guard(req, { mutating: true });
  if ('response' in g) return g.response;
  const { id } = await params;
  if (!UUID.test(id)) return err(404, 'Niet gevonden.');
  const row = await getSiteRow();
  if (row.clientLocked && g.editor.kind === 'client') return err(423, 'Bewerken is tijdelijk uitgeschakeld door de beheerder.');
  if (JSON.stringify([row.draft, row.published]).includes(id)) {
    return err(409, 'Deze foto wordt nog gebruikt op de site. Haal hem eerst overal weg en publiceer.');
  }
  await getSql()`delete from aitd_media where id = ${id}`;
  await audit(actorOf(g.editor), 'foto verwijderd', { id });
  return NextResponse.json({ ok: true });
}
