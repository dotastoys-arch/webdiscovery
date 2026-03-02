import React from 'react';
import { motion } from 'motion/react';

export default function Privacy() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-invert max-w-none"
        >
          <h1 className="text-4xl md:text-6xl font-serif italic mb-12">Privacy Beleid</h1>
          
          <div className="space-y-8 text-white/70 leading-relaxed">
            <p>WebDiscovery respecteert de privacy van alle gebruikers van haar site en draagt er zorg voor dat de persoonlijke informatie die u ons verschaft vertrouwelijk wordt behandeld.</p>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Gebruik van persoonsgegevens</h2>
              <p>Wanneer u zich aanmeldt voor een van onze diensten vragen we u om persoonsgegevens te verstrekken. Deze gegevens worden gebruikt om de dienst uit te kunnen voeren. De gegevens worden opgeslagen op eigen beveiligde servers van WebDiscovery of die van een derde partij.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Communicatie</h2>
              <p>Wanneer u e-mail of andere berichten naar ons verzendt, is het mogelijk dat we die berichten bewaren. Soms vragen wij u naar uw persoonlijke gegevens die voor de desbetreffende situatie relevant zijn. Dit maakt het mogelijk uw vragen te verwerken en uw verzoeken te beantwoorden.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Cookies</h2>
              <p>Wij verzamelen gegevens voor onderzoek om zo een beter inzicht te krijgen in onze klanten, zodat wij onze diensten hierop kunnen afstemmen. Deze website maakt gebruik van "cookies" om de website te helpen analyseren hoe gebruikers de site gebruiken.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Derden</h2>
              <p>De informatie wordt niet met derden gedeeld. In enkele gevallen kan de informatie intern gedeeld worden. Onze werknemers zijn verplicht om de vertrouwelijkheid van uw gegevens te respecteren.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Vragen en feedback</h2>
              <p>We controleren regelmatig of we aan dit privacybeleid voldoen. Als u vragen heeft over dit privacybeleid, kunt u contact met ons opnemen via info@webdiscovery.nl.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
