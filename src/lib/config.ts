// Centrale config + helpers. Waarden komen uit env; bedrijfsgegevens
// staan in de DB (company_profile) zodat ze zonder deploy aanpasbaar zijn.

export const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://webdiscovery.nl',
  standardPriceCents: 50000, // €500 — fallback; leidend is company_profile
};

export function euro(cents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

// Vervangt {{placeholders}} in mail-sjablonen.
export function renderTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}
