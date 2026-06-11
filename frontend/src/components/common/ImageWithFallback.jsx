import React, { useState } from 'react';

const GOOGLE_IMAGE_URL = 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=800&q=80';
const DEFAULT_FALLBACK = 'https://placehold.co/600x600/eeeeee/999999?text=Image+Not+Available';

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

  // If the source is the specific Google image or no source is provided, treat it as an error/fallback immediately
  const isInvalidSource = !src || src === GOOGLE_IMAGE_URL;
  const imageSrc = isInvalidSource || hasError ? DEFAULT_FALLBACK : src;

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
