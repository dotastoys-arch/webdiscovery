import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AITD_DOMAINS, isAitdDomain } from './domains';
import type { Page, SiteDoc } from './types';

// Vindbaarheid van de AITD-site.
// - Demo (webdiscovery.nl/aitd): niet indexeren, geen sitemap.
// - Eigen domein (aitdconsulting.eu): indexeren, canonical, sitemap, structured data.

export const AITD_ORIGIN = `https://${AITD_DOMAINS[0]}`;

export type Seo = { live: boolean; base: string };

export async function seoContext(): Promise<Seo> {
  const live = isAitdDomain((await headers()).get('host'));
  return { live, base: live ? '' : '/aitd' };
}

export function pagePath(page: Page): string {
  return page.slug ? `/${page.slug}` : '/';
}

// Pagina's die bezoekers echt kunnen zien (bij one-page alleen de homepage).
export function visiblePages(site: SiteDoc): Page[] {
  return site.layout === 'one_page' ? site.pages.slice(0, 1) : site.pages;
}

export function pageMetadata(site: SiteDoc, page: Page, seo: Seo): Metadata {
  const isHome = page.slug === '';
  const title = isHome ? site.settings.seoTitle : `${page.title} — AITD Consulting`;
  const description = site.settings.seoDescription;
  const url = `${AITD_ORIGIN}${pagePath(page)}`;
  const image = `${seo.live ? AITD_ORIGIN : ''}${seo.base}/og.png`;

  return {
    title,
    description,
    icons: { icon: '/aitd/icon.svg' },
    // Demo nooit in zoekmachines; op het eigen domein wel.
    robots: seo.live ? { index: true, follow: true } : { index: false, follow: false, googleBot: { index: false, follow: false } },
    alternates: seo.live ? { canonical: url } : undefined,
    openGraph: {
      type: 'website',
      siteName: 'AITD Consulting',
      locale: 'en_GB',
      title,
      description,
      url: seo.live ? url : undefined,
      images: [{ url: image, width: 1200, height: 630, alt: 'AITD Consulting — All in the detail' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

// Gestructureerde bedrijfsgegevens (schema.org) voor Google en AI-zoekmachines.
export function organizationJsonLd(site: SiteDoc): Record<string, unknown> {
  const services = site.pages
    .flatMap((p) => p.blocks)
    .flatMap((b) => (b.type === 'services' ? b.data.items : []))
    .map((i) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: i.title, description: i.text } }));

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${AITD_ORIGIN}/#organization`,
    name: 'AITD Consulting BV',
    alternateName: 'AITD Consulting',
    slogan: 'All in the detail',
    url: AITD_ORIGIN,
    logo: `${AITD_ORIGIN}/aitd/icon.svg`,
    image: `${AITD_ORIGIN}/og.png`,
    description: site.settings.seoDescription,
    knowsAbout: [
      'Geopolitical analysis',
      'Strategic foresight',
      'Scenario modelling',
      'Situational awareness',
      'Imagery analysis',
      'Geolocation',
      'Open-source intelligence',
    ],
    areaServed: [
      { '@type': 'Place', name: 'Middle East and North Africa' },
      { '@type': 'Place', name: 'Horn of Africa' },
    ],
    ...(services.length ? { hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Services', itemListElement: services } } : {}),
  };
}
