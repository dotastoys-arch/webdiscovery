// Haalt de echte content van een bestaande website op, zodat de "vernieuwde"
// versie op hún eigen teksten gebaseerd is (niet op algemene placeholders).

export interface SiteExtract {
  title: string | null;
  description: string | null;
  headings: string[];
  excerpt: string | null;
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function scrapeSiteContent(url: string): Promise<SiteExtract | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebDiscoveryBot/1.0)' },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 400_000);

    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
    const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1];

    const headings = [...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi)]
      .map((m) => decode(m[1].replace(/<[^>]+>/g, '')))
      .filter((h) => h.length > 2 && h.length < 120)
      .slice(0, 12);

    // Ruwe body-tekst als excerpt.
    const body = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ');
    const excerpt = decode(body).slice(0, 1200);

    return {
      title: title ? decode(title) : null,
      description: description ? decode(description) : null,
      headings,
      excerpt: excerpt || null,
    };
  } catch {
    return null;
  }
}
