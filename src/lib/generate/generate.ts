import { modulesForBranche, type ModuleId } from '@/lib/modules';
import { siteContentSchema, type GeneratedResult, type SiteContent } from './schema';
import { getPlaceDetails, type PlaceDetails } from '@/lib/discovery/place-details';
import { scrapeSiteContent, type SiteExtract } from '@/lib/discovery/scrape-content';
import type { Lead } from '@/types/db';

// Bouwt een rijke concept-website uit een lead — gebaseerd op ECHTE data:
//   - Google Place Details (omschrijving, categorie, rating, openingstijden, reviews)
//   - de bestaande website (hun eigen teksten), indien aanwezig
// Reviews en openingstijden van Google worden altijd overgenomen (niet verzonnen).
export async function generateSite(lead: Lead): Promise<GeneratedResult> {
  const modules = modulesForBranche(lead.industry);

  const [details, siteExtract] = await Promise.all([
    lead.source_ref ? getPlaceDetails(lead.source_ref).catch(() => null) : Promise.resolve(null),
    lead.website_url ? scrapeSiteContent(lead.website_url).catch(() => null) : Promise.resolve(null),
  ]);

  let content = templateContent(lead, modules, details);

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      content = await claudeContent(lead, modules, content, details, siteExtract);
    } catch (e) {
      console.error('[generate] Claude fallback:', e);
    }
  }

  // Echte Google-data heeft altijd voorrang op verzonnen voorbeelden.
  content = applyRealData(content, details);
  return { content, modules };
}

// Zet echte reviews/openingstijden/rating over de gegenereerde content heen.
function applyRealData(c: SiteContent, details: PlaceDetails | null): SiteContent {
  if (!details) return c;
  return {
    ...c,
    reviews: details.reviews.length
      ? details.reviews.map((r) => ({ name: r.author, text: r.text }))
      : c.reviews,
    openingHours: details.openingHours.length ? details.openingHours : c.openingHours,
    stats:
      details.rating != null
        ? [
            { value: `${details.rating.toFixed(1)}★`, label: `${details.ratingCount ?? ''} Google-reviews`.trim() },
            ...c.stats.filter((s) => !s.value.includes('★')).slice(0, 2),
          ]
        : c.stats,
  };
}

// ---------- Template (altijd beschikbaar, module- en data-bewust) ----------
export function templateContent(lead: Lead, modules: ModuleId[], details?: PlaceDetails | null): SiteContent {
  const name = lead.company_name;
  const branche = details?.category?.toLowerCase() || lead.industry?.toLowerCase() || 'onderneming';
  const has = (m: ModuleId) => modules.includes(m);
  const primaryCta = has('booking')
    ? 'Maak een afspraak'
    : has('quote')
      ? 'Vraag een offerte aan'
      : 'Neem contact op';

  return {
    brand: { name, tagline: details?.category || 'Vakwerk waar je op kunt rekenen' },
    theme: { accent: '#2563eb' },
    hero: {
      headline: `Welkom bij ${name}`,
      subheadline:
        details?.description ||
        `Jouw betrouwbare partner${lead.city ? ` in ${lead.city}` : ''} voor ${branche}. Persoonlijk, vakkundig en dichtbij.`,
      ctaLabel: primaryCta,
      ctaSecondary: 'Meer weten',
    },
    highlights: ['Betrouwbaar en erkend', 'Snelle reactie', 'Eerlijke prijzen', 'Persoonlijke aandacht'],
    stats: [
      { value: 'Lokaal', label: `Actief${lead.city ? ` in ${lead.city}` : ' in de regio'}` },
      { value: 'Snel', label: 'Snel geregeld' },
      { value: 'Persoonlijk', label: 'Echte aandacht' },
    ],
    about: {
      title: `Over ${name}`,
      body:
        details?.description ||
        `${name} staat voor kwaliteit en persoonlijke aandacht${lead.city ? ` in en rond ${lead.city}` : ''}. We nemen de tijd voor je, denken met je mee en leveren vakwerk van begin tot eind.`,
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
    reviews: details?.reviews.length
      ? details.reviews.map((r) => ({ name: r.author, text: r.text }))
      : [
          { name: 'Sanne de Vries', text: 'Super tevreden! Snel geholpen en het resultaat is precies wat ik zocht.' },
          { name: 'Mark Jansen', text: 'Vriendelijk, vakkundig en eerlijke prijzen. Echt een aanrader.' },
        ],
    faq: [
      { q: 'Hoe kan ik contact opnemen?', a: 'Je kunt ons bellen, mailen of het formulier op deze site gebruiken. We reageren snel.' },
      { q: 'Werken jullie ook in mijn omgeving?', a: `Ja, we zijn actief${lead.city ? ` in en rond ${lead.city}` : ' in de hele regio'}.` },
      { q: 'Wat kost het?', a: 'Dat hangt van je wensen af. Vraag vrijblijvend een prijsopgave aan.' },
    ],
    openingHours: details?.openingHours.length
      ? details.openingHours
      : [
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

// ---------- Claude-verrijking (met echte data als bron) ----------
async function claudeContent(
  lead: Lead,
  modules: ModuleId[],
  base: SiteContent,
  details: PlaceDetails | null,
  siteExtract: SiteExtract | null
): Promise<SiteContent> {
  const realData: string[] = [];
  if (details?.category) realData.push(`Google-categorie: ${details.category}`);
  if (details?.description) realData.push(`Google-omschrijving: ${details.description}`);
  if (details?.rating) realData.push(`Google-rating: ${details.rating} (${details.ratingCount ?? '?'} reviews)`);
  if (details?.reviews.length)
    realData.push('Echte reviews:\n' + details.reviews.map((r) => `- "${r.text}" — ${r.author}`).join('\n'));
  if (details?.openingHours.length)
    realData.push('Openingstijden:\n' + details.openingHours.map((o) => `- ${o.day}: ${o.hours}`).join('\n'));
  if (siteExtract) {
    if (siteExtract.title) realData.push(`Titel bestaande site: ${siteExtract.title}`);
    if (siteExtract.description) realData.push(`Meta-omschrijving: ${siteExtract.description}`);
    if (siteExtract.headings.length) realData.push('Koppen bestaande site: ' + siteExtract.headings.join(' · '));
    if (siteExtract.excerpt) realData.push(`Tekst bestaande site (fragment): ${siteExtract.excerpt}`);
  }

  const prompt = `Je bent een Nederlandse copywriter en webdesigner. Schrijf overtuigende, natuurlijke teksten voor een complete, VERNIEUWDE website van dit bedrijf. Baseer je op de ECHTE informatie hieronder — hergebruik en moderniseer hun bestaande teksten, en houd het geloofwaardig. Verzin geen onwaarheden.

Bedrijf: ${lead.company_name}
Branche: ${lead.industry ?? details?.category ?? 'onbekend'}
Plaats: ${lead.city ?? 'onbekend'}
Actieve modules: ${modules.join(', ')}

ECHTE INFORMATIE:
${realData.length ? realData.join('\n\n') : '(geen extra data beschikbaar — gebruik naam, branche en plaats)'}

Kies een passende accentkleur (hex) voor deze branche. Vul 'menu' alleen bij horeca (anders lege lijst). Geef 3-4 highlights, 3 diensten, 3-4 FAQ's en een sterke slot-CTA. (Reviews en openingstijden worden apart toegevoegd; laat die leeg.)

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
    faq: [{ q: '...', a: '...' }],
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
