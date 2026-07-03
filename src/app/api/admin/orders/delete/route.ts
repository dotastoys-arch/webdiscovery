import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getSql } from '@/lib/db';

// Verwijdert een bestelling (bijv. een testorder). Raakt de lead/website niet.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: 'id ontbreekt' }, { status: 400 });

  const sql = getSql();
  await sql`delete from orders where id = ${id}`;
  return NextResponse.json({ ok: true });
}
