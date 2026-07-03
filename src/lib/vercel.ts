// Koppeling met de Vercel API voor domeinregistratie + het koppelen van een
// domein aan dit project. Gebruikt de nieuwe Domains Registrar API (/v1/registrar,
// de oude /v4/domains is per 2025-11-09 uitgezet).
//
// Env-vars (net als Mollie, gated):
//   VERCEL_TOKEN      – Vercel access token (Account Settings → Tokens)
//   VERCEL_PROJECT_ID – project-id van deze site (Project → Settings → General)
//   VERCEL_TEAM_ID    – (optioneel) team-id als het project onder een team valt
//
// Registrant-gegevens (verplicht bij het kopen). Standaard WebDiscovery zelf,
// te overschrijven via REGISTRANT_* env-vars.

const API = 'https://api.vercel.com';

export function hasVercel(): boolean {
  return !!(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID);
}

function qs(params: Record<string, string | number | undefined>): string {
  const parts: string[] = [];
  if (process.env.VERCEL_TEAM_ID) parts.push(`teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) parts.push(`${k}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

async function vercelFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json as { error?: { message?: string }; message?: string })?.error?.message
      || (json as { message?: string })?.message
      || `Vercel API ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

// Registrant-contact voor aankopen (standaard WebDiscovery, overschrijfbaar via env).
function registrant() {
  return {
    firstName: process.env.REGISTRANT_FIRST_NAME || 'WebDiscovery',
    lastName: process.env.REGISTRANT_LAST_NAME || 'Beheer',
    email: process.env.REGISTRANT_EMAIL || 'info@webdiscovery.nl',
    phone: process.env.REGISTRANT_PHONE || '+31852129077',
    address1: process.env.REGISTRANT_ADDRESS || 'Pijlspitskreek 3',
    city: process.env.REGISTRANT_CITY || 'Wassenaar',
    state: process.env.REGISTRANT_STATE || 'Zuid-Holland',
    zip: process.env.REGISTRANT_ZIP || '2241 MT',
    country: process.env.REGISTRANT_COUNTRY || 'NL',
    companyName: process.env.REGISTRANT_COMPANY || 'WebDiscovery',
  };
}

export interface DomainCheck {
  domain: string;
  available: boolean;
  priceCents: number | null; // aankoopprijs in centen
  years: number;
}

// Beschikbaarheid + aankoopprijs opvragen (geen aankoop).
export async function checkDomain(domain: string): Promise<DomainCheck> {
  const avail = (await vercelFetch(`/v1/registrar/domains/${encodeURIComponent(domain)}/availability${qs({})}`)) as {
    available: boolean | string;
  };
  const available = avail.available === true || avail.available === 'true';

  let priceCents: number | null = null;
  let years = 1;
  try {
    const price = (await vercelFetch(`/v1/registrar/domains/${encodeURIComponent(domain)}/price${qs({})}`)) as {
      years: number;
      purchasePrice: number | string;
    };
    if (typeof price.purchasePrice === 'number') {
      priceCents = Math.round(price.purchasePrice * 100);
      years = price.years ?? 1;
    }
  } catch {
    /* prijs onbekend (bv. premium of niet-ondersteund) */
  }
  return { domain, available, priceCents, years };
}

// Domein daadwerkelijk kopen. expectedPriceCents beschermt tegen prijswijzigingen.
export async function buyDomain(domain: string, expectedPriceCents: number, years = 1): Promise<void> {
  await vercelFetch(`/v1/registrar/domains/${encodeURIComponent(domain)}/buy${qs({})}`, {
    method: 'POST',
    body: JSON.stringify({
      autoRenew: true,
      years,
      expectedPrice: expectedPriceCents / 100,
      contactInformation: registrant(),
    }),
  });
}

// Domein aan dit Vercel-project koppelen (Vercel regelt verkeer + SSL).
export async function attachDomainToProject(domain: string): Promise<void> {
  const projectId = process.env.VERCEL_PROJECT_ID;
  await vercelFetch(`/v10/projects/${projectId}/domains${qs({})}`, {
    method: 'POST',
    body: JSON.stringify({ name: domain }),
  });
}
