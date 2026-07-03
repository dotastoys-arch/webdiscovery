import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getSql } from '@/lib/db';
import { hasMollie, cancelSubscription } from '@/lib/mollie';

// Zegt een lopend abonnement op bij Mollie en werkt de status bij.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: 'id ontbreekt' }, { status: 400 });

  const sql = getSql();
  const rows = await sql`select id, mollie_customer_id, mollie_subscription_id from subscriptions where id = ${id} limit 1`;
  const sub = rows[0];
  if (!sub) return NextResponse.json({ error: 'niet gevonden' }, { status: 404 });

  try {
    if (hasMollie() && sub.mollie_customer_id && sub.mollie_subscription_id) {
      await cancelSubscription(sub.mollie_customer_id as string, sub.mollie_subscription_id as string);
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }

  await sql`update subscriptions set status = 'cancelled', cancelled_at = now(), updated_at = now() where id = ${id}`;
  return NextResponse.json({ ok: true });
}
