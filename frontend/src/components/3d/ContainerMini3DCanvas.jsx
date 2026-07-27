/**
 * File: frontend/src/components/3d/ContainerMini3DCanvas.jsx
 * Purpose: Lightweight live 3D preview engine for Product Details card with IntersectionObserver viewport pausing.
 */
import React, { useRef, useEffect, useState, Suspense } from 'react';
import containerPreviewImg from '../../assets/container_preview.png';
import ContainerPreview3DCanvas from './ContainerPreview3DCanvas';

// WebGL check helper
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

// Internal Error Boundary to guarantee mini 3D canvas can never crash the parent page
class Mini3DErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('Mini 3D preview caught error, falling back gracefully:', err);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

const ContainerMini3DCanvas = React.memo(function ContainerMini3DCanvas({ containerType = '40HC', product, totalQuantity = 1, palletItems = [] }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);

  // Check WebGL availability
  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  // IntersectionObserver to pause rendering when component is out of viewport
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const imageFallback = (
    <div className="w-full h-full flex items-center justify-center">
      <img src={containerPreviewImg} alt="Cocoveera Container Model" className="max-w-[90%] max-h-[90%] object-contain" />
    </div>
  );

  if (!hasWebGL) {
    return imageFallback;
  }

  return (
    <Mini3DErrorBoundary fallback={imageFallback}>
      <div ref={containerRef} className="w-full h-full relative pointer-events-none select-none">
        {isVisible && (
          <Suspense fallback={imageFallback}>
            <ContainerPreview3DCanvas
              containerType={containerType}
              product={product}
              totalQuantity={totalQuantity}
              palletItems={palletItems}
              isTransparent={true}
              doorOpen={true}
              autoRotate={false}
              oscillate={true}
              cameraPreset="perspective"
              isMini={true}
            />
          </Suspense>
        )}
      </div>
    </Mini3DErrorBoundary>
  );
});

export default ContainerMini3DCanvas;
