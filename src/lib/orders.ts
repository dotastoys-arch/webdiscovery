import { getSql } from '@/lib/db';
import { mollie, hasMollie } from '@/lib/mollie';

const PAID_STATES = ['paid', 'domain_setup', 'delivered'];

// Zet een bestelling op 'betaald' en werkt de bijbehorende lead + logboek bij.
// Idempotent: draait niks terug als de order al betaald/live is.
export async function markOrderPaid(orderId: string, paymentId?: string): Promise<void> {
  const sql = getSql();
  const rows = await sql`
    update orders set status = 'paid', paid_at = now(), updated_at = now()
    where id = ${orderId} and status not in ('paid', 'domain_setup', 'delivered')
    returning lead_id`;
  const leadId = rows[0]?.lead_id;
  if (leadId) {
    await sql`update leads set status = 'won', updated_at = now() where id = ${leadId}`;
    await sql`insert into events (lead_id, type, data) values (${leadId}, 'order_paid', ${JSON.stringify({ paymentId: paymentId ?? null })}::jsonb)`;
  }
}

// Vraagt bij Mollie op of er inmiddels betaald is (voor als de webhook nog niet
// binnen was toen de klant terugkeerde). Retourneert de actuele status.
export async function syncOrderPayment(order: { id: string; status: string; mollie_payment_id: string | null }): Promise<string> {
  if (PAID_STATES.includes(order.status)) return order.status;
  if (!hasMollie() || !order.mollie_payment_id) return order.status;
  try {
    const payment = await mollie().payments.get(order.mollie_payment_id);
    if (payment.status === 'paid') {
      await markOrderPaid(order.id, order.mollie_payment_id);
      return 'paid';
    }
  } catch (e) {
    console.error('[syncOrderPayment]', e);
  }
  return order.status;
}

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

  // Bestaat er al een bestelling voor deze site? Hergebruik die — ook als 'ie al
  // betaald is, zodat de klant nooit twee keer kan betalen.
  const existing = await sql`
    select id from orders where site_id = ${siteId} and status <> 'cancelled'
    order by created_at desc limit 1`;
  if (existing[0]) return { orderId: existing[0].id as string };

  const ins = await sql`
    insert into orders (lead_id, site_id, amount_cents, monthly_cents, status, customer_email, customer_company, plan)
    values (${s.lead_id}, ${siteId}, ${s.standard_price_cents ?? 50000}, 1500, 'pending',
            ${s.email}, ${s.company_name}, 'standaard')
    returning id`;
  return { orderId: ins[0].id as string };
}
