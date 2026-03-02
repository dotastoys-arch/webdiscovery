/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Server, 
  Zap, 
  Layout, 
  Smartphone, 
  Palette,
  ChevronRight,
  Star
} from 'lucide-react';

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
    <div className="max-w-7xl mx-auto flex justify-between items-center glass rounded-full px-6 py-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
        </div>
        <span className="font-bold text-xl tracking-tight">WebDiscovery</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
        <a href="#aanpak" className="hover:text-white transition-colors">Onze Aanpak</a>
        <a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a>
        <a href="#tarief" className="hover:text-white transition-colors">Tarief</a>
      </div>
      <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-white/90 transition-all">
        Start Project
      </button>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
    {/* Background elements */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-10 animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />
    
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center max-w-4xl"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/60 mb-8">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Beschikbaar voor nieuwe transformaties
      </div>
      
      <h1 className="text-5xl md:text-8xl font-serif italic mb-8 leading-[1.1] text-gradient">
        Geef je bedrijf de <br />
        <span className="not-italic font-sans font-bold">Digitale Upgrade</span>
      </h1>
      
      <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
        Wij bouwen high-end websites die converteren. Van een verouderde look naar een complete rebranding. Alles inclusief voor een vast bedrag.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform group">
          Bekijk Mogelijkheden
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <div className="flex items-center gap-4 px-6 py-4 rounded-full border border-white/10 bg-white/5">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center overflow-hidden">
                <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-white text-white" />)}
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">50+ Bedrijven geholpen</p>
          </div>
        </div>
      </div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 1 }}
      className="mt-20 w-full max-w-6xl aspect-video glass rounded-2xl overflow-hidden relative group"
    >
      <img 
        src="https://picsum.photos/seed/webdesign/1200/800" 
        alt="Dashboard Preview" 
        className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="p-8 glass rounded-2xl max-w-md text-center">
          <h3 className="text-2xl font-bold mb-2">Rebranding Focus</h3>
          <p className="text-white/60 text-sm">Wij transformeren uw huidige identiteit naar een modern, digitaal meesterwerk.</p>
        </div>
      </div>
    </motion.div>
  </section>
);

const Features = () => {
  const features = [
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Complete Rebranding",
      desc: "Niet alleen een website, maar een frisse look die past bij de ambities van uw bedrijf."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile First",
      desc: "Perfecte weergave op elk apparaat. Snel, responsief en gebruiksvriendelijk."
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: "Hosting & Domein",
      desc: "Geen gedoe met technische instellingen. Wij regelen de hosting en de domeinkoppeling."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Bliksemsnel",
      desc: "Geoptimaliseerde code voor de beste prestaties en een hogere positie in zoekmachines."
    }
  ];

  return (
    <section id="aanpak" className="py-32 px-6 bg-white text-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-serif italic mb-8">
              Waarom genoegen nemen met <span className="not-italic font-sans font-bold">gemiddeld?</span>
            </h2>
            <p className="text-xl text-black/60 mb-12 leading-relaxed">
              Veel bedrijven hebben een website die hun professionaliteit niet weerspiegelt. Wij vullen dat gat door high-end design toegankelijk te maken.
            </p>
            <div className="space-y-6">
              {features.map((f, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-2xl border border-black/5 hover:bg-black/5 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{f.title}</h4>
                    <p className="text-black/60 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <img 
                src="https://picsum.photos/seed/creative/800/1000" 
                alt="Creative Process" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 p-8 bg-black text-white rounded-3xl max-w-xs shadow-2xl">
              <p className="text-3xl font-serif italic mb-2">"De eerste indruk is alles."</p>
              <p className="text-white/50 text-sm">— WebDiscovery Team</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Pricing = () => (
  <section id="tarief" className="py-32 px-6 relative overflow-hidden">
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-4xl md:text-6xl font-bold mb-8">Eén vast bedrag. <br /><span className="text-white/40">Geen verrassingen.</span></h2>
      
      <div className="mt-16 p-12 glass rounded-[40px] relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest">
          All-in Pakket
        </div>
        
        <div className="mb-8">
          <span className="text-8xl font-bold">€499</span>
          <span className="text-white/40 ml-2">excl. BTW</span>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4 text-left mb-12">
          {[
            "Maatwerk Webdesign",
            "Complete Rebranding",
            "Hosting Setup",
            "Domeinnaam Koppeling",
            "SEO Optimalisatie",
            "Mobiel Vriendelijk",
            "Contactformulier",
            "SSL Certificaat"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-white/70">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        
        <button className="w-full bg-white text-black py-6 rounded-2xl font-bold text-xl hover:scale-[1.02] transition-transform">
          Claim Jouw Nieuwe Website
        </button>
        
        <p className="mt-6 text-white/40 text-sm">
          Inclusief 1 jaar hosting & domein. Daarna slechts €15/maand.
        </p>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-20 px-6 border-t border-white/10">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
        </div>
        <span className="font-bold text-xl tracking-tight">WebDiscovery</span>
      </div>
      
      <div className="flex gap-8 text-sm text-white/40">
        <a href="#" className="hover:text-white transition-colors">Algemene Voorwaarden</a>
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="mailto:info@webdiscovery.nl" className="hover:text-white transition-colors">info@webdiscovery.nl</a>
      </div>
      
      <p className="text-sm text-white/20">
        © {new Date().getFullYear()} WebDiscovery.nl — Alle rechten voorbehouden.
      </p>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen selection:bg-white selection:text-black">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}
