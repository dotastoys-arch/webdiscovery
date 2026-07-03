import Link from 'next/link';
import { Logo, LogoMark } from './logo';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 hair-b bg-[var(--paper)]/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-8 text-[13px] uppercase tracking-[0.14em]">
          <Link href="/#werk" className="hidden sm:inline link-underline">Diensten</Link>
          <Link href="/#prijs" className="hidden sm:inline link-underline">Prijs</Link>
          <Link
            href="/offerte"
            className="border border-[var(--ink)] px-5 py-2.5 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
          >
            Offerte
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="hair-t bg-[var(--paper)]">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <LogoMark className="w-8 h-8" />
              <div className="font-display text-3xl tracking-tight">
                Web<span className="italic">Discovery</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--ink)]/60 leading-relaxed max-w-xs">
              Premium webdesign & rebranding, gebouwd voor het AI-tijdperk. Erkend Nederlands
              webbureau.
            </p>
          </div>
          <div className="md:col-span-3 md:col-start-7">
            <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-4">Menu</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/#werk" className="link-underline">Diensten</Link></li>
              <li><Link href="/#prijs" className="link-underline">Prijs</Link></li>
              <li><Link href="/offerte" className="link-underline">Offerte</Link></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-4">Juridisch</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/privacy" className="link-underline">Privacy</Link></li>
              <li><Link href="/voorwaarden" className="link-underline">Voorwaarden</Link></li>
              <li><a href="mailto:info@webdiscovery.nl" className="link-underline">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 hair-t pt-6 flex items-center justify-between text-[12px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          <span>© {new Date().getFullYear()} WebDiscovery</span>
          <span>KvK-geregistreerd in Nederland</span>
        </div>
      </div>
    </footer>
  );
}
