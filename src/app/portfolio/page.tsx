import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';

export const metadata: Metadata = {
  title: 'Portfolio — WebDiscovery',
  description:
    'Ons werk in detail: wat we bouwen, wat het bijzonder maakt en wat het jou oplevert. Van op maat gemaakt CMS tot online betaalsysteem.',
};

const sokFeatures = [
  {
    t: 'Op maat gemaakt CMS',
    d: 'Een beheerpaneel volledig afgestemd op de vereniging. Teksten, leden, nieuws en de agenda worden zelf beheerd — zonder technische kennis of externe hulp.',
  },
  {
    t: 'Online betaalsysteem',
    d: 'Nieuwe leden schrijven zich online in en betalen hun contributie direct via iDEAL. Geen handmatig gedoe met facturen of overschrijvingen.',
  },
  {
    t: 'Ledenportaal',
    d: 'Leden loggen in, beheren hun gegevens en vinden alles op één plek. Dat scheelt het bestuur enorm veel administratie.',
  },
  {
    t: 'Kennisbank & rasinformatie',
    d: 'Uitgebreide informatie overzichtelijk gerangschikt en goed doorzoekbaar — de plek waar liefhebbers naartoe komen.',
  },
  {
    t: 'Evenementenagenda',
    d: 'Shows en bijeenkomsten altijd actueel, met aanmelden in één klik.',
  },
  {
    t: 'Snel & vindbaar',
    d: 'Bliksemsnel, mobielvriendelijk en zo opgebouwd dat de site goed gevonden wordt in Google én AI-zoekmachines.',
  },
];

const concepts = [
  {
    img: '/img/voorbeeld-restaurant.jpg',
    t: 'Restaurant',
    d: 'Online reserveren, een altijd actuele menukaart en sfeervolle foto’s die honger opwekken.',
  },
  {
    img: '/img/voorbeeld-kapsalon.jpg',
    t: 'Kapsalon',
    d: 'Direct online een afspraak boeken, met een strakke uitstraling die vertrouwen wekt.',
  },
  {
    img: '/img/voorbeeld-aannemer.jpg',
    t: 'Aannemer',
    d: 'Een projectgalerij die vakmanschap toont en een offerteknop die leads oplevert.',
  },
];

export default function PortfolioPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Intro */}
        <section className="mx-auto max-w-[1200px] px-6 pt-16 pb-10">
          <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-6">
            <span className="w-8 h-px bg-[var(--accent)]" />
            Portfolio
          </div>
          <h1 className="font-display text-[clamp(2.6rem,7vw,5rem)] leading-[0.95] tracking-[-0.02em] max-w-3xl">
            Ons werk — en wat het <span className="italic text-[var(--accent)]">oplevert.</span>
          </h1>
          <p className="mt-6 text-lg text-[var(--ink)]/70 max-w-xl leading-relaxed">
            We bouwen geen &ldquo;kale&rdquo; websites, maar complete systemen die werk uit handen nemen.
            Hieronder een echt project — en wat dat zo waardevol maakt.
          </p>
        </section>

        {/* SOK case study */}
        <section className="hair-t hair-b bg-[var(--paper-2)]">
          <div className="mx-auto max-w-[1200px] px-6 py-20">
            <div className="grid lg:grid-cols-12 gap-10 items-start">
              {/* Visual */}
              <div className="lg:col-span-6">
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
                  <div className="p-10" style={{ background: 'linear-gradient(135deg,#16294d,#0f1d38)' }}>
                    <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#c9a25a' }}>
                      Rasclub · opgericht 1980
                    </div>
                    <div className="mt-3 text-white text-3xl leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                      Rasclub voor Siamezen &amp; Oosterse Korthaar
                    </div>
                    <div className="mt-6 inline-block text-xs font-semibold px-4 py-2 rounded" style={{ background: '#c9a25a', color: '#16294d' }}>
                      Word lid
                    </div>
                  </div>
                </a>
                <div className="mt-6">
                  <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-2">Het project</div>
                  <h2 className="font-display text-3xl mb-3">SOK van Neocat</h2>
                  <p className="text-[var(--ink)]/70 leading-relaxed">
                    Een landelijke rasvereniging voor Siamese en Oosterse Korthaar katten, opgericht in
                    1980. Wij bouwden een moderne website die niet alleen mooi is, maar het bestuur ook
                    dagelijks werk uit handen neemt.
                  </p>
                  <a
                    href="https://sokvanneocat.nl"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.14em] link-underline"
                  >
                    Bekijk de live site →
                  </a>
                </div>
              </div>

              {/* Benefits */}
              <div className="lg:col-span-6">
                <h3 className="font-display text-2xl md:text-3xl mb-6">
                  Wat deze website <span className="italic text-[var(--accent)]">bijzonder</span> maakt
                </h3>
                <div className="divide-y divide-[var(--hair)]">
                  {sokFeatures.map((f) => (
                    <div key={f.t} className="py-5 flex gap-4">
                      <span className="text-[var(--accent)] text-lg leading-none mt-1">✦</span>
                      <div>
                        <div className="font-semibold">{f.t}</div>
                        <p className="text-sm text-[var(--ink)]/65 leading-relaxed mt-0.5">{f.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Waarom dit voor jou telt */}
        <section className="mx-auto max-w-[1200px] px-6 py-20">
          <div className="grid md:grid-cols-12 gap-8">
            <h2 className="md:col-span-5 font-display text-3xl md:text-4xl leading-[1.05] tracking-[-0.02em]">
              Waarom dit ook voor <span className="italic text-[var(--accent)]">jouw bedrijf</span> telt
            </h2>
            <div className="md:col-span-6 md:col-start-7 space-y-4 text-[var(--ink)]/75 leading-relaxed">
              <p>
                Zo&apos;n complete website betekent: minder administratie, meer aanvragen en klanten die
                24/7 zelf kunnen boeken of betalen. Jij houdt tijd over voor je vak.
              </p>
              <p>
                En omdat alles op maat en zelf te beheren is, betaal je niet elke maand voor dure
                losse tools of externe hulp. <strong className="text-[var(--ink)]">Één systeem, volledig van jou.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Branche-concepten */}
        <section className="hair-t bg-[var(--paper-2)]">
          <div className="mx-auto max-w-[1200px] px-6 py-20">
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em]">Voor elke branche</h2>
              <span className="text-[12px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">Concepten</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {concepts.map((c) => (
                <div key={c.t} className="rounded-2xl border border-[var(--hair)] overflow-hidden bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.img} alt={`Voorbeeldwebsite voor een ${c.t.toLowerCase()}`} className="w-full aspect-[16/10] object-cover" />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{c.t}</span>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">Voorbeeld</span>
                    </div>
                    <p className="text-sm text-[var(--ink)]/65 leading-relaxed">{c.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1200px] px-6 py-24 text-center">
          <h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.02em]">
            Wil je zo&apos;n website <span className="italic text-[var(--accent)]">voor jouw bedrijf?</span>
          </h2>
          <p className="mt-6 text-[var(--ink)]/70 max-w-lg mx-auto">
            Compleet, zelf te beheren en vanaf €500,-. Vraag vrijblijvend een ontwerp aan — je ziet
            precies wat je krijgt, nog vóór je iets betaalt.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/offerte"
              className="inline-flex items-center gap-3 bg-[var(--ink)] text-[var(--paper)] px-8 py-4 text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--accent)] transition-colors"
            >
              Bestel je website →
            </Link>
            <Link href="/#prijs" className="text-[13px] uppercase tracking-[0.14em] link-underline py-4">
              Bekijk de prijs
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
