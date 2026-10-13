import type { Metadata } from 'next';
import { getPublishedSite } from '@/lib/aitd/db';
import { SiteView } from './_site/render';

// Publieke site van klant AITD Consulting BV. De inhoud komt uit de database en
// wordt beheerd via /aitd/beheer. Wordt later ook via aitdconsulting.eu
// geserveerd (host-routing in src/proxy.ts).

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublishedSite();
  return {
    title: site.settings.seoTitle,
    description: site.settings.seoDescription,
    icons: { icon: '/aitd/icon.svg' },
  };
}

export default async function AitdHome() {
  const site = await getPublishedSite();
  return <SiteView ctx={{ site, page: site.pages[0], base: '/aitd' }} />;
}
