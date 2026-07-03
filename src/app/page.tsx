import Link from 'next/link';
import { LogoMark } from '@/components/logo';

function Icon({ path, className = 'w-5 h-5' }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {path.split('|').map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
const ic = {
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6',
  cart: 'M6 6h15l-1.5 9h-12zM6 6 5 3H2M9 20a1 1 0 1 0 2 0 1 1 0 0 0-2 0M17 20a1 1 0 1 0 2 0 1 1 0 0 0-2 0',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  bolt: 'M13 2 3 14h7l-1 8 10-12h-7z',
  check: 'M20 6 9 17l-5-5',
  star: 'M12 3l2.9 5.9 6.1.9-4.5 4.4 1 6.3L12 17.8 6.5 20.5l1-6.3L3 9.8l6.1-.9z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="text-indigo-600"><LogoMark className="w-7 h-7" /></span>
            WebDiscovery
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900">Wat je krijgt</a>
            <Link href="/portfolio" className="hover:text-slate-900">Portfolio</Link>
            <a href="#prijs" className="hover:text-slate-900">Prijs</a>
          </nav>
          <Link href="/offerte" className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition shadow-lg shadow-indigo-600/20">
            Gratis ontwerp
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[900px] rounded-full bg-gradient-to-br from-indigo-200/60 via-violet-200/50 to-transparent blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Erkend Nederlands webbureau · gebouwd voor AI
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Complete websites voor mens én AI —{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">zodat jouw bedrijf gevonden wordt.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Wij bouwen alles-in-één websites voor lokale ondernemers: met boekingen, offertes, webshop
            en een CMS dat je volledig zelf beheert. Klaar om nieuwe klanten binnen te halen — vanaf €500,-.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-slate-600">
            {['Compleet met alle tools', 'Zelf te beheren', 'Vindbaar in Google én AI', 'Erkend NL webbureau'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><Icon path={ic.check} className="w-4 h-4 text-indigo-600" /> {t}</span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/offerte" className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-7 py-3.5 text-sm font-semibold hover:opacity-90 transition shadow-lg shadow-indigo-600/25">
              Vraag een gratis ontwerp aan
            </Link>
            <Link href="/portfolio" className="rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold hover:bg-slate-50 transition">
              Bekijk voorbeelden
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">Vrijblijvend · geen creditcard nodig</p>
        </div>

        {/* Product-mockup met zwevende kaarten */}
        <div className="mx-auto max-w-4xl px-6 pb-20">
          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-indigo-900/10 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 h-9 border-b border-slate-100 bg-slate-50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-3 text-[11px] text-slate-400">jouwbedrijf.nl</span>
              </div>
              <div className="p-6 bg-white">
                <div className="relative h-36 rounded-xl overflow-hidden mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/voorbeeld-kapsalon.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/85 to-violet-600/60" />
                  <div className="relative h-full flex flex-col justify-center px-6 text-white">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-white/80">Kapsalon · Wassenaar</span>
                    <span className="text-xl font-extrabold leading-tight">Salon Belle</span>
                    <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg bg-white text-indigo-700 px-3 py-1.5 text-xs font-bold">
                      <Icon path={ic.calendar} className="w-3.5 h-3.5" /> Boek online
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-left">
                  {[
                    { t: 'Openingstijden', d: 'Ma–za · 09–18u' },
                    { t: 'Knippen & kleuren', d: 'vanaf € 27,50' },
                    { t: 'Reviews', d: '★ 5.0 · 132 klanten' },
                  ].map((c) => (
                    <div key={c.t} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3">
                      <div className="text-[11px] font-semibold text-slate-800">{c.t}</div>
                      <div className="mt-1 text-[11px] text-slate-500">{c.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Zwevende kaarten */}
            <div className="hidden sm:flex absolute -top-5 -left-5 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xl">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Icon path={ic.calendar} className="w-4 h-4" /></span>
              <span className="text-xs font-semibold">Boekingssysteem</span>
            </div>
            <div className="hidden sm:flex absolute -bottom-5 -right-5 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xl">
              <span className="text-amber-400"><Icon path={ic.star} className="w-4 h-4 fill-amber-400" /></span>
              <span className="text-xs font-semibold">5.0 · echte reviews</span>
            </div>
            <div className="hidden md:flex absolute top-1/2 -right-8 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold">Live · zelf te beheren</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logo cloud */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Wij werken samen met</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-lg font-bold text-slate-400">
            {['Mollie', 'Cal.com', 'Google', 'WhatsApp', 'Shopify'].map((p) => <span key={p}>{p}</span>)}
          </div>
        </div>
      </section>

      {/* Showcase: echte voorbeelden */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-600 px-3 py-1 text-xs font-semibold">Voorbeelden</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">Zo bouwen we voor jouw branche</h2>
          <p className="mt-3 text-slate-600">Elke branche krijgt de juiste look en tools — hier een paar concepten.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { img: '/img/voorbeeld-restaurant.jpg', t: 'Restaurant' },
            { img: '/img/voorbeeld-kapsalon.jpg', t: 'Kapsalon' },
            { img: '/img/voorbeeld-aannemer.jpg', t: 'Aannemer' },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.img} alt={`Voorbeeldwebsite voor een ${x.t.toLowerCase()}`} className="w-full aspect-[16/10] object-cover" />
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="font-semibold text-sm">{x.t}</span>
                <span className="text-[11px] uppercase tracking-wide text-slate-400">Concept</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24 space-y-24">
        {[
          {
            tag: 'Compleet', icon: ic.cart,
            title: 'Alle tools die jouw branche nodig heeft',
            body: 'Boekingssysteem, offertesysteem, webshop, online betalen, menukaart, reviews — we stemmen de modules af op jouw branche. Eén website die écht werk uit handen neemt.',
            points: ['Boekingen & reserveringen', 'Offertes & online betalen', 'Webshop met iDEAL'],
          },
          {
            tag: 'Zelf beheren', icon: ic.edit,
            title: 'Een CMS op maat — nooit meer externe hulp',
            body: 'Pas teksten, foto’s, prijzen en openingstijden zelf aan via een eenvoudig paneel. Jij houdt de regie, wij zorgen voor hosting en onderhoud.',
            points: ['Alles zelf aanpassen', 'Geen technische kennis nodig', 'Hosting & updates inbegrepen'],
          },
          {
            tag: 'Vindbaar', icon: ic.search,
            title: 'Gevonden door mens én AI',
            body: 'Steeds meer mensen zoeken via AI in plaats van Google. Onze sites zijn zo opgebouwd dat AI-assistenten je begrijpen en aanbevelen — snel, mobiel en machine-leesbaar.',
            points: ['Bliksemsnel & mobielvriendelijk', 'Vindbaar in Google én AI', 'Klaar voor de toekomst'],
          },
        ].map((f, idx) => (
          <div key={f.title} className={`grid md:grid-cols-2 gap-12 items-center ${idx % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-600 px-3 py-1 text-xs font-semibold">
                <Icon path={f.icon} className="w-4 h-4" /> {f.tag}
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">{f.title}</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">{f.body}</p>
              <ul className="mt-6 space-y-3">
                {f.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0"><Icon path={ic.check} className="w-3 h-3" /></span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/50 p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3"><Icon path={f.icon} className="w-4 h-4" /></div>
                    <div className="h-2 w-16 rounded bg-slate-200 mb-1.5" />
                    <div className="h-2 w-10 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Prijs */}
      <section id="prijs" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-1 shadow-2xl shadow-indigo-600/30">
          <div className="rounded-[calc(1.5rem-4px)] bg-white p-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">Complete website, live gezet</span>
              <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold">Introductieprijs</span>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-extrabold tracking-tight">€500</span>
              <span className="text-slate-500 mb-1.5">eenmalig</span>
            </div>
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
              <strong>Let op:</strong> introductieprijs — deze gaat in de toekomst omhoog. Stap nu in.
            </div>
            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold">€15</span><span className="text-slate-500 text-sm">/mnd</span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">domeinnaam, hosting, CMS, boekingssysteem &amp; onderhoud — volledig ontzorgd</p>
            </div>
            <ul className="mt-6 space-y-2.5">
              {['Compleet ontwerp op maat', 'Branche-tools inbegrepen', 'Zelf te beheren via CMS', 'Vindbaar in Google én AI'].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Icon path={ic.check} className="w-4 h-4 text-indigo-600 shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <Link href="/offerte" className="mt-7 block text-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition">
              Vraag een gratis ontwerp aan
            </Link>
          </div>
        </div>
      </section>

      {/* Geen verrassingen */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-slate-50 border border-slate-100 px-8 py-12">
          <h2 className="text-center text-2xl md:text-3xl font-extrabold tracking-tight">Alles inbegrepen. Geen verrassingen.</h2>
          <p className="text-center text-slate-500 mt-2">Wat je ziet, is wat je krijgt — één heldere prijs.</p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { t: 'Geen addertjes', d: 'Geen kleine lettertjes of verborgen voorwaarden.' },
              { t: 'Geen add-ons', d: 'Geen losse modules die je moet bijkopen.' },
              { t: 'Geen plugins', d: 'Geen extra software om zelf te beheren.' },
              { t: 'Geen extra kosten', d: 'Vooraf duidelijk — geen verrassingen.' },
            ].map((x) => (
              <div key={x.t} className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full border-2 border-indigo-500 text-indigo-500 flex items-center justify-center mb-3 font-bold">✕</div>
                <div className="font-semibold">{x.t}</div>
                <p className="text-sm text-slate-500 mt-1">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio teaser */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <a href="https://sokvanneocat.nl" target="_blank" rel="noreferrer" className="group block rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden hover:-translate-y-1 transition">
            <div className="flex items-center gap-1.5 px-4 h-9 border-b border-slate-100 bg-slate-50">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="ml-3 text-[11px] text-slate-400">sokvanneocat.nl</span>
            </div>
            <div className="p-8" style={{ background: 'linear-gradient(135deg,#16294d,#0f1d38)' }}>
              <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#c9a25a' }}>Rasclub · opgericht 1980</div>
              <div className="mt-3 text-white text-2xl leading-tight" style={{ fontFamily: 'Georgia, serif' }}>Rasclub voor Siamezen &amp; Oosterse Korthaar</div>
              <div className="mt-6 inline-block text-xs font-semibold px-4 py-2 rounded" style={{ background: '#c9a25a', color: '#16294d' }}>Word lid</div>
            </div>
          </a>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-600 px-3 py-1 text-xs font-semibold">Ons werk</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">SOK van Neocat</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">Een complete website voor een landelijke rasvereniging — met ledenportaal, online betalen, kennisbank en een CMS op maat. Alles zelf te beheren.</p>
            <Link href="/portfolio" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">Bekijk het volledige portfolio →</Link>
          </div>
        </div>
      </section>

      {/* CTA-band */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-16 text-center text-white">
          <div className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Klaar voor een website die werkt?</h2>
          <p className="mt-3 text-indigo-100 max-w-xl mx-auto">Vraag vrijblijvend een ontwerp aan — je ziet precies wat je krijgt, nog vóór je iets betaalt.</p>
          <Link href="/offerte" className="mt-8 inline-block rounded-full bg-white text-indigo-600 px-8 py-3.5 text-sm font-semibold hover:bg-indigo-50 transition shadow-lg">Start vandaag</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 font-bold text-lg">
                <span className="text-indigo-600"><LogoMark className="w-6 h-6" /></span> WebDiscovery
              </div>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">Complete websites, gebouwd voor het AI-tijdperk. Erkend Nederlands webbureau.</p>
            </div>
            <div className="flex gap-12 text-sm">
              <div>
                <div className="font-semibold mb-3">Menu</div>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#features" className="hover:text-slate-900">Wat je krijgt</a></li>
                  <li><Link href="/portfolio" className="hover:text-slate-900">Portfolio</Link></li>
                  <li><Link href="/offerte" className="hover:text-slate-900">Offerte</Link></li>
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-3">Juridisch</div>
                <ul className="space-y-2 text-slate-500">
                  <li><Link href="/contact" className="hover:text-slate-900">Contact</Link></li>
                  <li><Link href="/privacy" className="hover:text-slate-900">Privacy</Link></li>
                  <li><Link href="/voorwaarden" className="hover:text-slate-900">Voorwaarden</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} WebDiscovery · Wassenaar, NL</span>
            <span>KvK 96004177 · BTW NL005189518B08</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
