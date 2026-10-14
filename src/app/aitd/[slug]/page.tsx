import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getPublishedInfo, markDomainLive } from '@/lib/aitd/db';
import { AITD_ORIGIN, pageMetadata, seoContext } from '@/lib/aitd/seo';
import { SiteView } from '../_site/render';

// Losse pagina's van de AITD-site (alleen bij de opzet "meerdere pagina's").

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

async function findPage(slug: string) {
  const info = await getPublishedInfo();
  if (info.site.layout !== 'multi_page') return null;
  const page = info.site.pages.slice(1).find((p) => p.slug === slug);
  return page ? { ...info, page } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [found, seo] = await Promise.all([findPage((await params).slug), seoContext()]);
  return found ? pageMetadata(found.site, found.page, seo) : {};
}

export default async function AitdPage({ params }: Props) {
  const { slug } = await params;
  const [found, seo] = await Promise.all([findPage(slug), seoContext()]);
  if (!found) notFound();
  if (seo.live) await markDomainLive();
  else if (found.domainLiveAt) permanentRedirect(`${AITD_ORIGIN}/${slug}`);
  return <SiteView ctx={{ site: found.site, page: found.page, base: seo.base }} />;
}
