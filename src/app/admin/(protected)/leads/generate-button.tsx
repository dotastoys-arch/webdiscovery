'use client';

import { useState } from 'react';

export function GenerateButton({
  leadId,
  initialPreviewUrl,
}: {
  leadId: string;
  initialPreviewUrl?: string | null;
}) {
  const [url, setUrl] = useState<string | null>(initialPreviewUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/admin/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ leadId }),
    });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) setUrl(j.previewUrl);
    else setError(j.error ?? 'Mislukt');
  }

  if (url) {
    return (
      <div className="flex items-center gap-2">
        <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">
          Bekijk preview ↗
        </a>
        <button onClick={generate} disabled={loading} className="text-xs text-neutral-400 hover:text-neutral-700">
          {loading ? '…' : '↻'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={generate}
        disabled={loading}
        className="rounded-lg bg-blue-600 text-white px-3 py-1 text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Genereren…' : 'Genereer site'}
      </button>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}
