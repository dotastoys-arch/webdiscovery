import Link from 'next/link';
import { SiteFooter } from '@/components/site-chrome';
import { Logo } from '@/components/logo';

const tickerWords = [
  'Webdesign', 'Rebranding', 'Boekingssystemen', 'Webshops', 'CMS',
  'AI-vindbaarheid', 'Offertes', 'Hosting', 'Onderhoud',
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ───────── Nav ───────── */}
      <header className="sticky top-0 z-40 hair-b bg-[var(--paper)]/90 backdrop-blur-md">
        <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-10 text-[13px] uppercase tracking-[0.14em]">
            <Link href="/" className="link-underline">Home</Link>
            <a href="#werk" className="link-underline">Diensten</a>
            <Link href="/portfolio" className="link-underline">Portfolio</Link>
            <a href="#prijs" className="link-underline">Prijs</a>
          </nav>
          <Link
            href="/offerte"
            className="text-[13px] uppercase tracking-[0.14em] border border-[var(--ink)] px-5 py-2.5 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
          >
            Offerte
          </Link>
        </div>
      </header>

      {/* ───────── Hero ───────── */}
      <section className="mx-auto max-w-[1200px] px-6">
        <div className="grid lg:grid-cols-12 gap-8 pt-20 pb-14">
          <div className="lg:col-span-9">
            <div className="reveal flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-[var(--ink-soft)]" style={{ animationDelay: '0ms' }}>
              <span className="w-8 h-px bg-[var(--accent)]" />
              Erkend Nederlands webbureau · KvK
            </div>
            <h1 className="reveal font-display font-light leading-[0.92] tracking-[-0.02em] mt-6 text-[clamp(2.8rem,8.5vw,7rem)]" style={{ animationDelay: '90ms' }}>
              Websites die
              <br />
              <span className="italic text-[var(--accent)]">verkopen</span> — gebouwd
              <br />
              voor het AI-tijdperk.
            </h1>
            <p className="reveal mt-8 max-w-xl text-lg leading-relaxed text-[var(--ink)]/80" style={{ animationDelay: '180ms' }}>
              Een complete website mét de tools die jouw branche nodig heeft — boekingen,
              offertes, webshop, CMS. Zó gebouwd dat je álles zelf beheert, en gevonden wordt
              door mens én AI.
            </p>
            <div className="reveal mt-10 flex flex-wrap items-center gap-4" style={{ animationDelay: '270ms' }}>
              <Link
                href="/offerte"
                className="group inline-flex items-center gap-3 bg-[var(--ink)] text-[var(--paper)] px-7 py-4 text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--accent)] transition-colors"
              >
                Gratis ontwerp aanvragen
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <a href="#werk" className="text-[13px] uppercase tracking-[0.14em] link-underline py-4">
                Bekijk het werk
              </a>
            </div>
          </div>

          {/* Editorial index-kolom */}
          <div className="lg:col-span-3 lg:border-l border-[var(--hair)] lg:pl-8 flex flex-col justify-end reveal" style={{ animationDelay: '360ms' }}>
            <div className="font-display text-6xl leading-none">€500</div>
            <div className="mt-1 text-[13px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              introductieprijs
            </div>
            <p className="mt-4 text-sm text-[var(--ink)]/70 leading-relaxed">
              Onze startprijs voor een compleet portfolio. Deze prijs gaat binnenkort omhoog.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Hero-beeld ───────── */}
      <section className="mx-auto max-w-[1200px] px-6 pb-12">
        <div className="rounded-2xl overflow-hidden border border-[var(--hair)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/hero.jpg" alt="" className="w-full h-[240px] md:h-[440px] object-cover" />
        </div>
      </section>

      {/* ───────── Marquee ───────── */}
      <div className="hair-t hair-b py-4 overflow-hidden">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {tickerWords.map((w) => (
                <span key={w} className="flex items-center font-display text-2xl px-8">
                  {w}
                  <span className="ml-16 text-[var(--accent)]">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ───────── Diensten (editorial genummerd) ───────── */}
      <section id="werk" className="mx-auto max-w-[1200px] px-6 py-24">
        <div className="flex items-baseline justify-between mb-12">
          <h2 className="font-display text-4xl md:text-5xl tracking-[-0.02em]">Wat we doen</h2>
          <span className="text-[13px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">01 — 03</span>
        </div>
        <div>
          {[
            { n: '01', t: 'Webdesign', d: 'Een strak, professioneel ontwerp dat past bij jouw bedrijf — snel, mobiel en gebouwd om te scoren.' },
            { n: '02', t: 'Rebranding', d: 'Verouderde uitstraling? Wij vernieuwen je merk zodat je er weer modern en betrouwbaar uitziet.' },
            { n: '03', t: 'AI-vindbaarheid', d: 'Technisch zo opgebouwd dat AI-assistenten je begrijpen en aanbevelen — klaar voor hoe mensen nú zoeken.' },
          ].map((s) => (
            <div key={s.n} className="group hair-t py-10 grid md:grid-cols-12 gap-6 items-baseline hover:bg-[var(--paper-2)] transition-colors -mx-6 px-6">
              <div className="md:col-span-1 text-[13px] tracking-[0.2em] text-[var(--accent)]">{s.n}</div>
              <h3 className="md:col-span-4 font-display text-3xl md:text-4xl group-hover:italic transition-all">{s.t}</h3>
              <p className="md:col-span-6 md:col-start-7 text-[var(--ink)]/70 leading-relaxed">{s.d}</p>
              <div className="md:col-span-1 text-right text-2xl opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]">→</div>
            </div>
          ))}
          <div className="hair-t" />
        </div>
      </section>

      {/* ───────── Compleet & zelf beheren ───────── */}
      <section id="compleet" className="hair-t hair-b bg-[var(--paper-2)]">
        <div className="mx-auto max-w-[1200px] px-6 py-24">
          <div className="grid md:grid-cols-12 gap-8 mb-14">
            <h2 className="md:col-span-7 font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em]">
              Compleet — en volledig <span className="italic text-[var(--accent)]">in eigen beheer.</span>
            </h2>
            <p className="md:col-span-4 md:col-start-9 self-end text-[var(--ink)]/70 leading-relaxed">
              Niet zomaar een website, maar alle tools die jouw branche nodig heeft. Dankzij het
              ingebouwde CMS pas je alles zélf aan — nooit meer afhankelijk van een externe partij.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-l border-t border-[var(--hair)]">
            {[
              { t: 'Boekingssysteem', d: 'Online afspraken met automatische bevestiging.' },
              { t: 'Offertesysteem', d: 'Bezoekers vragen direct een offerte aan.' },
              { t: 'Webshop', d: 'Producten verkopen met veilige iDEAL-betaling.' },
              { t: 'Online betaalsysteem', d: 'Betalingen, inschrijvingen of contributie direct via iDEAL.' },
              { t: 'Op maat gemaakt CMS', d: 'Een beheerpaneel op maat — alles zelf aanpassen.' },
              { t: 'Reserveringen & menu', d: 'Voor horeca: altijd actuele kaart.' },
              { t: 'Reviews & galerij', d: 'Toon je beste werk en beoordelingen.' },
            ].map((m, i) => (
              <div key={m.t} className="border-r border-b border-[var(--hair)] p-8 hover:bg-[var(--paper)] transition-colors">
                <div className="text-[13px] tracking-[0.2em] text-[var(--accent)] mb-4">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-display text-2xl mb-2">{m.t}</h3>
                <p className="text-sm text-[var(--ink)]/65 leading-relaxed">{m.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-[var(--ink-soft)]">
            We stemmen de modules af op jouw branche — je betaalt alleen voor wat je nodig hebt.
          </p>
        </div>
      </section>

      {/* ───────── Ons werk ───────── */}
      <section id="portfolio" className="hair-t bg-[var(--paper-2)]">
        <div className="mx-auto max-w-[1200px] px-6 py-24">
          <div className="flex items-baseline justify-between mb-12">
            <h2 className="font-display text-4xl md:text-5xl tracking-[-0.02em]">Ons werk</h2>
            <span className="text-[13px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">Live projecten</span>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Browser-mockup van sokvanneocat.nl in hun eigen kleuren */}
            <a
              href="https://sokvanneocat.nl"
              target="_blank"
              rel="noreferrer"
              className="group block rounded-2xl border border-[var(--hair)] bg-white shadow-xl overflow-hidden hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-center gap-1.5 px-4 h-9 border-b border-neutral-200 bg-neutral-50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-3 text-[11px] text-neutral-400">sokvanneocat.nl</span>
              </div>
              <div className="p-8" style={{ background: 'linear-gradient(135deg,#16294d,#0f1d38)' }}>
                <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#c9a25a' }}>
                  Rasclub · opgericht 1980
                </div>
                <div className="mt-3 text-white text-2xl leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  Rasclub voor Siamezen &amp; Oosterse Korthaar
                </div>
                <div className="mt-6 inline-block text-xs font-semibold px-4 py-2 rounded" style={{ background: '#c9a25a', color: '#16294d' }}>
                  Word lid
                </div>
              </div>
            </a>
            {/* Beschrijving */}
            <div>
              <h3 className="font-display text-3xl mb-3">SOK van Neocat</h3>
              <p className="text-[var(--ink)]/70 leading-relaxed mb-5">
                Een moderne website voor een landelijke rasvereniging voor Siamese en Oosterse
                Korthaar katten. Met ledeninformatie, een kennisbank, evenementen en online
                aanmelden — verzorgd, snel en makkelijk zelf te beheren.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Op maat CMS', 'Online betalen', 'Ledenportaal', 'Evenementen'].map((t) => (
                  <span key={t} className="text-xs rounded-full border border-[var(--hair)] px-3 py-1 text-[var(--ink)]/70">{t}</span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <a
                  href="https://sokvanneocat.nl"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.14em] link-underline"
                >
                  Bekijk de live site →
                </a>
                <Link href="/portfolio" className="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.14em] link-underline">
                  Volledig portfolio →
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ───────── AI pull-quote ───────── */}
      <section className="mx-auto max-w-[1200px] px-6 py-28">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-2 text-[13px] uppercase tracking-[0.2em] text-[var(--ink-soft)] pt-4">
            Klaar voor de toekomst
          </div>
          <blockquote className="md:col-span-10 font-display text-3xl md:text-[2.8rem] leading-[1.15] tracking-[-0.01em]">
            <span className="text-[var(--accent)]">“</span>Welke bakker in de buurt heeft goede
            reviews?<span className="text-[var(--accent)]">”</span>
            <span className="block mt-6 text-xl md:text-2xl text-[var(--ink)]/60 font-sans not-italic tracking-normal leading-relaxed">
              Dít is hoe mensen nú zoeken — via AI, niet via tien blauwe links. Wij zorgen dat jouw
              bedrijf het antwoord ís.
            </span>
          </blockquote>
        </div>
      </section>

      {/* ───────── Prijs ───────── */}
      <section id="prijs" className="hair-t bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto max-w-[1200px] px-6 py-24 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5">
            <div className="inline-block text-[12px] uppercase tracking-[0.2em] text-[var(--accent)] border border-[var(--accent)] px-3 py-1">
              Introductieprijs
            </div>
            <div className="mt-6 font-display text-[clamp(4rem,14vw,9rem)] leading-none">€500</div>
            <div className="text-[13px] uppercase tracking-[0.14em] text-[var(--paper)]/60 mt-2">
              eenmalig · complete website, live gezet
            </div>
            <p className="mt-6 text-[var(--paper)]/80 leading-relaxed border-l-2 border-[var(--accent)] pl-4">
              Let op: dit is onze introductieprijs. De prijs gaat in de toekomst omhoog —
              stap nu in en profiteer.
            </p>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <div className="flex items-baseline gap-2 font-display">
              <span className="text-4xl">vanaf €15</span>
              <span className="text-[var(--paper)]/50 text-lg">/mnd</span>
            </div>
            <p className="text-[var(--paper)]/50 text-sm mt-1">hosting, CMS, boekingssysteem &amp; onderhoud</p>
            <p className="mt-5 text-[var(--paper)]/90 leading-relaxed border-l-2 border-[var(--accent)] pl-4">
              <strong>Geen omkijken.</strong> Wij ontzorgen álles — hosting, updates, back-ups,
              beveiliging en onderhoud. Jij runt je bedrijf, wij houden je website in topvorm.
            </p>
            <ul className="mt-8 divide-y divide-white/10">
              {['Compleet ontwerp op maat', 'Branche-tools inbegrepen', 'Zelf te beheren via CMS', 'Vindbaar in Google én AI'].map((t) => (
                <li key={t} className="py-3.5 flex items-center gap-3 text-[var(--paper)]/90">
                  <span className="text-[var(--accent)]">✦</span> {t}
                </li>
              ))}
            </ul>
            <Link
              href="/offerte"
              className="mt-8 inline-flex items-center gap-3 bg-[var(--accent)] text-[var(--paper)] px-7 py-4 text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--paper)] hover:text-[var(--ink)] transition-colors"
            >
              Vraag een gratis ontwerp aan →
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Geen verrassingen ───────── */}
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="rounded-2xl border border-[var(--hair)] bg-[var(--paper-2)] px-8 py-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em]">
              Alles inbegrepen. <span className="italic text-[var(--accent)]">Geen verrassingen.</span>
            </h2>
            <p className="mt-3 text-[var(--ink)]/70">Wat je ziet, is wat je krijgt — één heldere prijs, verder niets.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { t: 'Geen addertjes', d: 'Geen kleine lettertjes of verborgen voorwaarden.' },
              { t: 'Geen add-ons', d: 'Geen losse modules die je alsnog moet bijkopen.' },
              { t: 'Geen plugins', d: 'Geen extra software om zelf te installeren of bij te houden.' },
              { t: 'Geen extra kosten', d: 'Geen verrassingen op de rekening — vooraf duidelijk.' },
            ].map((x) => (
              <div key={x.t} className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full border border-[var(--accent)] flex items-center justify-center text-[var(--accent)] mb-3 text-lg">✕</div>
                <div className="font-semibold">{x.t}</div>
                <p className="text-sm text-[var(--ink)]/60 mt-1">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Partners ───────── */}
      <section className="hair-b">
        <div className="mx-auto max-w-[1200px] px-6 py-12">
          <p className="text-center text-[12px] uppercase tracking-[0.25em] text-[var(--ink-soft)] mb-8">
            Wij werken samen met
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-5">
            {['Mollie', 'Cal.com', 'Google', 'WhatsApp', 'Shopify'].map((p) => (
              <span key={p} className="font-display text-2xl text-[var(--ink)]/45">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA-band ───────── */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 text-center">
        <h2 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] tracking-[-0.02em]">
          Klaar voor een website
          <br />
          die <span className="italic text-[var(--accent)]">écht</span> werkt?
        </h2>
        <p className="mt-6 text-[var(--ink)]/70 max-w-lg mx-auto">
          Vraag vrijblijvend een ontwerp aan. Je ziet precies wat je krijgt — nog vóór je iets betaalt.
        </p>
        <Link
          href="/offerte"
          className="mt-10 inline-flex items-center gap-3 bg-[var(--ink)] text-[var(--paper)] px-8 py-4 text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--accent)] transition-colors"
        >
          Start vandaag →
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
