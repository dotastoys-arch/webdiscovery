import Link from 'next/link';

/** Het merkteken "Route-W": een W als ontdekkingsroute die eindigt in de
 *  vermiljoen vondst-stip. */
export function LogoMark({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <path
        d="M5 9 L9.5 23 L16 12.5 L22.5 23 L27 9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="9" r="2.8" style={{ fill: 'var(--accent)' }} />
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
