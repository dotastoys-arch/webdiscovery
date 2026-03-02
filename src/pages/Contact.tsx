import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function Contact() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-serif italic mb-6">Neem Contact Op</h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Klaar voor een transformatie? Laat een bericht achter en we nemen binnen 24 uur contact met je op.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 md:p-12 rounded-[40px]"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 ml-1">Naam</label>
                  <input 
                    type="text" 
                    placeholder="Je naam"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 ml-1">Bedrijfsnaam</label>
                  <input 
                    type="text" 
                    placeholder="Je bedrijf"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 ml-1">E-mailadres</label>
                <input 
                  type="email" 
                  placeholder="naam@bedrijf.nl"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 ml-1">Bericht</label>
                <textarea 
                  rows={5}
                  placeholder="Vertel ons over je project..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30 transition-colors resize-none"
                ></textarea>
              </div>
              <button className="w-full bg-white text-black py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                Verstuur Bericht
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="glass p-8 rounded-3xl flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-1">E-mail ons</h4>
                <p className="text-white/60 mb-2">Voor algemene vragen en offertes.</p>
                <a href="mailto:info@webdiscovery.nl" className="text-white font-medium hover:underline">info@webdiscovery.nl</a>
              </div>
            </div>

            <div className="glass p-8 rounded-3xl flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-1">WhatsApp</h4>
                <p className="text-white/60 mb-2">Snel antwoord op je vragen.</p>
                <a href="#" className="text-white font-medium hover:underline">+31 (0)6 12345678</a>
              </div>
            </div>

            <div className="glass p-8 rounded-3xl flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-1">Locatie</h4>
                <p className="text-white/60">Nederland — We werken volledig op afstand voor klanten door het hele land.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
