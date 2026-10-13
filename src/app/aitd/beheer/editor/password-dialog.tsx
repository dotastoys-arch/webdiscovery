'use client';

import { useState } from 'react';
import { inputCls } from './fields';

export function PasswordDialog({ onClose }: { onClose: () => void }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    if (f.next !== f.repeat) return setMsg({ ok: false, text: 'De nieuwe wachtwoorden zijn niet hetzelfde.' });
    setBusy(true);
    const res = await fetch('/api/aitd/account/password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ current: f.current, next: f.next }),
    }).catch(() => null);
    const j = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (res?.ok) {
      setMsg({ ok: true, text: 'Je wachtwoord is gewijzigd.' });
      e.currentTarget?.reset();
    } else setMsg({ ok: false, text: j.error ?? 'Wijzigen mislukt.' });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-6" onMouseDown={onClose}>
      <form
        onSubmit={onSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-2xl"
      >
        <h2 className="text-base font-bold text-[#0B2E52]">Wachtwoord wijzigen</h2>
        <input name="current" type="password" required autoComplete="current-password" placeholder="Huidig wachtwoord" className={inputCls} />
        <input name="next" type="password" required autoComplete="new-password" placeholder="Nieuw wachtwoord (min. 10 tekens)" className={inputCls} />
        <input name="repeat" type="password" required autoComplete="new-password" placeholder="Nieuw wachtwoord herhalen" className={inputCls} />
        {msg && <p className={`text-sm ${msg.ok ? 'text-emerald-700' : 'text-red-600'}`}>{msg.text}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Sluiten
          </button>
          <button type="submit" disabled={busy} className="rounded-md bg-[#0B2E52] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? 'Bezig…' : 'Wijzigen'}
          </button>
        </div>
      </form>
    </div>
  );
}
