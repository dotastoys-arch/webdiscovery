import { getSql } from '@/lib/db';

// Maakt (of hergebruikt) een bestelling voor een gegenereerde site.
// Retourneert de order-id zodat je de betaallink /bestel/<id> kunt delen.
export async function createOrderForSite(siteId: string): Promise<{ orderId: string }> {
  const sql = getSql();

  const rows = await sql`
    select gs.id as site_id, gs.lead_id, l.company_name, l.email, l.city,
           cp.standard_price_cents
    from generated_sites gs
    join leads l on l.id = gs.lead_id
    cross join lateral (select standard_price_cents from company_profile limit 1) cp
    where gs.id = ${siteId} limit 1`;
  const s = rows[0];
  if (!s) throw new Error('Site niet gevonden');

  // Bestaat er al een open bestelling voor deze site? Hergebruik die.
  const existing = await sql`
    select id from orders where site_id = ${siteId} and status in ('pending','awaiting_payment') limit 1`;
  if (existing[0]) return { orderId: existing[0].id as string };

  const ins = await sql`
    insert into orders (lead_id, site_id, amount_cents, monthly_cents, status, customer_email, customer_company, plan)
    values (${s.lead_id}, ${siteId}, ${s.standard_price_cents ?? 50000}, 1500, 'pending',
            ${s.email}, ${s.company_name}, 'standaard')
    returning id`;
  return { orderId: ins[0].id as string };
}
