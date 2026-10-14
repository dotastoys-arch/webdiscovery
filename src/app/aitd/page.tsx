import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getPublishedInfo, markDomainLive } from '@/lib/aitd/db';
import { AITD_ORIGIN, organizationJsonLd, pageMetadata, seoContext } from '@/lib/aitd/seo';
import { SiteView } from './_site/render';

// Publieke site van klant AITD Consulting BV. De inhoud komt uit de database en
// wordt beheerd via /aitd/beheer. Op aitdconsulting.eu draait dezelfde site
// zonder /aitd (host-routing in src/proxy.ts) en is hij zichtbaar voor zoekmachines.

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [{ site }, seo] = await Promise.all([getPublishedInfo(), seoContext()]);
  return pageMetadata(site, site.pages[0], seo);
}

export default async function AitdHome() {
  const [info, seo] = await Promise.all([getPublishedInfo(), seoContext()]);
  if (seo.live) await markDomainLive();
  // Eigen domein actief? Dan stuurt het demo-adres door (geen dubbele site in Google).
  else if (info.domainLiveAt) permanentRedirect(AITD_ORIGIN);

  const { site } = info;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(site)).replace(/</g, '\\u003c') }}
      />
      <SiteView ctx={{ site, page: site.pages[0], base: seo.base }} />
    </>
  );
}
