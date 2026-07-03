import { NextRequest, NextResponse } from 'next/server';
import { getSql, hasDb } from '@/lib/db';
import { config } from '@/lib/config';

// Klant koppelt na betaling zelf zijn domeinnaam. We slaan het domein op en zetten
// de bestelling op 'domain_setup'. De daadwerkelijke registratie + livegang doen wij.
export async function POST(req: NextRequest) {
  if (!hasDb()) return NextResponse.redirect(`${config.siteUrl}`, 303);

  const form = await req.formData();
  const orderId = String(form.get('orderId') || '');
  let domain = String(form.get('domain') || '').trim().toLowerCase();

  // Normaliseren: https://, www. en paden weghalen.
  domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

  if (!orderId) return NextResponse.redirect(`${config.siteUrl}`, 303);

  const sql = getSql();
  const rows = await sql`select id, status, lead_id from orders where id = ${orderId} limit 1`;
  const order = rows[0];
  if (!order) return NextResponse.redirect(`${config.siteUrl}`, 303);

  const paid = ['paid', 'domain_setup', 'delivered'].includes(order.status as string);
  // Alleen na betaling, en niet meer als de site al live is.
  if (paid && order.status !== 'delivered' && /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) {
    await sql`update orders set domain = ${domain}, status = 'domain_setup', updated_at = now() where id = ${orderId}`;
    if (order.lead_id) {
      await sql`insert into events (lead_id, type, data) values (${order.lead_id}, 'domain_requested', ${JSON.stringify({ domain })}::jsonb)`;
    }
  }

  return NextResponse.redirect(`${config.siteUrl}/bestel/${orderId}`, 303);
}
