'use client';

import { useState } from 'react';

interface Summary {
  configured: boolean;
  searches: number;
  found: number;
  created: number;
  targets: string[];
}

export function DailyButton() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setSummary(null);
    const res = await fetch('/api/admin/discovery/daily', { method: 'POST' });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) setSummary(j);
    else setError(j.error ?? 'Mislukt');
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 mb-6 max-w-2xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-medium">Dagelijkse zoekopdracht</div>
          <p className="text-sm text-neutral-500">
            Zoekt automatisch ~20 nieuwe bedrijven — start bij Den Haag en breidt uit.
            Draait elke werkdag vanzelf; hier kun je 'm ook handmatig starten.
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? 'Zoeken…' : 'Draai nu'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      {summary && !summary.configured && (
        <p className="text-sm text-amber-700 mt-3">
          Nog niet geconfigureerd. Zet <code>GOOGLE_PLACES_API_KEY</code> in Vercel.
        </p>
      )}
      {summary && summary.configured && (
        <div className="text-sm text-neutral-700 mt-3">
          <span className="mr-5"><strong>{summary.created}</strong> nieuw</span>
          <span className="mr-5"><strong>{summary.found}</strong> gevonden</span>
          <span><strong>{summary.searches}</strong> zoekopdrachten</span>
          {summary.targets.length > 0 && (
            <div className="text-xs text-neutral-400 mt-1">{summary.targets.join(' · ')}</div>
          )}
        </div>
      )}
    </div>
  );
}
