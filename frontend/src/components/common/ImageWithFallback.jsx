import React, { useState } from 'react';

// Intercept Cloudinary URL to add optimization transformations (width: 1000px default, auto format, auto quality)
const optimizeCloudinaryUrl = (url, width = 1000) => {
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
  className = '',
  style,
  onMouseEnter,
  onMouseLeave,
  loading = 'lazy',
  decoding = 'async',
  width = 1000
}) => {
  const [hasError, setHasError] = useState(false);

  // Fallback to /logo.webp if source is missing or invalid
  const isInvalidSource = !src || src === 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=800&q=80';
  const imageSrc = isInvalidSource || hasError ? '/logo.webp' : optimizeCloudinaryUrl(src, width);

  return (
    <img
      src={imageSrc}
      alt={alt || 'Product Image'}
      className={className}
      style={style}
      loading={loading}
      decoding={decoding}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onError={() => setHasError(true)}
    />
  );
};

export default ImageWithFallback;
