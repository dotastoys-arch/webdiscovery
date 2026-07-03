import Link from 'next/link';
import { LogoMark } from './logo';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-slate-900">
          <span className="text-indigo-600"><LogoMark className="w-7 h-7" /></span>
          WebDiscovery
        </Link>
        <nav className="flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/#features" className="hidden sm:inline hover:text-slate-900">Wat je krijgt</Link>
          <Link href="/portfolio" className="hidden sm:inline hover:text-slate-900">Portfolio</Link>
          <Link href="/#prijs" className="hidden sm:inline hover:text-slate-900">Prijs</Link>
          <Link href="/offerte" className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 hover:opacity-90 transition shadow-lg shadow-indigo-600/20">
            Gratis ontwerp
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
              <span className="text-indigo-600"><LogoMark className="w-6 h-6" /></span> WebDiscovery
            </div>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Complete websites, gebouwd voor het AI-tijdperk. Erkend Nederlands webbureau.
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <div className="font-semibold text-slate-900 mb-3">Menu</div>
              <ul className="space-y-2 text-slate-500">
                <li><Link href="/#features" className="hover:text-slate-900">Wat je krijgt</Link></li>
                <li><Link href="/portfolio" className="hover:text-slate-900">Portfolio</Link></li>
                <li><Link href="/offerte" className="hover:text-slate-900">Offerte</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-slate-900 mb-3">Juridisch</div>
              <ul className="space-y-2 text-slate-500">
                <li><Link href="/contact" className="hover:text-slate-900">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-slate-900">Privacy</Link></li>
                <li><Link href="/voorwaarden" className="hover:text-slate-900">Voorwaarden</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} WebDiscovery · Wassenaar, NL</span>
          <span>KvK 96004177 · BTW NL005189518B08</span>
        </div>
      </div>
    </footer>
  );
}
