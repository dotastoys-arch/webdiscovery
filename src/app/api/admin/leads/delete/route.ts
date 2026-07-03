import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getSql, hasDb } from '@/lib/db';

// Verwijdert één lead (of alle leads). Gerelateerde data (gegenereerde sites,
// berichten, taken, events) verdwijnt mee via ON DELETE CASCADE.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: 'geen database' }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as { id?: string; all?: boolean };
  const sql = getSql();

  if (body.all === true) {
    const rows = await sql`with d as (delete from leads returning 1) select count(*)::int as n from d`;
    return NextResponse.json({ ok: true, deleted: rows[0].n });
  }

  if (typeof body.id === 'string' && body.id) {
    const rows = await sql`with d as (delete from leads where id = ${body.id} returning 1) select count(*)::int as n from d`;
    return NextResponse.json({ ok: true, deleted: rows[0].n });
  }

  return NextResponse.json({ error: 'id of all ontbreekt' }, { status: 400 });
}
