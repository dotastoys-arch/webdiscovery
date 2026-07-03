'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type OrderInfo = { id: string; status: string; domain: string | null } | null;
type CheckResult = { domain: string; available: boolean; priceCents: number | null; years: number };

const PAID = ['paid', 'domain_setup', 'delivered'];

function euro(cents: number) {
  return `€ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

export function DomainSection({
  siteId,
  order,
  canAutoRegister = false,
}: {
  siteId: string;
  order: OrderInfo;
  canAutoRegister?: boolean;
}) {
  const router = useRouter();
  const [dom, setDom] = useState(order?.domain ?? '');
  const [busy, setBusy] = useState(false);
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function post(url: string, body: object) {
    setBusy(true);
    setMsg(null);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      router.refresh();
      return json;
    }
    setMsg(json.error ?? 'Mislukt — probeer opnieuw.');
    return null;
  }

  async function runCheck() {
    setBusy(true);
    setMsg(null);
    setCheck(null);
    const res = await fetch('/api/admin/domain/check', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ domain: dom }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) setCheck(json as CheckResult);
    else setMsg(json.error ?? 'Controle mislukt.');
  }

  async function registerAndGoLive() {
    await post('/api/admin/domain/register', {
      orderId: order!.id,
      domain: dom,
      confirmedPriceCents: check?.priceCents ?? undefined,
    });
  }

  const status = order?.status;
  const isPaid = status ? PAID.includes(status) : false;
  const coupled = status === 'domain_setup' || status === 'delivered';
  const live = status === 'delivered';

  const label = 'block text-sm font-semibold mb-1';
  const input = 'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-bold">Domeinnaam</h2>
      <p className="text-sm text-neutral-500 mt-0.5 mb-5">Koppel de domeinnaam van de klant en zet de website online.</p>

      {/* Statusbalk: 3 simpele stappen */}
      <div className="flex items-center gap-2 mb-6 text-xs">
        <Step n={1} label="Betaald" done={isPaid} active={!isPaid} />
        <span className="flex-1 h-px bg-neutral-200" />
        <Step n={2} label="Domein gekoppeld" done={coupled} active={isPaid && !coupled} />
        <span className="flex-1 h-px bg-neutral-200" />
        <Step n={3} label="Live" done={live} active={coupled && !live} />
      </div>

      {!order ? (
        <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-4">
          <p className="text-sm text-neutral-600 mb-3">Er is nog geen bestelling voor deze website.</p>
          <button
            onClick={() => post('/api/admin/orders/create', { siteId })}
            disabled={busy}
            className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Bestelling aanmaken
          </button>
        </div>
      ) : !isPaid ? (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
          Wacht op betaling. Zodra de klant heeft betaald, kun je hier het domein koppelen.
        </div>
      ) : live ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800">
          <strong>Website staat live</strong>{dom ? ` op ${dom}` : ''}. 🎉
        </div>
      ) : canAutoRegister ? (
        /* Automatische flow via Vercel: check → prijs → bevestigen → kopen & live */
        <div className="space-y-4">
          <div>
            <label className={label}>Domeinnaam van de klant</label>
            <div className="flex gap-2">
              <input
                value={dom}
                onChange={(e) => { setDom(e.target.value); setCheck(null); }}
                placeholder="bijv. salonbelle.nl"
                className={input}
              />
              <button
                onClick={runCheck}
                disabled={busy || !dom}
                className="shrink-0 rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 disabled:opacity-40"
              >
                {busy ? '…' : 'Controleer'}
              </button>
            </div>
          </div>

          {check && check.available && check.priceCents != null && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
              <p className="text-sm text-indigo-900">
                <strong>{check.domain}</strong> is beschikbaar — <strong>{euro(check.priceCents)}</strong>
                {check.years > 1 ? ` voor ${check.years} jaar` : ' per jaar'}.
              </p>
              <p className="text-xs text-indigo-700/80 mt-1">Dit bedrag wordt van je Vercel-account afgeschreven.</p>
              <button
                onClick={registerAndGoLive}
                disabled={busy}
                className="mt-3 rounded-lg bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {busy ? 'Bezig…' : `Registreer & zet live · ${euro(check.priceCents)}`}
              </button>
            </div>
          )}

          {check && !check.available && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-sm text-amber-800">
                <strong>{check.domain}</strong> is niet beschikbaar om te kopen — mogelijk heeft de klant het al.
              </p>
              <button
                onClick={registerAndGoLive}
                disabled={busy}
                className="mt-3 rounded-lg bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {busy ? 'Bezig…' : 'Koppel bestaand domein & zet live'}
              </button>
              <p className="mt-2 text-xs text-amber-700">Laat de klant de DNS naar Vercel wijzen als het domein elders staat.</p>
            </div>
          )}

          {msg && <p className="text-sm text-red-600">{msg}</p>}
        </div>
      ) : (
        /* Handmatige flow (geen Vercel-koppeling): status bijhouden */
        <div className="space-y-5">
          <div>
            <label className={label}>Stap 2 — Domeinnaam invullen</label>
            <div className="flex gap-2">
              <input value={dom} onChange={(e) => setDom(e.target.value)} placeholder="bijv. salonbelle.nl" className={input} />
              <button
                onClick={() => post('/api/admin/orders/update', { id: order.id, domain: dom, status: 'domain_setup' })}
                disabled={busy || !dom}
                className="shrink-0 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-40"
              >
                {coupled ? 'Opslaan' : 'Domein koppelen'}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-neutral-400">
              Registreer het domein bij je provider en laat het naar Vercel wijzen. Voeg het daarna hier toe.
            </p>
          </div>

          <div className="border-t border-neutral-100 pt-5">
            <label className={label}>Stap 3 — Website online zetten</label>
            <button
              onClick={() => post('/api/admin/orders/update', { id: order.id, domain: dom, status: 'delivered' })}
              disabled={busy || !coupled}
              className="rounded-lg bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40"
            >
              Zet website live
            </button>
            {!coupled && <p className="mt-1.5 text-xs text-neutral-400">Koppel eerst een domein (stap 2).</p>}
          </div>
          {msg && <p className="text-sm text-red-600">{msg}</p>}
        </div>
      )}
    </div>
  );
}

function Step({ n, label, done, active }: { n: number; label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
          done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-neutral-200 text-neutral-400'
        }`}
      >
        {done ? '✓' : n}
      </span>
      <span className={`font-medium ${done ? 'text-emerald-700' : active ? 'text-indigo-700' : 'text-neutral-400'}`}>{label}</span>
    </div>
  );
}
