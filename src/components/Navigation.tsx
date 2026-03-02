import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center glass rounded-full px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-text rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-tight text-brand-text">WebDiscovery</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-muted">
          <Link to="/#aanpak" className="hover:text-brand-text transition-colors">Onze Aanpak</Link>
          <Link to="/#tarief" className="hover:text-brand-text transition-colors">Tarief</Link>
          <Link to="/contact" className="hover:text-brand-text transition-colors">Contact</Link>
        </div>
        <Link to="/contact" className="bg-brand-text text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-brand-text/90 transition-all shadow-sm">
          Start Project
        </Link>
      </div>
    </nav>
  );
};

export const Footer = () => (
  <footer className="py-20 px-6 border-t border-black/5 bg-white/30">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-text rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
        </div>
        <span className="font-bold text-xl tracking-tight text-brand-text">WebDiscovery</span>
      </Link>
      
      <div className="flex flex-wrap justify-center gap-8 text-sm text-brand-muted">
        <Link to="/algemene-voorwaarden" className="hover:text-brand-text transition-colors">Algemene Voorwaarden</Link>
        <Link to="/privacy-beleid" className="hover:text-brand-text transition-colors">Privacy Beleid</Link>
        <Link to="/contact" className="hover:text-brand-text transition-colors">Contact</Link>
      </div>
      
      <p className="text-sm text-brand-muted/60">
        © {new Date().getFullYear()} WebDiscovery.nl — Alle rechten voorbehouden.
      </p>
    </div>
  </footer>
);
