'use client';

import { useState } from 'react';

interface Summary {
  eligible: number;
  sent: number;
  skipped: number;
  failed: number;
  emailConfigured: boolean;
}

export function OutreachButton() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!confirm('Nu intro-mails versturen naar nieuwe leads met een e-mailadres?')) return;
    setLoading(true);
    setError(null);
    setSummary(null);
    const res = await fetch('/api/admin/outreach/run', { method: 'POST' });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) setSummary(j);
    else setError(j.error ?? 'Mislukt');
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 mb-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-medium">Outreach draaien</div>
          <p className="text-sm text-neutral-500">
            Zet automatisch een preview klaar en mailt nieuwe leads (met daglimiet).
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Bezig…' : 'Verstuur intro-mails'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      {summary && !summary.emailConfigured && (
        <p className="text-sm text-amber-700 mt-3">
          E-mail is nog niet geconfigureerd. Zet <code>RESEND_API_KEY</code> + <code>MAIL_FROM</code> in Vercel.
        </p>
      )}
      {summary && summary.emailConfigured && (
        <div className="text-sm text-neutral-700 mt-3 flex gap-5">
          <span><strong>{summary.sent}</strong> verstuurd</span>
          <span><strong>{summary.eligible}</strong> in aanmerking</span>
          <span><strong>{summary.skipped}</strong> overgeslagen</span>
          <span><strong>{summary.failed}</strong> mislukt</span>
        </div>
      )}
    </div>
  );
}
