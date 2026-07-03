'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteOrderButton({ id }: { id: string; label?: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    const res = await fetch('/api/admin/orders/delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      alert('Verwijderen mislukt.');
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-sm">
        <button onClick={remove} disabled={busy} className="font-medium text-red-600 hover:text-red-700 disabled:opacity-40">
          {busy ? '…' : 'Zeker weten?'}
        </button>
        <button onClick={() => setConfirming(false)} disabled={busy} className="text-neutral-400 hover:text-neutral-600">
          nee
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-neutral-400 hover:text-red-600 text-sm">
      Verwijderen
    </button>
  );
}
