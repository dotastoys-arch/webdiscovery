import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSql, hasDb } from '@/lib/db';
import { hasMollie } from '@/lib/mollie';
import { euro } from '@/lib/config';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import type { Order, GeneratedSite } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function BestelPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  if (!hasDb()) return <div className="p-10 text-center text-slate-500">Database niet gekoppeld.</div>;

  const sql = getSql();
  const rows = await sql`
    select o.*, gs.preview_url from orders o
    left join generated_sites gs on gs.id = o.site_id
    where o.id = ${orderId} limit 1`;
  const order = rows[0] as (Order & { preview_url: string | null }) | undefined;
  if (!order) notFound();

  const paid = order.status === 'paid' || order.status === 'domain_setup' || order.status === 'delivered';

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-lg w-full px-6 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">Je bestelling</h1>
        <p className="mt-2 text-slate-600">
          {order.customer_company ? `Voor ${order.customer_company}` : 'Complete website, live gezet.'}
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Complete website (eenmalig)</span>
            <span className="font-semibold">{euro(order.amount_cents)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Hosting, CMS &amp; onderhoud</span>
            <span className="font-semibold">{euro(order.monthly_cents)}/mnd</span>
          </div>
          {order.preview_url && (
            <a href={order.preview_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Bekijk jouw website ↗
            </a>
          )}

          {paid ? (
            <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800">
              <strong>Betaling ontvangen — bedankt!</strong> We koppelen je domein en zetten je
              website live. Je hoort snel van ons.
            </div>
          ) : !hasMollie() ? (
            <div className="mt-6 rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
              Betalen is nog niet ingeschakeld. Neem contact op met WebDiscovery.
            </div>
          ) : (
            <form action="/api/bestel/pay" method="post" className="mt-6">
              <input type="hidden" name="orderId" value={order.id} />
              <button className="w-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition">
                Betaal {euro(order.amount_cents)} met iDEAL
              </button>
              <p className="mt-3 text-xs text-slate-400 text-center">Veilig betalen via Mollie · daarna zetten wij je site live</p>
            </form>
          )}
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Vragen? Mail <Link href="/contact" className="text-indigo-600">info@webdiscovery.nl</Link>.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
