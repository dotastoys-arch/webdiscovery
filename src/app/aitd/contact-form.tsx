'use client';

import { useState } from 'react';

// Contactformulier voor de AITD-one-pager; post naar /api/aitd-contact.
export function ContactForm({ disabled }: { disabled?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    setStatus('sending');
    setError(null);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const res = await fetch('/api/aitd-contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => null);

    if (res?.ok) {
      setStatus('done');
      form.reset();
    } else {
      const j = res ? await res.json().catch(() => ({})) : {};
      setError(j.error ?? 'Something went wrong. Please try again later.');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="border border-white/20 bg-white/5 p-8" role="status">
        <h3 className="text-xl font-bold">Thank you — your message has been sent.</h3>
        <p className="mt-2 text-slate-300">We will get back to you as soon as possible.</p>
      </div>
    );
  }

  const field =
    'w-full rounded-sm border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-[#8FB4D9] focus:outline-none focus:ring-1 focus:ring-[#8FB4D9]';
  const label = 'mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8FB4D9]';

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Honeypot — verborgen voor mensen */}
      <input type="text" name="nickname" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="aitd-name" className={label}>Name *</label>
          <input id="aitd-name" name="name" required autoComplete="name" className={field} />
        </div>
        <div>
          <label htmlFor="aitd-org" className={label}>Organisation</label>
          <input id="aitd-org" name="organisation" autoComplete="organization" className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="aitd-email" className={label}>Email *</label>
        <input id="aitd-email" name="email" type="email" required autoComplete="email" className={field} />
      </div>
      <div>
        <label htmlFor="aitd-message" className={label}>How can we help? *</label>
        <textarea id="aitd-message" name="message" required minLength={10} rows={5} className={field} />
      </div>

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">Your details are used only to respond to your enquiry.</p>
        <button
          type="submit"
          disabled={disabled || status === 'sending'}
          className="rounded-sm bg-white px-7 py-3.5 text-sm font-semibold text-[#0B2E52] transition hover:bg-slate-100 disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
