import React from 'react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function Terms() {
  return (
    <div className="pt-32 pb-20 px-6">
      <SEO 
        title="Algemene Voorwaarden" 
        description="Lees de algemene voorwaarden van WebDiscovery. Duidelijke afspraken over ons webdesign en rebranding pakket."
        canonical="/algemene-voorwaarden"
      />
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-slate max-w-none"
        >
          <h1 className="text-4xl md:text-6xl font-serif italic mb-12 text-brand-text">Algemene Voorwaarden</h1>
          
          <div className="space-y-8 text-brand-muted leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-brand-text mb-4">1. Definities</h2>
              <p>In deze algemene voorwaarden wordt verstaan onder:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>WebDiscovery:</strong> De gebruiker van deze algemene voorwaarden, gevestigd in Nederland.</li>
                <li><strong>Opdrachtgever:</strong> De natuurlijke persoon of rechtspersoon die met WebDiscovery een overeenkomst aangaat.</li>
                <li><strong>Overeenkomst:</strong> De afspraak tussen WebDiscovery en Opdrachtgever voor het leveren van diensten.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-text mb-4">2. Toepasselijkheid</h2>
              <p>Deze voorwaarden zijn van toepassing op alle offertes, werkzaamheden en overeenkomsten tussen WebDiscovery en Opdrachtgever.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-text mb-4">3. Het Pakket (€499)</h2>
              <p>Het aangeboden pakket van €499 (excl. BTW) omvat:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ontwerp en realisatie van één website (maximaal 5 pagina's).</li>
                <li>Hosting en domeinnaamregistratie voor het eerste jaar.</li>
                <li>Basis SEO optimalisatie.</li>
              </ul>
              <p className="mt-4">Na het eerste jaar wordt de hosting en domeinnaam automatisch verlengd tegen een tarief van €15 per maand (jaarlijks gefactureerd), tenzij de opdrachtgever uiterlijk één maand voor het einde van de looptijd schriftelijk opzegt.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-text mb-4">4. Betaling</h2>
              <p>Betaling dient te geschieden binnen 14 dagen na factuurdatum. WebDiscovery is gerechtigd om de werkzaamheden op te schorten indien de betalingstermijn wordt overschreden.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand-text mb-4">5. Intellectueel Eigendom</h2>
              <p>Na volledige betaling gaan de eigendomsrechten van het ontwerp over op de Opdrachtgever. WebDiscovery behoudt het recht om de opgeleverde website te gebruiken voor eigen promotiedoeleinden en portfolio.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
