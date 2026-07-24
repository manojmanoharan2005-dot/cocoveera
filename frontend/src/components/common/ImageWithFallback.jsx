import React, { useState } from 'react';

// Intercept Cloudinary URL to add optimization transformations (width: 400px, auto format, auto quality)
const optimizeCloudinaryUrl = (url, width = 400) => {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('res.cloudinary.com')) {
    // Avoid double transformation
    if (url.includes('/upload/w_')) return url;
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_${width},c_limit,f_auto,q_auto/${parts[1]}`;
    }
  }
  return url;
};

export const ImageWithFallback = ({
  src,
  alt,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  loading = 'lazy',
  decoding = 'async'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Allow the local logo to be used as a valid fallback
  const isInvalidSource = !src || src === 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=800&q=80';
  
  // Use the local site logo as a fallback instead of an external image, or optimize using Cloudinary transform
  const imageSrc = isInvalidSource || hasError ? '/logo.webp' : optimizeCloudinaryUrl(src, 400);

  return (
    <>
      {/* Skeleton loader shown before the image loads */}
      {!isLoaded && !hasError && !isInvalidSource && (
        <div className={`animate-pulse bg-stone-200/80 ${className}`} style={style} />
      )}
      
      <img
        src={imageSrc}
        alt={alt || 'Image'}
        className={`${className} ${!isLoaded && !isInvalidSource && !hasError ? 'opacity-0 absolute' : 'opacity-100'}`}
        style={style}
        loading={loading}
        decoding={decoding}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </>
  );
};

export default ImageWithFallback;
