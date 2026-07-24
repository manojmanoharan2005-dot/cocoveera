/**
 * File: frontend/src/components/3d/ContainerViewer.jsx
 * Purpose: Reusable React UI component for the frontend with strict performance optimization.
 */
import React, { useRef, useState, useEffect, Suspense, lazy } from 'react';
import containerPreviewImg from '../../assets/container_preview.png';

// Lazy load the 3D Canvas component
const ContainerViewerCanvas = lazy(() => import('./ContainerViewerCanvas'));

// WebGL support check helper
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

// Low-end device capability detection
function isLowEndDevice() {
  if (typeof navigator === 'undefined') return false;
  const ram = navigator.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  if (ram !== undefined && ram <= 4) return true;
  if (cores !== undefined && cores <= 4) return true;
  return false;
}

export default function ContainerViewer({ width = '100%', height = 320, initialColor = '#2F7D32', modelUrl = null }) {
  const [wireframe, setWireframe] = useState(false);
  const [color, setColor] = useState(initialColor);
  const [localModelUrl, setLocalModelUrl] = useState(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [fpsFailed, setFpsFailed] = useState(false);

  const fileInputRef = useRef();
  const canvasRef = useRef();
  const containerRef = useRef();

  // Detect mobile and low-end devices
  useEffect(() => {
    const checkSpecs = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkSpecs();
    setIsLowEnd(isLowEndDevice());
    window.addEventListener('resize', checkSpecs);
    return () => window.removeEventListener('resize', checkSpecs);
  }, []);

  // Check WebGL availability
  useEffect(() => {
    setIsWebGLSupported(isWebGLAvailable());
  }, []);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (localModelUrl) {
        URL.revokeObjectURL(localModelUrl);
      }
    };
  }, [localModelUrl]);

  const handleFpsFail = () => {
    console.warn('FPS dropped below 30, switching to static fallback');
    setFpsFailed(true);
    setIsInteractive(false);
  };

  const lightweight = isMobile || isLowEnd;

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-lg overflow-hidden border border-stone-200/60 bg-[#F7F9F7]"
      style={{ width, height, minHeight: 220 }}
    >
      {/* 3D Scene / Static Preview Selector */}
      {isWebGLSupported && isInteractive && !fpsFailed ? (
        <>
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-stone-50">
                <div className="text-xs font-bold text-stone-500 uppercase tracking-widest animate-pulse font-sans">
                  Initializing 3D Canvas...
                </div>
              </div>
            }
          >
            <ContainerViewerCanvas
              color={color}
              wireframe={wireframe}
              modelUrl={localModelUrl || modelUrl}
              canvasRef={canvasRef}
              lightweight={lightweight}
              onFpsFail={handleFpsFail}
            />
          </Suspense>
          
          {/* Close 3D View Button - Destroys entire Canvas/Scene and releases memory */}
          <button
            type="button"
            onClick={() => setIsInteractive(false)}
            className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full border border-stone-200 shadow flex items-center gap-1.5 hover:bg-stone-50 transition-colors font-sans text-[10px] font-bold text-stone-700 uppercase tracking-wider"
          >
            Close 3D
          </button>
        </>
      ) : (
        /* Static container preview with CSS color tint */
        <div 
          onClick={() => {
            if (isWebGLSupported && !fpsFailed) {
              setIsInteractive(true);
            }
          }}
          className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-stone-100 ${
            isWebGLSupported && !fpsFailed ? 'cursor-pointer' : ''
          }`}
        >
          <img
            src={containerPreviewImg}
            alt="Container Preview"
            className="w-full h-full object-cover mix-blend-multiply"
          />
          <div
            className="absolute inset-0 opacity-30 mix-blend-color transition-colors duration-500 pointer-events-none"
            style={{ backgroundColor: color }}
          />

          {!isWebGLSupported && (
            <div className="absolute bottom-3 left-3 bg-red-650 text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wide uppercase select-none shadow">
              3D Mode Unavailable
            </div>
          )}

          {fpsFailed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center p-4">
              <span className="text-white text-[10px] font-bold font-sans uppercase tracking-widest bg-red-600 px-3 py-1 rounded-full shadow select-none">
                Interactive 3D Disabled
              </span>
              <p className="text-[10px] text-white/90 font-semibold mt-2.5 max-w-[200px] leading-relaxed select-none">
                Interactive 3D disabled for better performance.
              </p>
            </div>
          )}

          {isWebGLSupported && !isInteractive && !fpsFailed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 hover:bg-black/25 transition-colors duration-300">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInteractive(true);
                }}
                className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95 font-sans"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                VIEW 3D
              </button>
              <span className="text-[10px] text-white/90 font-bold uppercase tracking-wider mt-2 select-none drop-shadow font-sans">
                Click/Tap to interact
              </span>
            </div>
          )}
        </div>
      )}

      {/* Compact toolbar */}
      <div className="absolute left-3 top-3 bg-white/85 dark:bg-gray-900/70 backdrop-blur rounded-full p-1 shadow flex items-center gap-1 z-10">
        <button
          title="Upload model"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current.click();
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v10" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 12v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {isWebGLSupported && isInteractive && !fpsFailed && (
          <button
            title="Snapshot"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              try {
                const canvas = canvasRef.current || document.querySelector('canvas');
                if (canvas) {
                  const data = canvas.toDataURL('image/png');
                  const a = document.createElement('a');
                  a.href = data;
                  a.download = 'container-snapshot.png';
                  a.click();
                }
              } catch (err) {
                console.error('snapshot error', err);
              }
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="7" width="18" height="13" rx="2" stroke="#111827" strokeWidth="1.5" />
              <path d="M16 3H8v4h8V3z" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Hidden file input for local upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          if (!f) return;
          const url = URL.createObjectURL(f);
          setLocalModelUrl(url);
          setFpsFailed(false);
          setIsInteractive(true); // force load interactive 3D when file uploaded
        }}
      />

      {/* Bottom compact controls */}
      <div className="absolute right-3 bottom-3 bg-white/90 dark:bg-gray-900/80 backdrop-blur rounded-lg p-2 shadow flex items-center gap-2 text-xs z-10">
        {isWebGLSupported && isInteractive && !fpsFailed && (
          <div className="flex items-center gap-2 select-none">
            <label htmlFor="wireframe-toggle" className="text-xs cursor-pointer font-sans">
              Wireframe
            </label>
            <input
              id="wireframe-toggle"
              type="checkbox"
              checked={wireframe}
              onChange={() => setWireframe((s) => !s)}
              className="cursor-pointer"
            />
          </div>
        )}
        <div className="flex items-center gap-2 select-none">
          <label htmlFor="color-picker" className="text-xs cursor-pointer font-sans">
            Color
          </label>
          <input
            id="color-picker"
            aria-label="container-color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-6 p-0 border rounded cursor-pointer"
            type="color"
          />
        </div>
      </div>
    </div>
  );
}
