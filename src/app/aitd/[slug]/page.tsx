import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedSite } from '@/lib/aitd/db';
import { SiteView } from '../_site/render';

// Losse pagina's van de AITD-site (alleen bij de opzet "meerdere pagina's").

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

async function findPage(slug: string) {
  const site = await getPublishedSite();
  if (site.layout !== 'multi_page') return null;
  const page = site.pages.slice(1).find((p) => p.slug === slug);
  return page ? { site, page } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await findPage((await params).slug);
  if (!found) return {};
  return {
    title: `${found.page.title} — AITD Consulting`,
    description: found.site.settings.seoDescription,
    icons: { icon: '/aitd/icon.svg' },
  };
}

export default async function AitdPage({ params }: Props) {
  const found = await findPage((await params).slug);
  if (!found) notFound();
  return <SiteView ctx={{ site: found.site, page: found.page, base: '/aitd' }} />;
}
