import Link from 'next/link';

/** Het merkteken: ring (het web) · kern (jij) · vermiljoen stip (de discovery). */
export function LogoMark({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
      <circle cx="25" cy="9" r="3.2" style={{ fill: 'var(--accent)' }} />
    </svg>
  );
}

/** Het volledige logo-lockup: merkteken + woordmerk in de display-serif. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label="WebDiscovery">
      <LogoMark />
      <span className="font-display text-xl tracking-tight leading-none">
        Web<span className="italic">Discovery</span>
      </span>
    </Link>
  );
}
