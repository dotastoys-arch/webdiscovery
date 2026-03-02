import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords = 'webdesign, rebranding, website laten maken, professionele website, webdiscovery, hosting, domeinnaam',
  canonical, 
  ogImage = 'https://picsum.photos/seed/webdiscovery-og/1200/630', 
  ogType = 'website' 
}) => {
  const siteTitle = 'WebDiscovery | Premium Webdesign & Rebranding';
  const fullTitle = title ? `${title} | WebDiscovery` : siteTitle;
  const siteDescription = description || 'Premium webdesign en rebranding voor ondernemers. Een complete online transformatie voor een vast bedrag van €499 inclusief hosting en domein.';
  const siteUrl = 'https://webdiscovery.nl'; // Replace with actual URL if different

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={keywords} />
      {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={`${siteUrl}${canonical || ''}`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
