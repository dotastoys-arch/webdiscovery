'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Sub = {
  id: string;
  status: string;
  monthly_cents: number;
  next_billing_at: string | null;
};

function euro(cents: number) {
  return `€ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

export function SubscriptionCard({ sub }: { sub: Sub }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function cancel() {
    setBusy(true);
    const res = await fetch('/api/admin/subscriptions/cancel', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: sub.id }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? 'Opzeggen mislukt.');
      setConfirming(false);
    }
  }

  const active = sub.status === 'active';
  const next = sub.next_billing_at ? new Date(sub.next_billing_at).toLocaleDateString('nl-NL') : null;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Maandabonnement</h2>
        <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
          {active ? 'actief' : sub.status}
        </span>
      </div>
      <div className="flex justify-between py-2 border-b border-neutral-100 text-sm">
        <span className="text-neutral-600">Automatische incasso</span>
        <span className="font-semibold">{euro(sub.monthly_cents)}/mnd</span>
      </div>
      {next && (
        <div className="flex justify-between py-2 text-sm">
          <span className="text-neutral-600">{active ? 'Volgende incasso' : 'Laatste incassodatum'}</span>
          <span className="text-neutral-500">{next}</span>
        </div>
      )}

      {active && (
        <div className="mt-4">
          {confirming ? (
            <span className="inline-flex items-center gap-3 text-sm">
              <button onClick={cancel} disabled={busy} className="font-medium text-red-600 hover:text-red-700 disabled:opacity-40">
                {busy ? '…' : 'Ja, abonnement opzeggen'}
              </button>
              <button onClick={() => setConfirming(false)} disabled={busy} className="text-neutral-400 hover:text-neutral-600">nee</button>
            </span>
          ) : (
            <button onClick={() => setConfirming(true)} className="text-sm text-neutral-500 hover:text-red-600">
              Abonnement opzeggen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
