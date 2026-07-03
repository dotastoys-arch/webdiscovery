import { NextRequest, NextResponse } from 'next/server';
import { getSql, hasDb } from '@/lib/db';
import { mollie, hasMollie, hasRecurring, createMonthlySubscription } from '@/lib/mollie';
import { markOrderPaid } from '@/lib/orders';
import { config } from '@/lib/config';

// Eerste incasso één maand na de €500-betaling.
function firstChargeDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

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

      // Eerste betaling (€500) met machtiging binnen? Start het €15/mnd-abonnement.
      const customerId = (payment as { customerId?: string }).customerId;
      const seq = (payment as { sequenceType?: string }).sequenceType;
      if (id && hasRecurring() && customerId && seq === 'first') {
        const existing = await sql`select id from subscriptions where order_id = ${id} and status <> 'cancelled' limit 1`;
        if (!existing[0]) {
          const oRows = await sql`select monthly_cents, lead_id, customer_company from orders where id = ${id} limit 1`;
          const o = oRows[0];
          const monthly = (o?.monthly_cents as number) || 1500;
          try {
            const startDate = firstChargeDate();
            const subId = await createMonthlySubscription({
              customerId,
              amountCents: monthly,
              description: `Maandelijkse hosting & onderhoud — ${o?.customer_company ?? id}`,
              webhookUrl: `${config.siteUrl}/api/webhooks/mollie`,
              startDate,
            });
            await sql`
              insert into subscriptions
                (order_id, lead_id, status, monthly_cents, mollie_customer_id, mollie_subscription_id, started_at, next_billing_at)
              values (${id}, ${o?.lead_id ?? null}, 'active', ${monthly}, ${customerId}, ${subId}, now(), ${startDate})`;
          } catch (e) {
            console.error('[mollie webhook] abonnement starten mislukt', e);
          }
        }
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
