import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Onze Aanpak', path: '/#aanpak', isHash: true },
    { name: 'Tarief', path: '/#tarief', isHash: true },
    { name: 'Portfolio', path: '/portfolio', isHash: false },
    { name: 'Contact', path: '/contact', isHash: false },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center glass rounded-full px-4 md:px-6 py-3">
        <Link to="/" className="flex items-center gap-2 z-50">
          <div className="w-8 h-8 bg-brand-text rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-tight text-brand-text">WebDiscovery</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-brand-muted">
          {navLinks.map((link) => (
            link.isHash ? (
              <HashLink 
                key={link.name}
                smooth 
                to={link.path} 
                className="hover:text-brand-text transition-colors"
              >
                {link.name}
              </HashLink>
            ) : (
              <Link 
                key={link.name}
                to={link.path} 
                className="hover:text-brand-text transition-colors"
              >
                {link.name}
              </Link>
            )
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/contact" className="hidden sm:block bg-brand-text text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-brand-text/90 transition-all shadow-md hover:shadow-lg">
            Start Project
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-brand-text z-50"
            aria-label="Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white z-40 md:hidden flex flex-col items-center justify-center p-6"
          >
            <div className="flex flex-col items-center gap-8 text-center">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {link.isHash ? (
                    <HashLink 
                      smooth 
                      to={link.path} 
                      className="text-3xl font-serif italic text-brand-text"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </HashLink>
                  ) : (
                    <Link 
                      to={link.path} 
                      className="text-3xl font-serif italic text-brand-text"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="mt-4"
              >
                <Link 
                  to="/contact" 
                  className="bg-brand-text text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl"
                  onClick={() => setIsOpen(false)}
                >
                  Start Project
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      
      <div className="flex flex-col items-center md:items-end gap-2">
        <div className="flex flex-wrap justify-center md:justify-end gap-6 text-xs font-semibold text-brand-muted mb-2">
          <Link to="/portfolio" className="hover:text-brand-text transition-colors">Portfolio</Link>
          <Link to="/algemene-voorwaarden" className="hover:text-brand-text transition-colors">Algemene Voorwaarden</Link>
          <Link to="/privacy-beleid" className="hover:text-brand-text transition-colors">Privacy Beleid</Link>
          <Link to="/contact" className="hover:text-brand-text transition-colors">Contact</Link>
        </div>
        <div className="text-[10px] font-medium text-brand-muted/70 text-center md:text-right space-y-1">
          <p>© {new Date().getFullYear()} WebDiscovery.nl — Alle rechten voorbehouden.</p>
        </div>
      </div>
    </div>
  </footer>
);
