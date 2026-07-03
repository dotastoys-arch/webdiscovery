import { modulesForBranche, type ModuleId } from '@/lib/modules';
import { siteContentSchema, type GeneratedResult, type SiteContent } from './schema';
import type { Lead } from '@/types/db';

// Bouwt een concept-website uit een lead.
//   - Zonder ANTHROPIC_API_KEY: een nette template op basis van de leadgegevens.
//   - Mét key: Claude schrijft overtuigende, branche-specifieke teksten.
export async function generateSite(lead: Lead): Promise<GeneratedResult> {
  const modules = modulesForBranche(lead.industry);
  const base = templateContent(lead);

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const enhanced = await claudeContent(lead, base);
      return { content: enhanced, modules };
    } catch (e) {
      console.error('[generate] Claude fallback:', e);
    }
  }
  return { content: base, modules };
}

// ---------- Template (altijd beschikbaar) ----------
function templateContent(lead: Lead): SiteContent {
  const name = lead.company_name;
  const branche = lead.industry?.toLowerCase() || 'onderneming';
  return {
    brand: { name, tagline: `Vakwerk waar je op kunt rekenen` },
    theme: { accent: '#2563eb' },
    hero: {
      headline: `Welkom bij ${name}`,
      subheadline: `Jouw betrouwbare partner${lead.city ? ` in ${lead.city}` : ''} voor ${branche}. Persoonlijk, vakkundig en dichtbij.`,
      ctaLabel: 'Neem contact op',
    },
    about: {
      title: `Over ${name}`,
      body: `${name} staat voor kwaliteit en persoonlijke aandacht${lead.city ? ` in en rond ${lead.city}` : ''}. We helpen je graag verder met vakkundig werk en eerlijk advies.`,
    },
    services: [
      { title: 'Persoonlijke service', description: 'We nemen de tijd voor je en denken met je mee.' },
      { title: 'Vakmanschap', description: 'Werk dat klopt, van begin tot eind.' },
      { title: 'Dichtbij', description: `Lokaal${lead.city ? ` in ${lead.city}` : ''} en snel bereikbaar.` },
    ],
    highlights: ['Betrouwbaar en erkend', 'Snelle reactie', 'Eerlijke prijzen'],
    contact: {
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      city: lead.city,
    },
  };
}

// ---------- Claude-verrijking ----------
async function claudeContent(lead: Lead, base: SiteContent): Promise<SiteContent> {
  const prompt = `Je bent een Nederlandse copywriter voor een webbureau. Schrijf overtuigende, natuurlijke website-teksten voor dit bedrijf. Verzin GEEN feiten (geen nepadres/telefoon/prijzen); houd het geloofwaardig en algemeen waar je details niet kent.

Bedrijf: ${lead.company_name}
Branche: ${lead.industry ?? 'onbekend'}
Plaats: ${lead.city ?? 'onbekend'}
Bestaande website: ${lead.website_url ?? 'geen'}

Geef UITSLUITEND geldige JSON terug in exact dit formaat (Nederlands, wervend maar niet overdreven):
${JSON.stringify(
  {
    brand: { name: base.brand.name, tagline: '...' },
    theme: { accent: '#2563eb' },
    hero: { headline: '...', subheadline: '...', ctaLabel: '...' },
    about: { title: '...', body: '...' },
    services: [{ title: '...', description: '...' }],
    highlights: ['...'],
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
      max_tokens: 1500,
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
