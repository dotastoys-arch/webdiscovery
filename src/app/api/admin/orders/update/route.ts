import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getSql } from '@/lib/db';

const allowed = ['pending', 'awaiting_payment', 'paid', 'domain_setup', 'delivered', 'cancelled', 'refunded'];

// Werkt een bestelling bij: domein koppelen en/of status verzetten (bijv. live).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id, domain, status } = (await req.json().catch(() => ({}))) as {
    id?: string;
    domain?: string;
    status?: string;
  };
  if (!id) return NextResponse.json({ error: 'id ontbreekt' }, { status: 400 });
  if (status && !allowed.includes(status)) return NextResponse.json({ error: 'ongeldige status' }, { status: 400 });

  const sql = getSql();
  if (domain !== undefined) {
    await sql`update orders set domain = ${domain || null}, updated_at = now() where id = ${id}`;
  }
  if (status) {
    await sql`update orders set status = ${status}, updated_at = now() where id = ${id}`;
  }
  return NextResponse.json({ ok: true });
}
