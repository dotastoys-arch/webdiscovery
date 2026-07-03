import Link from 'next/link';
import type { SiteContent } from '@/lib/generate/schema';
import { MODULES, type ModuleId } from '@/lib/modules';

// Rendert een gegenereerde concept-website in de kleur van de klant.
export function PreviewSite({ content: c, modules }: { content: SiteContent; modules: ModuleId[] }) {
  const accent = c.theme.accent || '#2563eb';
  const tint = accent + '14'; // ~8% opacity
  const navSections = [
    { id: 'over', label: 'Over ons' },
    { id: 'diensten', label: 'Diensten' },
    ...(c.menu.length ? [{ id: 'menu', label: 'Menu' }] : []),
    ...(c.reviews.length ? [{ id: 'reviews', label: 'Reviews' }] : []),
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Concept-balk van WebDiscovery */}
      <div className="bg-neutral-900 text-white text-sm">
        <div className="mx-auto max-w-6xl px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <span>✨ Concept gemaakt door <strong>WebDiscovery</strong> voor {c.brand.name}</span>
          <Link href="/offerte" className="rounded-full bg-white text-neutral-900 px-4 py-1.5 text-xs font-semibold hover:bg-neutral-100">
            Deze website bestellen
          </Link>
        </div>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-neutral-100 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: accent }}>{c.brand.name}</span>
          <nav className="hidden md:flex items-center gap-7 text-sm text-neutral-600">
            {navSections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="hover:text-neutral-900">{s.label}</a>
            ))}
            <a href="#contact" className="rounded-full px-4 py-2 text-white text-sm font-medium" style={{ background: accent }}>
              {c.hero.ctaLabel}
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 text-white">
          <div className="text-xs uppercase tracking-widest text-white/70 mb-4">{c.brand.tagline}</div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl leading-[1.05]">{c.hero.headline}</h1>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-xl">{c.hero.subheadline}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#contact" className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold" style={{ color: accent }}>
              {c.hero.ctaLabel}
            </a>
            {c.hero.ctaSecondary && (
              <a href="#over" className="rounded-full border border-white/60 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10">
                {c.hero.ctaSecondary}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Highlights bar */}
      {c.highlights.length > 0 && (
        <section className="border-b border-neutral-100">
          <div className="mx-auto max-w-6xl px-6 py-5 flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm font-medium text-neutral-700">
            {c.highlights.map((h) => (
              <span key={h} className="flex items-center gap-2">
                <span style={{ color: accent }}>✓</span> {h}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      {c.stats.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {c.stats.map((s) => (
              <div key={s.label} className="rounded-2xl p-8" style={{ background: tint }}>
                <div className="text-4xl font-bold" style={{ color: accent }}>{s.value}</div>
                <div className="text-sm text-neutral-600 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Over */}
      <section id="over" className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">{c.about.title}</h2>
        <p className="text-neutral-600 leading-relaxed text-lg">{c.about.body}</p>
      </section>

      {/* Diensten */}
      {c.services.length > 0 && (
        <section id="diensten" className="bg-neutral-50 border-y border-neutral-100">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-3xl font-bold text-center mb-12">Wat we doen</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {c.services.map((s) => (
                <div key={s.title} className="rounded-2xl border border-neutral-200 bg-white p-8">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-white text-lg" style={{ background: accent }}>
                    ✦
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Menu (horeca) */}
      {c.menu.length > 0 && (
        <section id="menu" className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-10">Onze kaart</h2>
          <div className="divide-y divide-neutral-100">
            {c.menu.map((m) => (
              <div key={m.name} className="py-4 flex items-baseline justify-between gap-4">
                <div>
                  <div className="font-semibold">{m.name}</div>
                  {m.description && <div className="text-sm text-neutral-500">{m.description}</div>}
                </div>
                {m.price && <div className="font-semibold shrink-0" style={{ color: accent }}>{m.price}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      {c.reviews.length > 0 && (
        <section id="reviews" className="bg-neutral-50 border-y border-neutral-100">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-3xl font-bold text-center mb-12">Wat klanten zeggen</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {c.reviews.map((r) => (
                <div key={r.name} className="rounded-2xl border border-neutral-200 bg-white p-7">
                  <div className="mb-3" style={{ color: accent }}>★★★★★</div>
                  <p className="text-neutral-700 leading-relaxed">“{r.text}”</p>
                  <div className="mt-4 text-sm font-medium text-neutral-500">— {r.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Inbegrepen modules */}
      {modules.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-5">Deze website bevat</p>
          <div className="flex flex-wrap justify-center gap-3">
            {modules.map((m) => (
              <span key={m} className="rounded-full px-4 py-2 text-sm font-medium border" style={{ borderColor: accent, color: accent, background: tint }}>
                {MODULES[m]?.label ?? m}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Openingstijden + Contact */}
      <section id="contact" className="border-t border-neutral-100">
        <div className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-2 gap-12">
          {c.openingHours.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Openingstijden</h2>
              <div className="divide-y divide-neutral-100">
                {c.openingHours.map((o) => (
                  <div key={o.day} className="py-3 flex justify-between text-sm">
                    <span className="text-neutral-600">{o.day}</span>
                    <span className="font-medium">{o.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold mb-6">Contact</h2>
            <div className="space-y-2 text-neutral-700">
              {c.contact.email && <div>✉️ {c.contact.email}</div>}
              {c.contact.phone && <div>📞 {c.contact.phone}</div>}
              {(c.contact.address || c.contact.city) && (
                <div>📍 {[c.contact.address, c.contact.city].filter(Boolean).join(', ')}</div>
              )}
            </div>
            <a href="#" className="mt-6 inline-block rounded-full px-6 py-3 text-white text-sm font-semibold" style={{ background: accent }}>
              {c.hero.ctaLabel}
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {c.faq.length > 0 && (
        <section className="bg-neutral-50 border-t border-neutral-100">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <h2 className="text-3xl font-bold text-center mb-10">Veelgestelde vragen</h2>
            <div className="space-y-3">
              {c.faq.map((f) => (
                <details key={f.q} className="rounded-xl border border-neutral-200 bg-white p-5 group">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                    {f.q}
                    <span className="group-open:rotate-45 transition-transform" style={{ color: accent }}>+</span>
                  </summary>
                  <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Slot-CTA */}
      {c.cta && (
        <section className="text-white" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">{c.cta.title}</h2>
            {c.cta.subtitle && <p className="mt-4 text-white/90 text-lg">{c.cta.subtitle}</p>}
            <a href="#contact" className="mt-8 inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold" style={{ color: accent }}>
              {c.cta.buttonLabel}
            </a>
          </div>
        </section>
      )}

      {/* WebDiscovery-footer */}
      <footer className="bg-neutral-900 text-neutral-400 text-center text-xs py-8 px-6">
        <p>
          Dit is een concept-website gemaakt door WebDiscovery.{' '}
          <Link href="/offerte" className="text-white underline">Bestel deze website</Link>
        </p>
      </footer>
    </div>
  );
}
