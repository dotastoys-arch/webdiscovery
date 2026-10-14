import { getPublishedInfo } from '@/lib/aitd/db';
import { AITD_ORIGIN, pagePath, seoContext, visiblePages } from '@/lib/aitd/seo';

// aitdconsulting.eu/sitemap.xml — alleen op het eigen domein (demo heeft geen sitemap).
export const dynamic = 'force-dynamic';

export async function GET() {
  const { live } = await seoContext();
  if (!live) return new Response('Not found', { status: 404 });
  const { site, publishedAt } = await getPublishedInfo();
  const lastmod = publishedAt ? new Date(publishedAt).toISOString() : undefined;
  const urls = visiblePages(site)
    .map(
      (p) =>
        `  <url><loc>${AITD_ORIGIN}${pagePath(p)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
