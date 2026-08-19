import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, url, image, schema, noindex }) => {
  const siteUrl = 'https://cocoveera.com';
  const defaultImage = `${siteUrl}/favicon.webp`;
  const defaultDescription = 'COCOVEERA - Premium organic coconut substrates, Coir peat blocks, Grow bags, and Coco Briquettes for bulk global export. Verify batch quality tests instantly.';

  const seoTitle = title ? `${title} | COCOVEERA` : 'COCOVEERA | Quality Testing & Coconut Substrates Export';
  const seoDescription = description || defaultDescription;

  // Determine relative pathname safely
  let pathname = '';
  if (url) {
    pathname = url;
  } else if (typeof window !== 'undefined') {
    pathname = window.location.pathname;
  }

  // Ensure leading slash and remove trailing slashes except for root '/'
  let cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  const seoUrl = `${siteUrl}${cleanPath === '/' ? '' : cleanPath}`;
  const seoImage = image || defaultImage;

  // Route-aware private page check for noindex tag
  const isPrivate = noindex || 
                    cleanPath.startsWith('/account') || 
                    cleanPath.startsWith('/dashboard') || 
                    cleanPath.startsWith('/admin') ||
                    cleanPath.startsWith('/orders') ||
                    cleanPath.startsWith('/quotes') ||
                    cleanPath.startsWith('/track') ||
                    ['/login', '/register', '/verify-otp', '/cart', '/checkout', '/order-summary', '/payment', '/order-success', '/wishlist', '/saved', '/address', '/settings', '/profile', '/payments', '/testing-reports', '/notifications', '/support', '/mobile'].includes(cleanPath);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={seoUrl} />
      {isPrivate ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

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

