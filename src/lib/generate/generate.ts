import { modulesForBranche, type ModuleId } from '@/lib/modules';
import { siteContentSchema, type GeneratedResult, type SiteContent } from './schema';
import type { Lead } from '@/types/db';

// Bouwt een rijke concept-website uit een lead.
//   - Zonder ANTHROPIC_API_KEY: een complete template op basis van de leadgegevens.
//   - Mét key: Claude schrijft overtuigende, branche-specifieke teksten.
export async function generateSite(lead: Lead): Promise<GeneratedResult> {
  const modules = modulesForBranche(lead.industry);
  const base = templateContent(lead, modules);

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const enhanced = await claudeContent(lead, modules, base);
      return { content: enhanced, modules };
    } catch (e) {
      console.error('[generate] Claude fallback:', e);
    }
  }
  return { content: base, modules };
}

// ---------- Template (altijd beschikbaar, module-bewust) ----------
export function templateContent(lead: Lead, modules: ModuleId[]): SiteContent {
  const name = lead.company_name;
  const branche = lead.industry?.toLowerCase() || 'onderneming';
  const has = (m: ModuleId) => modules.includes(m);
  const primaryCta = has('booking')
    ? 'Maak een afspraak'
    : has('quote')
      ? 'Vraag een offerte aan'
      : 'Neem contact op';

  return {
    brand: { name, tagline: 'Vakwerk waar je op kunt rekenen' },
    theme: { accent: '#2563eb' },
    hero: {
      headline: `Welkom bij ${name}`,
      subheadline: `Jouw betrouwbare partner${lead.city ? ` in ${lead.city}` : ''} voor ${branche}. Persoonlijk, vakkundig en dichtbij.`,
      ctaLabel: primaryCta,
      ctaSecondary: 'Meer weten',
    },
    highlights: ['Betrouwbaar en erkend', 'Snelle reactie', 'Eerlijke prijzen', 'Persoonlijke aandacht'],
    stats: [
      { value: 'Lokaal', label: `Actief${lead.city ? ` in ${lead.city}` : ' in de regio'}` },
      { value: '5★', label: 'Tevreden klanten' },
      { value: 'Snel', label: 'Snel geregeld' },
    ],
    about: {
      title: `Over ${name}`,
      body: `${name} staat voor kwaliteit en persoonlijke aandacht${lead.city ? ` in en rond ${lead.city}` : ''}. We nemen de tijd voor je, denken met je mee en leveren vakwerk van begin tot eind.`,
    },
    services: [
      { title: 'Persoonlijke service', description: 'We nemen de tijd voor je en denken met je mee.' },
      { title: 'Vakmanschap', description: 'Werk dat klopt, van begin tot eind.' },
      { title: 'Dichtbij', description: `Lokaal${lead.city ? ` in ${lead.city}` : ''} en snel bereikbaar.` },
    ],
    menu: has('menu')
      ? [
          { name: 'Voorgerecht van het huis', description: 'Vers en met liefde bereid.', price: '€9,50' },
          { name: 'Specialiteit van de chef', description: 'Onze klassieker, altijd geliefd.', price: '€18,50' },
          { name: 'Dessert', description: 'Zoete afsluiter van de dag.', price: '€7,50' },
        ]
      : [],
    reviews: [
      { name: 'Sanne de Vries', text: 'Super tevreden! Snel geholpen en het resultaat is precies wat ik zocht.' },
      { name: 'Mark Jansen', text: 'Vriendelijk, vakkundig en eerlijke prijzen. Echt een aanrader.' },
      { name: 'Lisa Bakker', text: 'Persoonlijke aandacht van begin tot eind. Kom hier zeker terug.' },
    ],
    faq: [
      { q: 'Hoe kan ik contact opnemen?', a: `Je kunt ons bellen, mailen of het formulier op deze site gebruiken. We reageren snel.` },
      { q: 'Werken jullie ook in mijn omgeving?', a: `Ja, we zijn actief${lead.city ? ` in en rond ${lead.city}` : ' in de hele regio'}.` },
      { q: 'Wat kost het?', a: 'Dat hangt van je wensen af. Vraag vrijblijvend een prijsopgave aan.' },
    ],
    openingHours: [
      { day: 'Maandag t/m vrijdag', hours: '09:00 – 17:00' },
      { day: 'Zaterdag', hours: '10:00 – 16:00' },
      { day: 'Zondag', hours: 'Gesloten' },
    ],
    cta: {
      title: `Klaar om te starten met ${name}?`,
      subtitle: 'Neem vrijblijvend contact op — we helpen je graag verder.',
      buttonLabel: primaryCta,
    },
    contact: {
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      city: lead.city,
    },
  };
}

// ---------- Claude-verrijking ----------
async function claudeContent(lead: Lead, modules: ModuleId[], base: SiteContent): Promise<SiteContent> {
  const prompt = `Je bent een Nederlandse copywriter en webdesigner. Schrijf overtuigende, natuurlijke teksten voor een complete website van dit bedrijf. Verzin GEEN harde feiten (geen echt adres/telefoon/exacte prijzen/echte klantnamen als feit); sample-reviews en voorbeeldprijzen mogen wel als illustratie. Houd het geloofwaardig en warm.

Bedrijf: ${lead.company_name}
Branche: ${lead.industry ?? 'onbekend'}
Plaats: ${lead.city ?? 'onbekend'}
Actieve modules: ${modules.join(', ')}

Kies een passende accentkleur (hex) voor deze branche. Maak de teksten specifiek voor de branche. Vul 'menu' alleen als het een horeca/restaurant is (anders lege lijst). Geef 3-4 highlights, 3 stats, 3 diensten, 3 reviews, 3-4 FAQ's, openingstijden en een sterke slot-CTA.

Geef UITSLUITEND geldige JSON terug in exact dit formaat:
${JSON.stringify(
  {
    brand: { name: base.brand.name, tagline: '...' },
    theme: { accent: '#2563eb' },
    hero: { headline: '...', subheadline: '...', ctaLabel: '...', ctaSecondary: '...' },
    highlights: ['...'],
    stats: [{ value: '...', label: '...' }],
    about: { title: '...', body: '...' },
    services: [{ title: '...', description: '...' }],
    menu: [{ name: '...', description: '...', price: '...' }],
    reviews: [{ name: '...', text: '...' }],
    faq: [{ q: '...', a: '...' }],
    openingHours: [{ day: '...', hours: '...' }],
    cta: { title: '...', subtitle: '...', buttonLabel: '...' },
  },
  null,
  0
)}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  const text: string = data.content?.[0]?.text ?? '';
  const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));

  // Merge met base zodat contact/verplichte velden altijd kloppen.
  return siteContentSchema.parse({
    ...base,
    ...json,
    brand: { ...base.brand, ...json.brand },
    theme: { ...base.theme, ...json.theme },
    hero: { ...base.hero, ...json.hero },
    about: { ...base.about, ...json.about },
    contact: base.contact,
  });
}
