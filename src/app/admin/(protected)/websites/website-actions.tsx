'use client';

import { useState } from 'react';
import Link from 'next/link';

export function WebsiteActions({ siteId, previewUrl }: { siteId: string; previewUrl: string | null }) {
  const [loading, setLoading] = useState(false);
  const [bestelUrl, setBestelUrl] = useState<string | null>(null);

  async function makeLink() {
    setLoading(true);
    const res = await fetch('/api/admin/orders/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ siteId }),
    });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) setBestelUrl(j.bestelUrl);
    else alert(j.error ?? 'Mislukt');
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {previewUrl && (
        <a href={previewUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Preview ↗</a>
      )}
      <Link href={`/admin/websites/${siteId}`} className="text-neutral-600 hover:text-neutral-900">Bewerken</Link>
      {bestelUrl ? (
        <a href={bestelUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline" title={bestelUrl}>Betaallink ↗</a>
      ) : (
        <button onClick={makeLink} disabled={loading} className="text-neutral-600 hover:text-neutral-900 disabled:opacity-50">
          {loading ? '…' : 'Betaallink'}
        </button>
      )}
    </div>
  );
}
