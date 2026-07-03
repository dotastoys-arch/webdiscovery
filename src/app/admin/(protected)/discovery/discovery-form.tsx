'use client';

import { useState } from 'react';

interface Summary {
  found: number;
  created: number;
  updated: number;
  withEmail: number;
  outdated: number;
  noWebsite: number;
}

function parseRows(text: string) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, website, email, city] = line.split(/[;,\t]/).map((s) => s?.trim() || '');
      return { name, website: website || null, email: email || null, city: city || null };
    })
    .filter((r) => r.name);
}

export function DiscoveryForm() {
  const [tab, setTab] = useState<'places' | 'manual'>('places');
  const [branche, setBranche] = useState('');
  const [plaats, setPlaats] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [enrich, setEnrich] = useState(true);
  const [paste, setPaste] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  async function run(body: unknown) {
    setStatus('running');
    setError(null);
    setSummary(null);
    const res = await fetch('/api/admin/discovery', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      setSummary(j.summary);
      setStatus('done');
    } else {
      setError(j.error ?? 'Er ging iets mis');
      setStatus('error');
    }
  }

  const input = 'rounded-lg border border-neutral-300 px-3 py-2 text-sm';
  const running = status === 'running';

  return (
    <div className="max-w-2xl">
      <div className="flex gap-2 mb-6">
        {(['places', 'manual'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {t === 'places' ? 'Google Places' : 'Handmatige import'}
          </button>
        ))}
      </div>

      {tab === 'places' ? (
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Branche / zoekterm</label>
              <input
                className={`${input} w-full`}
                value={branche}
                onChange={(e) => setBranche(e.target.value)}
                placeholder="bv. kappers"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plaats</label>
              <input
                className={`${input} w-full`}
                value={plaats}
                onChange={(e) => setPlaats(e.target.value)}
                placeholder="bv. Utrecht"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm">
              Max. resultaten{' '}
              <input
                type="number"
                min={1}
                max={60}
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className={`${input} w-20 ml-1`}
              />
            </label>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={enrich} onChange={(e) => setEnrich(e.target.checked)} />
              Website scrapen voor e-mail
            </label>
          </div>
          <button
            onClick={() =>
              run({
                mode: 'places',
                query: `${branche.trim()}${plaats.trim() ? ` in ${plaats.trim()}` : ''}`,
                maxResults,
                enrich,
              })
            }
            disabled={running || branche.trim().length < 2}
            className="rounded-lg bg-blue-600 text-white px-5 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {running ? 'Zoeken…' : 'Zoek & importeer'}
          </button>
          <p className="text-xs text-neutral-400">
            Vereist een <code>GOOGLE_PLACES_API_KEY</code>. Zonder key: gebruik handmatige import.
          </p>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Plak bedrijven — één per regel: <code>naam, website, e-mail, plaats</code>
            </label>
            <textarea
              rows={8}
              className={`${input} w-full font-mono text-xs`}
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder={'Bakkerij Jansen, https://bakkerijjansen.nl, info@bakkerijjansen.nl, Utrecht\nKapper Kees, https://kapperkees.nl, , Amersfoort'}
            />
          </div>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={enrich} onChange={(e) => setEnrich(e.target.checked)} />
            Website scrapen als e-mail ontbreekt
          </label>
          <button
            onClick={() => run({ mode: 'manual', rows: parseRows(paste), enrich })}
            disabled={running || parseRows(paste).length === 0}
            className="rounded-lg bg-blue-600 text-white px-5 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {running ? 'Importeren…' : `Importeer ${parseRows(paste).length} bedrijven`}
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {summary && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 text-sm">
          <div className="font-medium text-green-800 mb-2">Klaar!</div>
          <div className="grid grid-cols-3 gap-3 text-neutral-700">
            <div><span className="font-semibold">{summary.found}</span> gevonden</div>
            <div><span className="font-semibold">{summary.created}</span> nieuw</div>
            <div><span className="font-semibold">{summary.updated}</span> bijgewerkt</div>
            <div><span className="font-semibold">{summary.withEmail}</span> met e-mail</div>
            <div><span className="font-semibold">{summary.outdated}</span> verouderde site</div>
            <div><span className="font-semibold">{summary.noWebsite}</span> zonder website</div>
          </div>
        </div>
      )}
    </div>
  );
}
