'use client';

import { useState } from 'react';

export function OfferteForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setStatus('done');
      form.reset();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Er ging iets mis. Probeer het later opnieuw.');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-green-800">Bedankt voor je aanvraag!</h2>
        <p className="text-sm text-green-700 mt-2">
          We nemen zo snel mogelijk contact met je op — vaak binnen één werkdag.
        </p>
      </div>
    );
  }

  const input =
    'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Honeypot — verborgen voor mensen */}
      <input
        type="text"
        name="nickname"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Naam *</label>
          <input name="name" required className={input} placeholder="Jouw naam" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bedrijf</label>
          <input name="company" className={input} placeholder="Bedrijfsnaam" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">E-mail *</label>
          <input name="email" type="email" required className={input} placeholder="jij@bedrijf.nl" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefoon</label>
          <input name="phone" className={input} placeholder="06 …" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Huidige website (indien aanwezig)</label>
        <input name="website" className={input} placeholder="https://…" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Waar kunnen we mee helpen?</label>
        <textarea name="message" rows={4} className={input} placeholder="Vertel kort wat je zoekt…" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-lg bg-neutral-900 text-white px-6 py-3 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
      >
        {status === 'sending' ? 'Versturen…' : 'Verstuur aanvraag'}
      </button>
      <p className="text-xs text-neutral-400">
        We gebruiken je gegevens alleen om contact op te nemen. Zie ons{' '}
        <a href="/privacy" className="underline">privacybeleid</a>.
      </p>
    </form>
  );
}
