import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';

export const metadata: Metadata = {
  title: 'Algemene voorwaarden — WebDiscovery',
};

export default function VoorwaardenPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-2xl w-full px-6 py-16">
        <h1 className="font-display text-4xl md:text-5xl tracking-[-0.02em] mb-2">Algemene voorwaarden</h1>
        <p className="text-sm text-neutral-500 mb-8">Laatst bijgewerkt: juli 2026</p>

        <div className="space-y-6 text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="font-semibold text-neutral-900 mb-1">1. Wie wij zijn</h2>
            <p>
              Deze voorwaarden gelden voor alle diensten van WebDiscovery (KvK <strong>96004177</strong>,
              BTW NL005189518B08), gevestigd te <strong>Pijlspitskreek 3, 2241 MT Wassenaar</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-1">2. Onze dienst</h2>
            <p>
              Wij ontwerpen en leveren websites en rebrandings. Een standaardwebsite kost €500,-
              (excl. eventuele domein- en hostingkosten van derden), tenzij schriftelijk anders
              overeengekomen.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-1">3. Aanbod en preview</h2>
            <p>
              Een door ons getoond ontwerp of preview is vrijblijvend en schept geen verplichting,
              tot je opdracht geeft en de betaling is voldaan.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-1">4. Betaling</h2>
            <p>
              Betaling verloopt via een beveiligde betaalomgeving (o.a. iDEAL). De website wordt live
              gezet na ontvangst van de betaling.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-1">5. Oplevering en domein</h2>
            <p>
              Na betaling koppelen wij je domein en zetten wij de website live, doorgaans binnen enkele
              werkdagen. Registratie van een domeinnaam kan via ons of via jouw eigen provider.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-1">6. Aansprakelijkheid</h2>
            <p>
              Onze aansprakelijkheid is beperkt tot het bedrag van de betreffende opdracht. Wij zijn
              niet aansprakelijk voor indirecte schade.
            </p>
          </section>

          <p className="text-xs text-neutral-400 border-t border-neutral-100 pt-4">
            Let op: dit is een basistekst. Laat je definitieve voorwaarden controleren voordat je live
            gaat — dit is geen juridisch advies.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
