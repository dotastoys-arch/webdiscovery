'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const trash = 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6';

export function DeleteLeadButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function del() {
    if (!confirm(`"${name}" verwijderen? De gegenereerde site, mails en taken van dit bedrijf gaan ook weg.`)) return;
    setLoading(true);
    const res = await fetch('/api/admin/leads/delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert('Verwijderen mislukt');
  }

  return (
    <button
      onClick={del}
      disabled={loading}
      title="Verwijder bedrijf"
      className="text-neutral-400 hover:text-red-600 disabled:opacity-40 p-1"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        {trash.split('M').filter(Boolean).map((d, i) => <path key={i} d={'M' + d} />)}
      </svg>
    </button>
  );
}

export function DeleteAllButton({ count }: { count: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function delAll() {
    if (count === 0) return;
    if (!confirm(`ALLE ${count} leads verwijderen, inclusief hun sites, mails en taken? Dit kan niet ongedaan worden gemaakt.`)) return;
    if (!confirm('Weet je het zeker? Echt alles wordt gewist.')) return;
    setLoading(true);
    const res = await fetch('/api/admin/leads/delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert('Verwijderen mislukt');
  }

  return (
    <button
      onClick={delAll}
      disabled={loading || count === 0}
      className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-sm font-medium hover:bg-red-50 disabled:opacity-40"
    >
      {loading ? 'Bezig…' : 'Alles verwijderen'}
    </button>
  );
}
