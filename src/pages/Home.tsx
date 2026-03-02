import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  ArrowRight, 
  CheckCircle2, 
  Server, 
  Zap, 
  Smartphone, 
  Palette,
  Star
} from 'lucide-react';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Webdesign & Rebranding Pakket",
  "provider": {
    "@type": "Organization",
    "name": "WebDiscovery",
    "url": "https://webdiscovery.nl"
  },
  "description": "Complete online transformatie voor ondernemers. Inclusief maatwerk webdesign, rebranding, hosting en domeinnaam.",
  "offers": {
    "@type": "Offer",
    "price": "499.00",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  }
};

const Hero = () => (
  <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
    <SEO 
      title="Home" 
      description="WebDiscovery bouwt high-end websites die converteren. Van een verouderde look naar een complete rebranding voor een vast bedrag van €499."
      canonical="/"
    />
    <script type="application/ld+json">
      {JSON.stringify(structuredData)}
    </script>
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl -z-10 animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />
    
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center max-w-4xl"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/5 text-xs font-medium text-brand-muted mb-8 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
        Beschikbaar voor nieuwe transformaties
      </div>
      
      <h1 className="text-5xl md:text-8xl font-serif italic mb-8 leading-[1.1] text-gradient">
        Geef je bedrijf de <br />
        <span className="not-italic font-sans font-bold">Digitale Upgrade</span>
      </h1>
      
      <p className="text-lg md:text-xl text-brand-muted mb-12 max-w-2xl mx-auto leading-relaxed">
        Wij bouwen high-end websites die converteren. Van een verouderde look naar een complete rebranding. Alles inclusief voor een vast bedrag.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/contact" className="btn-primary flex items-center justify-center gap-2 group">
          Bekijk Mogelijkheden
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <div className="flex items-center gap-4 px-6 py-4 rounded-full border border-black/5 bg-white shadow-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-brand-bg flex items-center justify-center overflow-hidden">
                <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-brand-accent text-brand-accent" />)}
            </div>
            <p className="text-[10px] text-brand-muted uppercase tracking-widest font-bold">50+ Bedrijven geholpen</p>
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
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="p-8 glass rounded-2xl max-w-md text-center">
          <h3 className="text-2xl font-bold mb-2">Rebranding Focus</h3>
          <p className="text-brand-muted text-sm">Wij transformeren uw huidige identiteit naar een modern, digitaal meesterwerk.</p>
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
    <section id="aanpak" className="py-32 px-6 bg-white text-brand-text">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-serif italic mb-8">
              Waarom genoegen nemen met <span className="not-italic font-sans font-bold">gemiddeld?</span>
            </h2>
            <p className="text-xl text-brand-muted mb-12 leading-relaxed">
              Veel bedrijven hebben een website die hun professionaliteit niet weerspiegelt. Wij vullen dat gat door high-end design toegankelijk te maken.
            </p>
            <div className="space-y-6">
              {features.map((f, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-2xl border border-black/5 hover:bg-brand-bg transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-brand-text text-white flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{f.title}</h4>
                    <p className="text-brand-muted text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://picsum.photos/seed/creative/800/1000" 
                alt="Creative Process" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 p-8 bg-brand-text text-white rounded-3xl max-w-xs shadow-2xl">
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
      <h2 className="text-4xl md:text-6xl font-bold mb-8">Eén vast bedrag. <br /><span className="text-brand-muted/60">Geen verrassingen.</span></h2>
      
      <div className="mt-16 p-12 glass rounded-[40px] relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-text text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg">
          All-in Pakket
        </div>
        
        <div className="mb-8">
          <span className="text-8xl font-bold">€499</span>
          <span className="text-brand-muted ml-2">excl. BTW</span>
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
            <div key={i} className="flex items-center gap-3 text-brand-muted">
              <CheckCircle2 className="w-5 h-5 text-brand-accent" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        
        <Link to="/contact" className="btn-primary flex items-center justify-center">
          Claim Jouw Nieuwe Website
        </Link>
        
        <p className="mt-6 text-brand-muted text-sm">
          Inclusief 1 jaar hosting & domein. Daarna slechts €15/maand.
        </p>
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Pricing />
    </div>
  );
}
