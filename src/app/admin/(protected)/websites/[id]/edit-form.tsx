'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface EditFields {
  tagline: string;
  accent: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  aboutTitle: string;
  aboutBody: string;
}

const labels: { key: keyof EditFields; label: string; textarea?: boolean }[] = [
  { key: 'headline', label: 'Hero-kop' },
  { key: 'subheadline', label: 'Hero-subtekst', textarea: true },
  { key: 'ctaLabel', label: 'Knoptekst (CTA)' },
  { key: 'tagline', label: 'Slogan' },
  { key: 'aboutTitle', label: 'Over — titel' },
  { key: 'aboutBody', label: 'Over — tekst', textarea: true },
];

export function EditForm({ siteId, initial, previewUrl }: { siteId: string; initial: EditFields; previewUrl: string | null }) {
  const router = useRouter();
  const [fields, setFields] = useState<EditFields>(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  function set(key: keyof EditFields, v: string) {
    setFields((f) => ({ ...f, [key]: v }));
    setStatus('idle');
  }

  async function save() {
    setStatus('saving');
    const res = await fetch('/api/admin/websites/update', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ siteId, fields }),
    });
    if (res.ok) {
      setStatus('saved');
      router.refresh();
    } else setStatus('idle');
  }

  const input = 'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
      {labels.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium mb-1">{f.label}</label>
          {f.textarea ? (
            <textarea rows={3} className={input} value={fields[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          ) : (
            <input className={input} value={fields[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          )}
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium mb-1">Accentkleur</label>
        <div className="flex items-center gap-3">
          <input type="color" value={fields.accent} onChange={(e) => set('accent', e.target.value)} className="w-10 h-9 rounded border border-neutral-300" />
          <input className={`${input} w-32`} value={fields.accent} onChange={(e) => set('accent', e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={save} disabled={status === 'saving'} className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {status === 'saving' ? 'Opslaan…' : 'Opslaan'}
        </button>
        {status === 'saved' && <span className="text-sm text-emerald-600">Opgeslagen ✓</span>}
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline ml-auto">Bekijk preview ↗</a>
        )}
      </div>
    </div>
  );
}
