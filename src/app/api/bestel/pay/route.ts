import { NextRequest, NextResponse } from 'next/server';
import { getSql, hasDb } from '@/lib/db';
import { mollie, hasMollie, hasRecurring, createCustomer, euroValue } from '@/lib/mollie';
import { config } from '@/lib/config';
import { SequenceType, type PaymentCreateParams } from '@mollie/api-client';

// Publieke betaal-start: maakt een Mollie-betaling voor de bestelling en stuurt
// de klant door naar de betaalpagina van Mollie (iDEAL).
export async function POST(req: NextRequest) {
  if (!hasDb() || !hasMollie()) {
    return NextResponse.redirect(`${config.siteUrl}/contact`, 303);
  }
  const form = await req.formData();
  const orderId = String(form.get('orderId') || '');
  if (!orderId) return NextResponse.json({ error: 'orderId ontbreekt' }, { status: 400 });

  const sql = getSql();
  const rows = await sql`select * from orders where id = ${orderId} limit 1`;
  const order = rows[0];
  if (!order) return NextResponse.json({ error: 'niet gevonden' }, { status: 404 });

  const params: PaymentCreateParams = {
    amount: { currency: 'EUR', value: euroValue(order.amount_cents as number) },
    description: `Website WebDiscovery — ${order.customer_company ?? orderId}`,
    redirectUrl: `${config.siteUrl}/bestel/${orderId}`,
    webhookUrl: `${config.siteUrl}/api/webhooks/mollie`,
    metadata: { orderId },
  };

  // Maandelijkse incasso aan? Dan koppelen we de €500 aan een klant en markeren
  // 'm als eerste betaling — dat legt de SEPA-machtiging vast voor de €15/mnd.
  if (hasRecurring()) {
    try {
      const customerId = await createCustomer(
        (order.customer_company as string | null) ?? (order.customer_name as string | null),
        order.customer_email as string | null,
      );
      params.customerId = customerId;
      params.sequenceType = SequenceType.first;
    } catch (e) {
      console.error('[pay] klant aanmaken mislukt, val terug op losse betaling', e);
    }
  }

  const payment = await mollie().payments.create(params);

  await sql`update orders set status = 'awaiting_payment', mollie_payment_id = ${payment.id}, updated_at = now() where id = ${orderId}`;

  const checkout = payment.getCheckoutUrl();
  return NextResponse.redirect(checkout ?? `${config.siteUrl}/bestel/${orderId}`, 303);
}
