'use client';

import { useState } from 'react';

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard geblokkeerd */
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={value}
        onFocus={(e) => e.target.select()}
        className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
      />
      <button onClick={copy} className="shrink-0 rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800">
        {copied ? 'Gekopieerd ✓' : 'Kopieer'}
      </button>
      <a href={value} target="_blank" rel="noreferrer" className="shrink-0 text-sm text-indigo-600 hover:underline">
        Openen ↗
      </a>
    </div>
  );
}
