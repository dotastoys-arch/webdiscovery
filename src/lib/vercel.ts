// Koppeling met de Vercel API voor domeinregistratie + het koppelen van een
// domein aan dit project. Alles gated achter env-vars, net als Mollie:
//   VERCEL_TOKEN      – Vercel access token (Settings → Tokens)
//   VERCEL_PROJECT_ID – project-id van deze site
//   VERCEL_TEAM_ID    – (optioneel) team-id, als het project onder een team valt

const API = 'https://api.vercel.com';

export function hasVercel(): boolean {
  return !!(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID);
}

function teamQuery(): string {
  return process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : '';
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
    const msg = (json as { error?: { message?: string } })?.error?.message || `Vercel API ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export interface DomainCheck {
  domain: string;
  available: boolean;
  priceCents: number | null; // jaarprijs in centen
  years: number;
}

// Beschikbaarheid + jaarprijs opvragen (geen aankoop).
export async function checkDomain(domain: string): Promise<DomainCheck> {
  const q = teamQuery();
  const sep = q ? '&' : '?';
  const status = (await vercelFetch(`/v4/domains/status${q}${sep}name=${encodeURIComponent(domain)}`)) as { available: boolean };
  let priceCents: number | null = null;
  let years = 1;
  try {
    const price = (await vercelFetch(`/v4/domains/price${q}${sep}name=${encodeURIComponent(domain)}`)) as { price: number; period: number };
    priceCents = Math.round(price.price * 100);
    years = price.period ?? 1;
  } catch {
    /* prijs onbekend (bv. premium of niet-ondersteund) */
  }
  return { domain, available: status.available, priceCents, years };
}

// Domein daadwerkelijk kopen. expectedPriceCents beschermt tegen prijswijzigingen.
export async function buyDomain(domain: string, expectedPriceCents: number): Promise<void> {
  await vercelFetch(`/v4/domains/buy${teamQuery()}`, {
    method: 'POST',
    body: JSON.stringify({ name: domain, expectedPrice: expectedPriceCents / 100, renew: true }),
  });
}

// Domein aan dit Vercel-project koppelen (zodat Vercel er verkeer + SSL voor regelt).
export async function attachDomainToProject(domain: string): Promise<void> {
  const projectId = process.env.VERCEL_PROJECT_ID;
  await vercelFetch(`/v10/projects/${projectId}/domains${teamQuery()}`, {
    method: 'POST',
    body: JSON.stringify({ name: domain }),
  });
}
