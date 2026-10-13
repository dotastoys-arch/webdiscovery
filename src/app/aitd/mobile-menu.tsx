'use client';

import { useState } from 'react';

const links = [
  { href: '#services', label: 'Services' },
  { href: '#approach', label: 'Approach' },
  { href: '#focus', label: 'Focus' },
  { href: '#contact', label: 'Contact' },
];

// Uitklapmenu voor kleine schermen (op desktop staan de links in de header).
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="aitd-mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="flex h-11 w-11 items-center justify-center rounded-sm border border-slate-200 text-[#0B2E52]"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div
          id="aitd-mobile-nav"
          className="absolute inset-x-0 top-full border-b border-slate-200 bg-white shadow-lg"
        >
          <ul className="mx-auto max-w-6xl px-6 py-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-slate-100 py-4 text-base font-semibold text-[#0B2E52] last:border-0"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
