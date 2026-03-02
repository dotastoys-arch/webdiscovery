import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', company: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Er is iets misgegaan.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
      setErrorMessage('Kon geen verbinding maken met de server.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="pt-32 pb-20 px-6">
      <SEO 
        title="Contact" 
        description="Neem contact op met WebDiscovery voor uw nieuwe website of rebranding. Wij staan klaar om uw bedrijf online te laten groeien."
        canonical="/contact"
      />
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-serif italic mb-6 text-brand-text">Neem Contact Op</h1>
          <p className="text-xl text-brand-muted max-w-2xl mx-auto">
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
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-brand-text mb-4">Bericht Verzonden!</h3>
                <p className="text-brand-muted mb-8">Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="btn-primary"
                >
                  Nieuw Bericht
                </button>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {status === 'error' && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-muted ml-1">Naam</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Je naam"
                      className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-accent transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-muted ml-1">Bedrijfsnaam</label>
                    <input 
                      type="text" 
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Je bedrijf"
                      className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-accent transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-muted ml-1">E-mailadres</label>
                  <input 
                    required
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="naam@bedrijf.nl"
                    className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-muted ml-1">Bericht</label>
                  <textarea 
                    required
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Vertel ons over je project..."
                    className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-accent transition-colors resize-none"
                  ></textarea>
                </div>
                <button 
                  disabled={status === 'loading'}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Verzenden...' : 'Verstuur Bericht'}
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="glass p-8 rounded-3xl flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-text text-white flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-1 text-brand-text">E-mail ons</h4>
                <p className="text-brand-muted mb-2">Voor algemene vragen en offertes.</p>
                <a href="mailto:administratie@webdiscovery.nl" className="text-brand-text font-medium hover:underline">administratie@webdiscovery.nl</a>
              </div>
            </div>

            <div className="glass p-8 rounded-3xl flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-text text-white flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-1 text-brand-text">Telefoon</h4>
                <p className="text-brand-muted mb-2">Maandag t/m vrijdag, 09:00 - 17:00.</p>
                <a href="tel:+31852129077" className="text-brand-text font-medium hover:underline">+31 85 212 90 77</a>
              </div>
            </div>

            <div className="glass p-8 rounded-3xl flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-text text-white flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-1 text-brand-text">Locatie</h4>
                <p className="text-brand-muted mb-1">Pijlspitskreek 3, 2241 MT Wassenaar</p>
                <p className="text-brand-muted text-sm italic">(Geen bezoekadres)</p>
              </div>
            </div>

            <div className="glass p-8 rounded-3xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-brand-muted font-medium uppercase tracking-wider text-[10px]">KVK Nummer</p>
                  <p className="text-brand-text font-bold">96004177</p>
                </div>
                <div>
                  <p className="text-brand-muted font-medium uppercase tracking-wider text-[10px]">BTW Nummer</p>
                  <p className="text-brand-text font-bold">NL005189518B08</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
