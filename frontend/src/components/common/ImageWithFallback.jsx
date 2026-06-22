import React, { useState } from 'react';

export const ImageWithFallback = ({
  src,
  alt,
  className,
  style,
  onMouseEnter,
  onMouseLeave
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Allow the local logo to be used as a valid fallback
  const isInvalidSource = !src || src === 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=800&q=80';
  
  // Use the local site logo as a fallback instead of an external image
  const imageSrc = isInvalidSource || hasError ? '/logo.webp' : src;

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
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </>
  );
};

export default ImageWithFallback;
