'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { EmailTemplate } from '@/types/db';

const VARS = ['company_name', 'preview_url', 'sender_name', 'kvk_number', 'unsubscribe_url'];

const stepLabel: Record<string, string> = {
  intro: 'Introductiemail',
  followup_2day: 'Opvolgmail (na 2 dagen)',
};

export function TemplateEditor({ template }: { template: EmailTemplate }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(template.subject);
  const [bodyHtml, setBodyHtml] = useState(template.body_html);
  const [bodyText, setBodyText] = useState(template.body_text ?? '');
  const [active, setActive] = useState(template.is_active);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  async function save() {
    setStatus('saving');
    const res = await fetch('/api/admin/templates/update', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: template.id,
        subject,
        body_html: bodyHtml,
        body_text: bodyText,
        is_active: active,
      }),
    });
    if (res.ok) {
      setStatus('saved');
      router.refresh();
    } else setStatus('idle');
  }

  const input =
    'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50"
      >
        <div>
          <div className="text-sm font-semibold">{stepLabel[template.step] ?? template.step}</div>
          <div className="text-xs text-neutral-500 mt-0.5">{subject}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium ${active ? 'text-emerald-600' : 'text-neutral-400'}`}>
            {active ? 'actief' : 'uit'}
          </span>
          <span className="text-neutral-400 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-neutral-100 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Onderwerp</label>
            <input className={input} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bericht (HTML)</label>
            <textarea rows={10} className={`${input} font-mono text-xs`} value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Platte-tekst versie (optioneel)</label>
            <textarea rows={5} className={`${input} font-mono text-xs`} value={bodyText} onChange={(e) => setBodyText(e.target.value)} />
          </div>

          <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2.5">
            <div className="text-xs font-medium text-indigo-900 mb-1.5">Beschikbare velden (klik om in te voegen in het bericht):</div>
            <div className="flex flex-wrap gap-1.5">
              {VARS.map((v) => (
                <button
                  key={v}
                  onClick={() => setBodyHtml((b) => `${b}{{${v}}}`)}
                  className="rounded-md bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 text-[11px] font-mono hover:bg-indigo-100"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="rounded" />
            Sjabloon actief (wordt gebruikt bij verzenden)
          </label>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={save}
              disabled={status === 'saving'}
              className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {status === 'saving' ? 'Opslaan…' : 'Opslaan'}
            </button>
            {status === 'saved' && <span className="text-sm text-emerald-600">Opgeslagen ✓</span>}
          </div>
        </div>
      )}
    </div>
  );
}
