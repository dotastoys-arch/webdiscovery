// Het "brein" van het product: welke functionele modules horen bij welke branche.
// De AI-generator (fase 3) gebruikt dit om per klant de juiste bouwblokken te kiezen.
// Elke gegenereerde site krijgt ALTIJD een CMS + contact, zodat de klant alles zelf
// beheert en nooit externe hulp nodig heeft.

export type ModuleId =
  | 'cms'
  | 'contact'
  | 'booking'
  | 'reservations'
  | 'quote'
  | 'webshop'
  | 'gallery'
  | 'menu'
  | 'reviews'
  | 'opening_hours';

export interface ModuleDef {
  id: ModuleId;
  label: string;
  description: string;
  /** In-house gebouwd op onze stack, of (optioneel) via externe SaaS te koppelen. */
  saasAlternatives?: string[];
}

export const MODULES: Record<ModuleId, ModuleDef> = {
  cms: {
    id: 'cms',
    label: 'CMS',
    description: 'Teksten, foto’s, prijzen en openingstijden zelf aanpassen — geen externe hulp nodig.',
  },
  contact: {
    id: 'contact',
    label: 'Contact',
    description: 'Contactformulier, kaart en klik-om-te-bellen/WhatsApp.',
    saasAlternatives: ['WhatsApp'],
  },
  booking: {
    id: 'booking',
    label: 'Boekingssysteem',
    description: 'Online afspraken maken met bevestiging per e-mail.',
    saasAlternatives: ['Cal.com', 'Calendly'],
  },
  reservations: {
    id: 'reservations',
    label: 'Reserveringen',
    description: 'Tafel-/plaatsreserveringen voor horeca.',
    saasAlternatives: ['Cal.com'],
  },
  quote: {
    id: 'quote',
    label: 'Offertesysteem',
    description: 'Bezoekers vragen direct een offerte aan; jij volgt op in de admin.',
  },
  webshop: {
    id: 'webshop',
    label: 'Webshop',
    description: 'Producten verkopen met betaling via iDEAL.',
    saasAlternatives: ['Shopify', 'Mollie'],
  },
  gallery: {
    id: 'gallery',
    label: 'Projectgalerij',
    description: 'Portfolio van uitgevoerd werk met foto’s.',
  },
  menu: {
    id: 'menu',
    label: 'Menukaart',
    description: 'Digitale, altijd actuele menukaart.',
  },
  reviews: {
    id: 'reviews',
    label: 'Reviews',
    description: 'Klantbeoordelingen tonen voor vertrouwen.',
  },
  opening_hours: {
    id: 'opening_hours',
    label: 'Openingstijden',
    description: 'Actuele openingstijden, zelf te beheren.',
  },
};

// Altijd inbegrepen, ongeacht branche.
const BASE_MODULES: ModuleId[] = ['cms', 'contact'];

// Branche-herkenning op trefwoorden → aanbevolen modules.
interface BrancheRule {
  match: RegExp;
  modules: ModuleId[];
}

const BRANCHE_RULES: BrancheRule[] = [
  {
    match: /kapper|salon|barbier|schoonheid|nagel|beauty|tandarts|fysio|therapeut|massage|pedicure/i,
    modules: ['booking', 'opening_hours', 'reviews'],
  },
  {
    match: /restaurant|café|cafe|bar|horeca|eetcaf|bistro|lunchroom|brasserie/i,
    modules: ['reservations', 'menu', 'opening_hours', 'reviews'],
  },
  {
    match: /aannemer|loodgieter|hovenier|schilder|elektricien|klusbedrijf|dakdekker|stukadoor|installateur|bouw/i,
    modules: ['quote', 'gallery', 'reviews'],
  },
  {
    match: /winkel|retail|boetiek|shop|webshop|kleding|speelgoed|cadeau|bloemist/i,
    modules: ['webshop', 'opening_hours', 'reviews'],
  },
  {
    match: /garage|autobedrijf|fietsen|rijschool/i,
    modules: ['booking', 'quote', 'reviews'],
  },
];

/**
 * Bepaalt de aanbevolen modules voor een branche/omschrijving.
 * Geeft altijd minimaal de basismodules (CMS + contact) terug.
 */
export function modulesForBranche(industry?: string | null): ModuleId[] {
  const set = new Set<ModuleId>(BASE_MODULES);
  if (industry) {
    for (const rule of BRANCHE_RULES) {
      if (rule.match.test(industry)) rule.modules.forEach((m) => set.add(m));
    }
  }
  // Als niets matchte: geef een zinnige standaard (offerte + galerij + reviews).
  if (set.size === BASE_MODULES.length) {
    ['quote', 'gallery', 'reviews'].forEach((m) => set.add(m as ModuleId));
  }
  return [...set];
}
