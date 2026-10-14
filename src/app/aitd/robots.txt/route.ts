import { AITD_ORIGIN, seoContext } from '@/lib/aitd/seo';

// aitdconsulting.eu/robots.txt (via proxy-rewrite). Op het demo-adres: alles dicht.
export const dynamic = 'force-dynamic';

export async function GET() {
  const { live } = await seoContext();
  const body = live
    ? `User-agent: *\nAllow: /\nDisallow: /beheer\n\nSitemap: ${AITD_ORIGIN}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
