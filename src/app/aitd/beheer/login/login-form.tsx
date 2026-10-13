'use client';

import { useState } from 'react';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch('/api/aitd/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => null);
    if (res?.ok) {
      window.location.href = '/aitd/beheer';
      return;
    }
    const j = res ? await res.json().catch(() => ({})) : {};
    setError(j.error ?? 'Inloggen lukt nu niet. Probeer het later opnieuw.');
    setBusy(false);
  }

  const input =
    'w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:border-[#4479AB] focus:outline-none focus:ring-2 focus:ring-[#4479AB]/30';
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">E-mailadres</label>
        <input id="email" name="email" type="email" required autoComplete="username" className={input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Wachtwoord</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={input} />
      </div>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-[#0B2E52] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {busy ? 'Bezig…' : 'Inloggen'}
      </button>
    </form>
  );
}
