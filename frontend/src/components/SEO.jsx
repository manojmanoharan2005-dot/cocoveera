import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, url, image, schema, noindex }) => {
  const siteUrl = 'https://cocoveera.com';
  const defaultImage = `${siteUrl}/favicon.webp`;
  const defaultDescription = 'COCOVEERA - Premium organic coconut substrates, Coir peat blocks, Grow bags, and Coco Briquettes for bulk global export. Verify batch quality tests instantly.';

  const seoTitle = title ? `${title} | COCOVEERA` : 'COCOVEERA | Quality Testing & Coconut Substrates Export';
  const seoDescription = description || defaultDescription;
  const seoUrl = url ? `${siteUrl}${url}` : siteUrl;
  const seoImage = image || defaultImage;

  // Automatically determine if the path is internal/private
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const isInternal = noindex || 
                     path.startsWith('/account') || 
                     path.startsWith('/dashboard') || 
                     path.startsWith('/admin') ||
                     ['/login', '/register', '/verify-otp', '/cart', '/checkout', '/order-summary', '/payment', '/order-success', '/wishlist', '/saved', '/address', '/settings', '/profile', '/invoices', '/quotes', '/payments', '/testing-reports', '/notifications', '/support', '/mobile'].includes(path);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={seoUrl} />
      {isInternal && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={seoUrl} />
      <meta property="twitter:title" content={seoTitle} />
      <meta property="twitter:description" content={seoDescription} />
      <meta property="twitter:image" content={seoImage} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
