import { NextRequest, NextResponse } from 'next/server';
import { getSql, hasDb } from '@/lib/db';
import { mollie, hasMollie } from '@/lib/mollie';

// Mollie POST't hierheen met een payment id. We verifiëren de status bij Mollie
// (niet blind vertrouwen) en werken de bestelling bij.
export async function POST(req: NextRequest) {
  if (!hasDb() || !hasMollie()) return NextResponse.json({ ok: true });

  const form = await req.formData().catch(() => null);
  const paymentId = String(form?.get('id') || '');
  if (!paymentId) return NextResponse.json({ ok: true });

  try {
    const payment = await mollie().payments.get(paymentId);
    const orderId = (payment.metadata as { orderId?: string } | null)?.orderId;
    const sql = getSql();

    if (payment.status === 'paid') {
      const rows = await sql`
        update orders set status = 'paid', paid_at = now(), updated_at = now()
        where (id = ${orderId ?? null} or mollie_payment_id = ${paymentId}) and status <> 'delivered'
        returning lead_id`;
      const leadId = rows[0]?.lead_id;
      if (leadId) {
        await sql`update leads set status = 'won', updated_at = now() where id = ${leadId}`;
        await sql`insert into events (lead_id, type, data) values (${leadId}, 'order_paid', ${JSON.stringify({ paymentId })}::jsonb)`;
      }
    } else if (['expired', 'failed', 'canceled'].includes(payment.status)) {
      await sql`update orders set status = 'pending', updated_at = now()
                where mollie_payment_id = ${paymentId} and status = 'awaiting_payment'`;
    }
  } catch (e) {
    console.error('[mollie webhook]', e);
  }

  return NextResponse.json({ ok: true });
}
