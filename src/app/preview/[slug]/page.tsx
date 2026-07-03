import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { siteContentSchema } from '@/lib/generate/schema';
import { MODULES, type ModuleId } from '@/lib/modules';

export const dynamic = 'force-dynamic';

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Supabase nog niet gekoppeld? Toon een nette melding i.p.v. crashen.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500 p-8 text-center">
        Preview vereist een gekoppelde database (Supabase).
      </div>
    );
  }

  const db = createAdminClient();
  const { data: site } = await db
    .from('generated_sites')
    .select('*')
    .eq('preview_slug', slug)
    .maybeSingle();

  if (!site) notFound();

  const parsed = siteContentSchema.safeParse(site.content);
  if (!parsed.success) notFound();
  const c = parsed.data;
  const accent = c.theme.accent || '#2563eb';
  const modules = (site.modules as ModuleId[]) ?? [];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Concept-balk van WebDiscovery */}
      <div className="bg-neutral-900 text-white text-sm">
        <div className="mx-auto max-w-5xl px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <span>
            ✨ Concept gemaakt door <strong>WebDiscovery</strong> voor {c.brand.name}
          </span>
          <Link href="/offerte" className="rounded-full bg-white text-neutral-900 px-4 py-1.5 text-xs font-semibold hover:bg-neutral-100">
            Deze website bestellen
          </Link>
        </div>
      </div>

      {/* Nav */}
      <header className="border-b border-neutral-100">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-lg">{c.brand.name}</span>
          <span className="text-sm text-neutral-500">{c.contact.phone ?? c.contact.city}</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
        <div className="mx-auto max-w-5xl px-6 py-24 text-white">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">{c.hero.headline}</h1>
          <p className="mt-5 text-lg text-white/90 max-w-xl">{c.hero.subheadline}</p>
          <span className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold" style={{ color: accent }}>
            {c.hero.ctaLabel}
          </span>
        </div>
      </section>

      {/* Highlights */}
      {c.highlights.length > 0 && (
        <section className="border-b border-neutral-100">
          <div className="mx-auto max-w-5xl px-6 py-6 flex flex-wrap justify-center gap-x-10 gap-y-2 text-sm font-medium text-neutral-700">
            {c.highlights.map((h) => (
              <span key={h}>✓ {h}</span>
            ))}
          </div>
        </section>
      )}

      {/* Over */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">{c.about.title}</h2>
        <p className="text-neutral-600 leading-relaxed">{c.about.body}</p>
      </section>

      {/* Diensten */}
      {c.services.length > 0 && (
        <section className="bg-neutral-50 border-y border-neutral-100">
          <div className="mx-auto max-w-5xl px-6 py-16 grid md:grid-cols-3 gap-6">
            {c.services.map((s) => (
              <div key={s.title} className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="w-8 h-1.5 rounded-full mb-4" style={{ background: accent }} />
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-600">{s.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modules inbegrepen */}
      {modules.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-14 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-4">
            Inbegrepen in deze website
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {modules.map((m) => (
              <span key={m} className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium">
                {MODULES[m]?.label ?? m}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="border-t border-neutral-100 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 py-12 text-center text-sm text-neutral-600">
          {c.contact.email && <div>{c.contact.email}</div>}
          {c.contact.phone && <div>{c.contact.phone}</div>}
          {(c.contact.address || c.contact.city) && (
            <div>{[c.contact.address, c.contact.city].filter(Boolean).join(', ')}</div>
          )}
        </div>
      </section>

      {/* WebDiscovery-footer */}
      <footer className="bg-neutral-900 text-neutral-400 text-center text-xs py-6">
        Dit is een concept-website gemaakt door WebDiscovery.{' '}
        <Link href="/offerte" className="text-white underline">Bestel deze website</Link>
      </footer>
    </div>
  );
}
