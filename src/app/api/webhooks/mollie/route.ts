import { NextRequest, NextResponse } from 'next/server';
import { getSql, hasDb } from '@/lib/db';
import { mollie, hasMollie } from '@/lib/mollie';
import { markOrderPaid } from '@/lib/orders';

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
      // Order-id uit metadata, of val terug op de payment-id.
      let id = orderId;
      if (!id) {
        const found = await sql`select id from orders where mollie_payment_id = ${paymentId} limit 1`;
        id = found[0]?.id as string | undefined;
      }
      if (id) await markOrderPaid(id, paymentId);
    } else if (['expired', 'failed', 'canceled'].includes(payment.status)) {
      await sql`update orders set status = 'pending', updated_at = now()
                where mollie_payment_id = ${paymentId} and status = 'awaiting_payment'`;
    }
  } catch (e) {
    console.error('[mollie webhook]', e);
  }

  return NextResponse.json({ ok: true });
}
