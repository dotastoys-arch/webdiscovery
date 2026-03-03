import React from 'react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ExternalLink } from 'lucide-react';

const projects = [
  {
    title: "Legend Chinees Thais Indisch Restaurant",
    category: "Horeca Website",
    description: "Een sfeervolle en moderne website voor een veelzijdig Aziatisch restaurant, inclusief online reserveringsmogelijkheden en een overzichtelijk menu.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
    link: "https://legend.webdiscovery.nl"
  },
  {
    title: "EcoStyle Interiors",
    category: "E-commerce & Branding",
    description: "Een complete digitale transformatie voor een duurzaam interieurmerk. Van logo tot een conversie-gerichte webshop.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200",
    link: "#"
  },
  {
    title: "Nova Architecture",
    category: "Portfolio Website",
    description: "Een minimalistisch platform voor een architectenbureau waar hun projecten de hoofdrol spelen door middel van high-end fotografie.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
    link: "#"
  },
  {
    title: "Pulse Fitness App",
    category: "SaaS Landing Page",
    description: "Een dynamische en energieke landingspagina voor een nieuwe fitness applicatie, gericht op maximale app-downloads.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200",
    link: "#"
  },
  {
    title: "Luxe Travel Concierge",
    category: "Booking Platform",
    description: "Een exclusief boekingsplatform voor high-end reizen, met een focus op beleving en gebruiksgemak.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&q=80&w=1200",
    link: "#"
  }
];

const Portfolio = () => {
  return (
    <div className="pt-32 pb-20 px-6">
      <Helmet>
        <title>Portfolio — WebDiscovery</title>
        <meta name="description" content="Bekijk onze eerdere projecten en digitale transformaties." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h1 className="text-6xl md:text-8xl font-serif italic mb-8 text-brand-text">
            Onze <span className="not-italic font-sans font-extrabold">Projecten</span>
          </h1>
          <p className="text-xl text-brand-muted max-w-2xl leading-relaxed">
            Een selectie van digitale transformaties die we hebben gerealiseerd. Van start-ups tot gevestigde bedrijven, wij brengen elk merk naar het volgende niveau.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl mb-8 bg-brand-bg">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl transform scale-0 group-hover:scale-100 transition-transform duration-500">
                    <ExternalLink className="w-6 h-6 text-brand-text" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-2 block">
                    {project.category}
                  </span>
                  <h3 className="text-3xl font-serif italic mb-4 text-brand-text group-hover:text-brand-accent transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-brand-muted leading-relaxed mb-6 max-w-md">
                    {project.description}
                  </p>
                  <a 
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-brand-text hover:gap-4 transition-all"
                  >
                    Bekijk Website <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-12 md:p-20 rounded-[3rem] bg-brand-text text-white text-center"
        >
          <h2 className="text-4xl md:text-6xl font-serif italic mb-8">
            Klaar voor jouw <span className="not-italic font-sans font-extrabold">Upgrade?</span>
          </h2>
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
            Laten we samen kijken hoe we jouw bedrijf digitaal kunnen transformeren.
          </p>
          <a 
            href="/contact"
            className="inline-block bg-white text-brand-text px-10 py-5 rounded-full font-bold text-lg hover:bg-brand-bg transition-all shadow-xl"
          >
            Start Je Project
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Portfolio;
