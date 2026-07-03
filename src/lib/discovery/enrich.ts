// Verrijking: haalt de website van een bedrijf op en probeert
//   (1) een contact-e-mail te vinden, en
//   (2) in te schatten of de site verouderd is (= goede rebranding-prospect).
// Bewust simpel en robuust: faalt nooit hard, geeft gewoon null terug.

export interface Enrichment {
  email: string | null;
  outdated: boolean;
  outdatedReasons: string[];
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
// Adressen die we nooit als lead-contact willen (ruis).
const EMAIL_BLOCKLIST = /(example\.|sentry|wixpress|\.png|\.jpg|@2x|u002)/i;

function pickBestEmail(emails: string[]): string | null {
  const clean = [...new Set(emails.map((e) => e.toLowerCase()))].filter(
    (e) => !EMAIL_BLOCKLIST.test(e)
  );
  if (clean.length === 0) return null;
  // Voorkeur voor info@/contact@ boven willekeurige adressen.
  const preferred = clean.find((e) => /^(info|contact|hallo|hello|mail)@/.test(e));
  return preferred ?? clean[0];
}

function detectOutdated(html: string): { outdated: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const lower = html.toLowerCase();

  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) reasons.push('geen viewport (niet mobielvriendelijk)');
  if (/<table[^>]*>[\s\S]*<table/i.test(html) && /width=|cellpadding|cellspacing/i.test(html))
    reasons.push('table-based layout');
  if (/<font\b/i.test(html)) reasons.push('verouderde <font>-tags');
  if (/frontpage|dreamweaver|content=["']?wordpress 3/i.test(lower)) reasons.push('oude editor/CMS');

  // Oud copyright-jaartal (>3 jaar geleden). We kennen het huidige jaar niet
  // hard, dus zoeken we naar jaartallen 2015–2021 in een copyright-context.
  const cpy = html.match(/(?:©|copyright|&copy;)\s*(20(1[5-9]|2[0-1]))/i);
  if (cpy) reasons.push(`copyright ${cpy[1]}`);

  return { outdated: reasons.length >= 1, reasons };
}

export async function enrichFromWebsite(url: string): Promise<Enrichment> {
  const empty: Enrichment = { email: null, outdated: false, outdatedReasons: [] };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebDiscoveryBot/1.0)' },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!res.ok) return empty;

    const html = (await res.text()).slice(0, 500_000); // cap
    const emails = html.match(EMAIL_RE) ?? [];
    const { outdated, reasons } = detectOutdated(html);

    return { email: pickBestEmail(emails), outdated, outdatedReasons: reasons };
  } catch {
    return empty;
  }
}
