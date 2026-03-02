import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center glass rounded-full px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-tight">WebDiscovery</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          {isHome ? (
            <>
              <a href="#aanpak" className="hover:text-white transition-colors">Onze Aanpak</a>
              <a href="#tarief" className="hover:text-white transition-colors">Tarief</a>
            </>
          ) : (
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
          )}
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <Link to="/contact" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-white/90 transition-all">
          Start Project
        </Link>
      </div>
    </nav>
  );
};

export const Footer = () => (
  <footer className="py-20 px-6 border-t border-white/10">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
        </div>
        <span className="font-bold text-xl tracking-tight">WebDiscovery</span>
      </Link>
      
      <div className="flex flex-wrap justify-center gap-8 text-sm text-white/40">
        <Link to="/algemene-voorwaarden" className="hover:text-white transition-colors">Algemene Voorwaarden</Link>
        <Link to="/privacy-beleid" className="hover:text-white transition-colors">Privacy Beleid</Link>
        <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        <a href="mailto:info@webdiscovery.nl" className="hover:text-white transition-colors">info@webdiscovery.nl</a>
      </div>
      
      <p className="text-sm text-white/20">
        © {new Date().getFullYear()} WebDiscovery.nl — Alle rechten voorbehouden.
      </p>
    </div>
  </footer>
);
