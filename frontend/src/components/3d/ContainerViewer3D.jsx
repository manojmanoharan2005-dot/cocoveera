/**
 * File: frontend/src/components/3d/ContainerViewer3D.jsx
 * Purpose: Premium logistics visualization card with on-demand Canvas loading, bottom toolbar controls, and real-time cargo metrics.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import containerPreviewImg from '../../assets/container_preview.png';
import ContainerViewer3DCanvas from './ContainerViewer3DCanvas';

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

export const ContainerViewer3D = React.memo(({ containerType, totalQuantity, autoRotate, palletItems = [] }) => {
  const [isTransparent, setIsTransparent] = useState(false);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [fpsFailed, setFpsFailed] = useState(false);

  // Loading progress, timeouts and error handlers
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [canvasLoading, setCanvasLoading] = useState(true);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [canvasError, setCanvasError] = useState(false);

  // Animation and camera positioning triggers
  const [resetTrigger, setResetTrigger] = useState(0);
  const [zoomInTrigger, setZoomInTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);

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

  // Monitor loading timeout
  useEffect(() => {
    let timer;
    if (isInteractive && canvasLoading && !canvasError) {
      timer = setTimeout(() => {
        setLoadTimeout(true);
      }, 10000);
    } else {
      setLoadTimeout(false);
    }
    return () => clearTimeout(timer);
  }, [isInteractive, canvasLoading, canvasError]);

  // Memoize calculated pallet positions layout
  const pallets = useMemo(() => {
    const list = [];
    const depth = containerType === '20FT' ? 6 : 12;
    const rowStride = containerType === '20FT' ? 1.08 : 1.04;
    const startZ = -depth / 2 + 0.1 + 0.55; // back wall clearance + half pallet depth
    
    let totalIndex = 0;
    
    for (const item of palletItems) {
      const palletsPerContainer = containerType === '20FT' ? 10 : 22;
      const numPalletsToRender = Math.round(item.quantity * palletsPerContainer);

      for (let i = 0; i < numPalletsToRender; i++) {
        const row = Math.floor(totalIndex / 2);
        const col = totalIndex % 2;
        const x = col === 0 ? -0.54 : 0.54; // Left or Right side (avoid wall clipping)
        const z = startZ + (row * rowStride); // Distance from back wall
        
        // Prevent visually overflowing the container if user selects > capacity
        if (z < depth / 2) {
          list.push({
            id: `${item.product?._id || item.product?.id || 'prod'}-${totalIndex}`,
            position: [x, 0.05, z],
            index: totalIndex,
            product: item.product
          });
        }
        totalIndex++;
      }
    }
    return list;
  }, [containerType, palletItems]);

  const handleFpsFail = () => {
    console.warn('FPS dropped below 30, switching to static fallback');
    setFpsFailed(true);
    setIsInteractive(false);
  };

  const handleProgress = (p) => {
    setLoadingProgress(p);
    if (p >= 100) {
      setTimeout(() => setCanvasLoading(false), 500);
    }
  };

  const handleRenderError = () => {
    setCanvasError(true);
    setFpsFailed(true);
    setIsInteractive(false);
  };

  const lightweight = isMobile || isLowEnd;

  // Calculate real-time metrics for professional dashboard info
  const fillRatio = totalQuantity === 0 ? 0 : (totalQuantity % 1 === 0 ? 1 : totalQuantity % 1);
  const usagePct = Math.round(fillRatio * 100);
  const remainingPct = 100 - usagePct;

  const totalItemsCount = useMemo(() => {
    let count = 0;
    for (const item of palletItems) {
      const palletsPerContainer = containerType === '20FT' ? 10 : 22;
      const numPallets = Math.round(item.quantity * palletsPerContainer);
      
      const category = item.product?.category || 'Coco Peat Products';
      const isGrowBag = category.toLowerCase().includes('grow bag') || category.toLowerCase().includes('growbag');
      const isBag = category.toLowerCase().includes('bag') && !isGrowBag;
      const isDisc = category.toLowerCase().includes('disc');
      
      let itemsPerPallet = 252; // default coir bricks
      if (isGrowBag) itemsPerPallet = 72;
      else if (isBag) itemsPerPallet = 90;
      else if (isDisc) itemsPerPallet = 396;
      
      count += numPallets * itemsPerPallet;
    }
    return count;
  }, [palletItems, containerType]);

  const volumeUsed = useMemo(() => {
    const maxCbm = containerType === '20FT' ? 28.0 : 58.0;
    return (maxCbm * fillRatio).toFixed(2);
  }, [containerType, fillRatio]);

  const weightUsed = useMemo(() => {
    const weightPerPallet = 950; // Average weight of coir products pallet (in KG)
    return pallets.length * weightPerPallet;
  }, [pallets]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-white/80 backdrop-blur-md rounded-[20px] border border-stone-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col gap-5 sm:gap-6"
    >
      {/* 1. CARD HEADER */}
      <div className="flex justify-between items-center">
        <h3 className="font-poppins font-black text-xs sm:text-sm text-stone-900 uppercase tracking-wide flex items-center gap-2">
          <span>📦</span> Container Visualizer
        </h3>
        
        {/* Usage status pill */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider hidden sm:inline">
            Utilization
          </span>
          <span className="bg-[#2E7D32]/10 text-[#2E7D32] px-3 py-1 rounded-full text-xs font-black font-poppins">
            {usagePct}%
          </span>
        </div>
      </div>

      {/* 2. VIEWPORT BOX */}
      <div 
        className="w-full h-[240px] sm:h-[370px] rounded-2xl overflow-hidden relative border border-stone-200/50 shadow-inner"
        style={{ background: 'radial-gradient(circle at center, #F5F7F5 0%, #E6EAE6 100%)' }}
      >
        {/* Empty State Overlay */}
        {totalQuantity === 0 && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <p className="text-stone-500 font-bold text-xs uppercase tracking-widest px-4 py-2 bg-white rounded-full shadow-sm border border-stone-200/20">
              Container is Empty
            </p>
          </div>
        )}
        
        {/* Sleek bottom controls toolbar inside viewport */}
        {isWebGLSupported && isInteractive && !fpsFailed && !canvasError && totalQuantity > 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-md rounded-full px-3 py-1.5 flex items-center gap-3.5 z-20 pointer-events-auto transition-all select-none">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsTransparent(true); }}
              className={`px-2.5 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider transition-colors ${
                isTransparent ? 'bg-[#2E7D32]/10 text-[#2E7D32]' : 'hover:bg-stone-100 text-stone-600'
              }`}
              title="X-Ray View (Translucent)"
            >
              🩻 X-Ray
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setIsTransparent(false); }}
              className={`px-2.5 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider transition-colors ${
                !isTransparent ? 'bg-[#2E7D32]/10 text-[#2E7D32]' : 'hover:bg-stone-100 text-stone-600'
              }`}
              title="Solid View (Opaque)"
            >
              🧱 Solid
            </button>
            
            <div className="h-4 w-px bg-stone-200" />
            
            <button 
              onClick={(e) => { e.stopPropagation(); setResetTrigger(prev => prev + 1); }}
              className="px-2 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
              title="Reset View Target"
            >
              🔄 Reset
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); setResetTrigger(prev => prev + 1); }}
              className="px-2 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
              title="Auto Frame Bounding Box"
            >
              📷 Fit
            </button>

            <div className="h-4 w-px bg-stone-200" />
            
            <button 
              onClick={(e) => { e.stopPropagation(); setZoomInTrigger(prev => prev + 1); }}
              className="px-1.5 py-0.5 rounded-full font-sans text-xs font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
              title="Zoom In"
            >
              ➕
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setZoomOutTrigger(prev => prev + 1); }}
              className="px-1.5 py-0.5 rounded-full font-sans text-xs font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
              title="Zoom Out"
            >
              ➖
            </button>

            <div className="h-4 w-px bg-stone-200" />

            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsInteractive(false); 
                setCanvasLoading(true);
                setLoadingProgress(0);
              }}
              className="px-2.5 py-1 rounded-full font-sans text-[10px] font-black uppercase tracking-wider text-red-655 hover:bg-red-50 transition-colors"
              title="Close and Destroy 3D Canvas"
            >
              ✕ Close
            </button>
          </div>
        )}

        {/* WebGL Canvas / Fallback Router */}
        {isWebGLSupported && isInteractive && !fpsFailed && !canvasError ? (
          <>
            {/* Glowing Outline Skeleton Loader */}
            {canvasLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50/90 z-20 transition-opacity duration-300">
                <div className="w-56 h-28 border-2 border-stone-300 border-dashed rounded-2xl animate-pulse relative flex items-center justify-center p-4">
                  <div className="absolute left-3 top-3 bottom-3 w-14 border border-stone-200 border-dashed rounded bg-stone-200/20" />
                  <div className="absolute left-20 top-3 bottom-3 w-14 border border-stone-200 border-dashed rounded bg-stone-200/20" />
                  <div className="absolute left-36 top-3 bottom-3 w-14 border border-stone-200 border-dashed rounded bg-stone-200/20" />
                  
                  <div className="text-center space-y-2 z-10">
                    <div className="w-5 h-5 border-2 border-stone-300 border-t-[#2E7D32] rounded-full animate-spin mx-auto" />
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block font-sans">
                      Loading Container...
                    </span>
                    <span className="text-[9px] font-bold text-stone-400 font-mono block">
                      {loadingProgress}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Timeout Fallback Overlay */}
            {loadTimeout && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-30 p-5 text-center space-y-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto border border-orange-200">
                  <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-stone-850 uppercase tracking-wider font-sans">Loading is taking too long</h4>
                  <p className="text-[10px] text-stone-500 font-semibold">The 3D assets or WebGL context could not be initialized in time.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setLoadTimeout(false);
                      setLoadingProgress(0);
                      setIsInteractive(false);
                      setTimeout(() => setIsInteractive(true), 150);
                    }}
                    className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-black rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Retry Loader
                  </button>
                  <button 
                    onClick={() => {
                      setIsInteractive(false);
                      setFpsFailed(true);
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-black rounded-xl transition-colors cursor-pointer"
                  >
                    Open Static Preview
                  </button>
                </div>
              </div>
            )}

            <ContainerViewer3DCanvas
              containerType={containerType}
              isTransparent={isTransparent}
              pallets={pallets}
              lightweight={lightweight}
              resetTrigger={resetTrigger}
              zoomInTrigger={zoomInTrigger}
              zoomOutTrigger={zoomOutTrigger}
              onProgress={handleProgress}
              onFpsFail={handleFpsFail}
              onRenderError={handleRenderError}
            />
          </>
        ) : (
          /* Static container fallback image */
          <div 
            onClick={() => {
              if (isWebGLSupported && !fpsFailed) {
                setCanvasLoading(true);
                setLoadingProgress(0);
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
              className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500"
            />
            <div
              className="absolute inset-0 opacity-20 mix-blend-color pointer-events-none"
              style={{ backgroundColor: '#2E7D32' }}
            />

            {!isWebGLSupported && (
              <div className="absolute bottom-4 left-4 bg-red-650 text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wide uppercase select-none shadow">
                3D Mode Unavailable
              </div>
            )}

            {(fpsFailed || canvasError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center p-4 z-10">
                <span className="text-white text-[10px] font-bold font-sans uppercase tracking-widest bg-red-600 px-3 py-1 rounded-full shadow select-none">
                  Interactive 3D Disabled
                </span>
                <p className="text-[10px] text-white/90 font-semibold mt-2.5 max-w-[200px] leading-relaxed select-none font-sans">
                  Interactive 3D temporarily unavailable.
                </p>
              </div>
            )}

            {isWebGLSupported && !isInteractive && !fpsFailed && !canvasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 hover:bg-black/25 transition-colors duration-300 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCanvasLoading(true);
                    setLoadingProgress(0);
                    setIsInteractive(true);
                  }}
                  className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95 font-sans pointer-events-auto"
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
      </div>

      {/* 3. UTILIZATION PROGRESS BAR */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold text-stone-500 uppercase tracking-wider">
          <span>Utilization Status</span>
          <span>{usagePct}% Capacity Filled</span>
        </div>
        <div className="relative w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200/50 shadow-inner">
          <div 
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#43A047] to-[#2E7D32] transition-all duration-700 ease-out shadow-[0_0_8px_rgba(46,125,50,0.3)]"
            style={{ width: `${usagePct}%` }}
          />
        </div>
      </div>

      {/* 4. REAL-TIME LOGISTICS INFO GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 border-t border-stone-100 pt-5 sm:pt-6">
        {/* Container Type */}
        <div className="bg-stone-50/50 border border-stone-200/40 rounded-xl p-3 text-center">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
            Container
          </span>
          <span className="text-xs font-black text-stone-880 uppercase mt-0.5 block">
            {containerType} FCL
          </span>
        </div>

        {/* Loaded % */}
        <div className="bg-stone-50/50 border border-stone-200/40 rounded-xl p-3 text-center">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
            Loaded
          </span>
          <span className="text-xs font-black text-[#2E7D32] uppercase mt-0.5 block">
            {usagePct}%
          </span>
        </div>

        {/* Remaining % */}
        <div className="bg-stone-50/50 border border-stone-200/40 rounded-xl p-3 text-center">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
            Remaining
          </span>
          <span className="text-xs font-black text-orange-600 uppercase mt-0.5 block">
            {remainingPct}%
          </span>
        </div>

        {/* Loaded packages */}
        <div className="bg-stone-50/50 border border-stone-200/40 rounded-xl p-3 text-center">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
            Cargo Items
          </span>
          <span className="text-xs font-black text-stone-850 uppercase mt-0.5 block">
            {totalQuantity > 0 ? totalItemsCount : 0}
          </span>
        </div>

        {/* Volume CBM */}
        <div className="bg-stone-50/50 border border-stone-200/40 rounded-xl p-3 text-center">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
            Volume Used
          </span>
          <span className="text-xs font-black text-stone-850 uppercase mt-0.5 block">
            {volumeUsed} CBM
          </span>
        </div>

        {/* Weight KG */}
        <div className="bg-stone-50/50 border border-stone-200/40 rounded-xl p-3 text-center">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
            Weight Loaded
          </span>
          <span className="text-xs font-black text-stone-850 uppercase mt-0.5 block">
            {weightUsed} KG
          </span>
        </div>
      </div>
    </div>
  );
});

ContainerViewer3D.displayName = 'ContainerViewer3D';
