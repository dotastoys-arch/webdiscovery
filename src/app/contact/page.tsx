import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { OfferteForm } from '../offerte/offerte-form';

export const metadata: Metadata = {
  title: 'Contact — WebDiscovery',
  description: 'Neem contact op met WebDiscovery. Erkend Nederlands webbureau. We reageren vaak binnen één werkdag.',
};

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="hair-t py-5">
      <div className="text-[12px] uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-1">{label}</div>
      <div className="text-lg">{children}</div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-[1200px] w-full px-6 py-16">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Links: intro + gegevens */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-6">
              <span className="w-8 h-px bg-[var(--accent)]" />
              Neem contact op
            </div>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.02em]">
              Laten we
              <br />
              <span className="italic text-[var(--accent)]">kennismaken.</span>
            </h1>
            <p className="mt-6 text-[var(--ink)]/70 leading-relaxed max-w-sm">
              Vragen, een idee of meteen een ontwerp aanvragen? Vul het formulier in of mail ons
              direct — we reageren vaak binnen één werkdag.
            </p>

            <div className="mt-10">
              <Detail label="E-mail">
                <a href="mailto:info@webdiscovery.nl" className="link-underline">info@webdiscovery.nl</a>
              </Detail>
              <Detail label="Telefoon">
                <a href="tel:+31852129077" className="link-underline">+31 85 212 90 77</a>
              </Detail>
              <Detail label="Adres">
                Pijlspitskreek 3, 2241 MT Wassenaar
                <div className="text-sm text-[var(--ink)]/50 mt-1">Postadres — geen bezoekadres</div>
              </Detail>
              <Detail label="KvK · BTW">
                96004177 · NL005189518B08
              </Detail>
              <Detail label="Reactietijd">
                Meestal binnen één werkdag
              </Detail>
            </div>
          </div>

          {/* Rechts: formulier */}
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="rounded-2xl border border-[var(--hair)] bg-white/60 p-8">
              <h2 className="font-display text-2xl mb-6">Stuur ons een bericht</h2>
              <OfferteForm />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
