/**
 * File: frontend/src/components/LazyVideo.jsx
 * Purpose: Renders a video that only starts downloading when it enters or is close to the viewport.
 */
import React, { useState, useEffect, useRef } from 'react';

const LazyVideo = ({ src, poster, className, ...props }) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load when it's within 200px of the viewport
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`${className} relative overflow-hidden bg-black`}>
      <video
        src={shouldLoad ? src : undefined}
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover z-10"
        {...props}
      />
    </div>
  );
};

export default LazyVideo;
