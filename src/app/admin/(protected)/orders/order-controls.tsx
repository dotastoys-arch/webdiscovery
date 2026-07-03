'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function OrderControls({ id, status, domain }: { id: string; status: string; domain: string | null }) {
  const router = useRouter();
  const [dom, setDom] = useState(domain ?? '');
  const [busy, setBusy] = useState(false);

  async function update(body: { domain?: string; status?: string }) {
    setBusy(true);
    const res = await fetch('/api/admin/orders/update', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert('Mislukt');
  }

  // Alleen relevant zodra er betaald is.
  if (!['paid', 'domain_setup', 'delivered'].includes(status)) {
    return <span className="text-xs text-neutral-400">wacht op betaling</span>;
  }

  if (status === 'delivered') {
    return (
      <span className="text-xs text-emerald-600 font-medium">
        Live{dom ? ` · ${dom}` : ''}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={dom}
        onChange={(e) => setDom(e.target.value)}
        placeholder="klantdomein.nl"
        className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs w-36"
      />
      {status === 'paid' ? (
        <button
          onClick={() => update({ domain: dom, status: 'domain_setup' })}
          disabled={busy || !dom}
          className="rounded-lg bg-neutral-900 text-white px-2.5 py-1 text-xs font-medium disabled:opacity-40"
        >
          Domein koppelen
        </button>
      ) : (
        <button
          onClick={() => update({ domain: dom, status: 'delivered' })}
          disabled={busy}
          className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-xs font-medium disabled:opacity-40"
        >
          Zet live
        </button>
      )}
    </div>
  );
}
