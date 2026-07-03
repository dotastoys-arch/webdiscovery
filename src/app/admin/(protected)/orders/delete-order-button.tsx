'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteOrderButton({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm(`Bestelling van ${label} verwijderen?`)) return;
    setBusy(true);
    const res = await fetch('/api/admin/orders/delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert('Verwijderen mislukt.');
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      title="Bestelling verwijderen"
      className="text-neutral-400 hover:text-red-600 disabled:opacity-40 text-sm"
    >
      Verwijderen
    </button>
  );
}
