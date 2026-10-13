import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { guard, err } from '@/lib/aitd/api';
import { audit } from '@/lib/aitd/db';
import { defaultSite } from '@/lib/aitd/defaults';
import { parseSite } from '@/lib/aitd/types';

type Ctx = { params: Promise<{ id: string }> };

// Een eerdere versie terugzetten (id "origineel" = de oorspronkelijke site).
// mode "draft" = alleen als concept; "publish" = meteen weer live.
export async function POST(req: NextRequest, { params }: Ctx) {
  const g = await guard(req, { mutating: true, adminOnly: true });
  if ('response' in g) return g.response;
  const { id } = await params;
  const { mode } = await req.json().catch(() => ({}));
  const sql = getSql();

  let doc: unknown;
  if (id === 'origineel') doc = defaultSite();
  else {
    const rows = await sql`select doc from aitd_versions where id = ${Number(id)}`;
    if (!rows[0]) return err(404, 'Versie niet gevonden.');
    doc = rows[0].doc;
  }
  const parsed = parseSite(doc);
  if (!parsed.ok) return err(400, `Deze versie is ongeldig: ${parsed.error}`);
  const json = JSON.stringify(parsed.site);

  await sql`update aitd_site set draft = ${json}::jsonb, rev = rev + 1, updated_at = now(), updated_by = 'beheerder' where id = 1`;
  if (mode === 'publish') {
    await sql`update aitd_site set published = ${json}::jsonb, published_at = now(), published_by = 'beheerder' where id = 1`;
    await sql`insert into aitd_versions (doc, note, created_by) values (${json}::jsonb, ${`Teruggezet: versie ${id}`}, 'beheerder')`;
  }
  await audit('beheerder', mode === 'publish' ? 'versie teruggezet en gepubliceerd' : 'versie teruggezet als concept', { versie: id });
  return NextResponse.json({ ok: true });
}
