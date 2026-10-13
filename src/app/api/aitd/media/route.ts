import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { guard, err, actorOf } from '@/lib/aitd/api';
import { audit, getSiteRow } from '@/lib/aitd/db';

// Fotobibliotheek. Uploads komen al verkleind uit de browser (max ±2000 px).
const MAX_BYTES = 3 * 1024 * 1024;

// Alleen echte afbeeldingen (geen SVG i.v.m. scripts), herkend aan de bestandsinhoud.
function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buf.toString('ascii', 0, 6) === 'GIF87a' || buf.toString('ascii', 0, 6) === 'GIF89a') return 'image/gif';
  return null;
}

export async function GET(req: NextRequest) {
  const g = await guard(req);
  if ('response' in g) return g.response;
  const sql = getSql();
  const rows = await sql`select id, name, bytes, width, height, created_at from aitd_media order by created_at desc limit 500`;
  const row = await getSiteRow();
  const used = JSON.stringify([row.draft, row.published]);
  return NextResponse.json(
    { items: rows.map((r) => ({ ...r, inUse: used.includes(r.id as string) })) },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: NextRequest) {
  const g = await guard(req, { mutating: true });
  if ('response' in g) return g.response;
  const row = await getSiteRow();
  if (row.clientLocked && g.editor.kind === 'client') return err(423, 'Bewerken is tijdelijk uitgeschakeld door de beheerder.');

  const len = Number(req.headers.get('content-length') ?? 0);
  if (len > MAX_BYTES) return err(413, 'Deze foto is te groot (max. 3 MB).');
  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length === 0) return err(400, 'Leeg bestand.');
  if (buf.length > MAX_BYTES) return err(413, 'Deze foto is te groot (max. 3 MB).');
  const mime = sniff(buf);
  if (!mime) return err(415, 'Alleen JPG, PNG, WebP of GIF zijn toegestaan.');

  const name = decodeURIComponent(req.headers.get('x-file-name') ?? '').slice(0, 120);
  const w = Number(req.headers.get('x-width')) || null;
  const h = Number(req.headers.get('x-height')) || null;
  const sql = getSql();
  const rows = await sql`
    insert into aitd_media (mime, data_b64, bytes, width, height, name, uploaded_by)
    values (${mime}, ${buf.toString('base64')}, ${buf.length}, ${w}, ${h}, ${name}, ${actorOf(g.editor)})
    returning id`;
  await audit(actorOf(g.editor), 'foto geüpload', { id: rows[0].id, name });
  return NextResponse.json({ id: rows[0].id });
}
