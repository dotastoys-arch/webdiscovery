import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSql, hasDb } from '@/lib/db';
import { hasMollie } from '@/lib/mollie';
import { syncOrderPayment } from '@/lib/orders';
import { euro } from '@/lib/config';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import type { Order } from '@/types/db';

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

  // Klant komt terug van Mollie: check direct of er betaald is (webhook kan nog
  // onderweg zijn) zodat de bevestiging meteen klopt.
  const status = await syncOrderPayment(order);
  const paid = status === 'paid' || status === 'domain_setup' || status === 'delivered';

  // Voortgang na betaling.
  const steps = [
    { title: 'Betaald', desc: 'Je betaling is binnen.' },
    { title: 'Domein koppelen', desc: 'Wij zetten jouw domeinnaam op de website.' },
    { title: 'Online', desc: 'Je website staat live.' },
  ];
  // Aantal afgeronde stappen: betaald=1, domein doorgegeven=2, live=3.
  const completed = status === 'delivered' ? 3 : status === 'domain_setup' ? 2 : 1;

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-lg w-full px-6 py-16">
        {paid ? (
          <>
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Betaald — bedankt!</h1>
                <p className="text-sm text-slate-500">{order.customer_company ?? 'Je bestelling is bevestigd.'}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold mb-6">Wat er nu gebeurt</h2>
              <ol className="space-y-7">
                {steps.map((s, i) => {
                  const n = i + 1;
                  const done = n <= completed;
                  const active = n === completed + 1;
                  const isDomainStep = n === 2;
                  return (
                    <li key={s.title} className="flex gap-4">
                      <span
                        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold ${
                          done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {done ? '✓' : n}
                      </span>
                      <div className="flex-1 pt-1">
                        <div className={`text-base font-bold ${active ? 'text-indigo-700' : done ? 'text-slate-900' : 'text-slate-400'}`}>
                          {s.title}
                          {active && <span className="ml-2 align-middle text-[11px] font-semibold text-white bg-indigo-600 rounded-full px-2 py-0.5">nu bezig</span>}
                        </div>
                        <div className="text-sm text-slate-500 mt-0.5">{s.desc}</div>

                        {/* Stap 2: klant koppelt zelf zijn domeinnaam */}
                        {isDomainStep && active && (
                          <form action="/api/bestel/domain" method="post" className="mt-3">
                            <input type="hidden" name="orderId" value={order.id} />
                            <label className="block text-sm font-medium text-slate-700 mb-1">Welke domeinnaam wil je?</label>
                            <div className="flex gap-2">
                              <input
                                name="domain"
                                required
                                placeholder="bijv. salonbelle.nl"
                                className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <button className="shrink-0 rounded-lg bg-indigo-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-indigo-700">
                                Koppelen
                              </button>
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                              Je hebt al betaald — de domeinnaam zit bij je abonnement inbegrepen. Wij bestellen en koppelen 'm voor je.
                            </p>
                          </form>
                        )}

                        {/* Domein is doorgegeven */}
                        {isDomainStep && done && order.domain && (
                          <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-sm text-emerald-800">
                            <span className="font-semibold">{order.domain}</span> · aangevraagd, wij zetten 'm live
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {order.preview_url && (
              <a href={order.preview_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Bekijk jouw website ↗
              </a>
            )}
          </>
        ) : (
          <>
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
                <span className="text-slate-600">Domeinnaam, hosting &amp; onderhoud</span>
                <span className="font-semibold">{euro(order.monthly_cents)}/mnd</span>
              </div>
              <p className="pt-2 text-xs text-slate-400">Domeinnaam, hosting, CMS en onderhoud zitten allemaal bij het maandbedrag inbegrepen.</p>
              {order.preview_url && (
                <a href={order.preview_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Bekijk jouw website ↗
                </a>
              )}

              {!hasMollie() ? (
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

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Zo werkt het</p>
              <ol className="space-y-2 text-sm text-slate-600">
                <li>1. Betaal veilig met iDEAL.</li>
                <li>2. Kies zelf je domeinnaam — die zit bij het abonnement inbegrepen.</li>
                <li>3. Je website gaat live — klaar voor bezoekers.</li>
              </ol>
            </div>
          </>
        )}

        <p className="mt-6 text-sm text-slate-500">
          Vragen? Mail <Link href="/contact" className="text-indigo-600">info@webdiscovery.nl</Link>.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
