import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';

export const metadata: Metadata = {
  title: 'Privacybeleid — WebDiscovery',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-2xl w-full px-6 py-16 prose-sm">
        <h1 className="font-display text-4xl md:text-5xl tracking-[-0.02em] mb-2">Privacybeleid</h1>
        <p className="text-sm text-neutral-500 mb-8">Laatst bijgewerkt: juli 2026</p>

        <div className="space-y-6 text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="font-semibold text-neutral-900 mb-1">1. Wie wij zijn</h2>
            <p>
              WebDiscovery (KvK <strong>[VUL IN]</strong>), gevestigd te <strong>[ADRES, PLAATS]</strong>,
              is verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in dit
              beleid. Contact: <a href="mailto:info@webdiscovery.nl" className="underline">info@webdiscovery.nl</a>.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-1">2. Welke gegevens wij verwerken</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gegevens die je zelf verstrekt via ons offerteformulier (naam, e-mail, telefoon, bedrijf, bericht).</li>
              <li>Zakelijke contactgegevens die openbaar beschikbaar zijn, wanneer wij je benaderen met een aanbod.</li>
              <li>Technische gegevens over e-mailinteractie (of een e-mail geopend/aangeklikt is).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-1">3. Waarvoor en op welke grondslag</h2>
            <p>
              Wij gebruiken je gegevens om contact met je op te nemen, een voorstel te doen en onze
              dienst te leveren. De grondslag is uitvoering van een overeenkomst of ons gerechtvaardigd
              belang (zakelijke acquisitie), waarbij wij jouw belangen respecteren.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-1">4. Afmelden</h2>
            <p>
              Elke commerciële e-mail bevat een afmeldlink. Na afmelding sturen wij je geen berichten
              meer en plaatsen wij je op onze uitsluitingslijst.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-1">5. Bewaartermijn</h2>
            <p>Wij bewaren gegevens niet langer dan nodig voor de hierboven genoemde doelen.</p>
          </section>

          <section>
            <h2 className="font-semibold text-neutral-900 mb-1">6. Jouw rechten</h2>
            <p>
              Je hebt recht op inzage, correctie en verwijdering van je gegevens. Stuur hiervoor een
              e-mail naar info@webdiscovery.nl. Je kunt ook een klacht indienen bij de Autoriteit
              Persoonsgegevens.
            </p>
          </section>

          <p className="text-xs text-neutral-400 border-t border-neutral-100 pt-4">
            Let op: dit is een basistekst. Laat je definitieve privacybeleid controleren voordat je
            live gaat — dit is geen juridisch advies.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
