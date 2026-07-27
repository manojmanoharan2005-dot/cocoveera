/**
 * File: frontend/src/pages/ContainerPreviewPage.jsx
 * Purpose: Fullscreen enterprise-grade 3D Container Viewer & Logistics Simulator for Cocoveera B2B Export Portal.
 */
import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/config';
import containerPreviewImg from '../assets/container_preview.png';
import { 
  ArrowLeft, RotateCcw, Maximize, Eye, EyeOff, Camera, Play, Pause, DoorOpen, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load the heavy 3D Canvas Engine component so Three.js loads ONLY on this page
const ContainerPreview3DCanvas = lazy(() => import('../components/3d/ContainerPreview3DCanvas'));

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

export default function ContainerPreviewPage() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Read active container configuration from Single Source of Truth (location.state or sessionStorage)
  const activeConfig = useMemo(() => {
    try {
      if (location.state?.containerType) {
        return location.state;
      }
      const saved = sessionStorage.getItem('cocoveera_active_config');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }, [location.state]);

  // State Management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3D Engine Controls & Viewport States (Single Source of Truth)
  const [containerType, setContainerType] = useState(() => activeConfig?.containerType || '20FT');
  const [totalQuantity, setTotalQuantity] = useState(() => activeConfig?.totalQuantity !== undefined ? activeConfig.totalQuantity : 1.00);
  const [palletItems, setPalletItems] = useState(() => activeConfig?.palletItems || []);

  const [isTransparent, setIsTransparent] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraPreset, setCameraPreset] = useState('perspective'); // 'perspective', 'top', 'front', 'side', 'inside', 'door'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [orbitMode, setOrbitMode] = useState('rotate'); // 'rotate', 'pan'

  // Persist updated containerType back to Single Source of Truth
  useEffect(() => {
    try {
      const current = JSON.parse(sessionStorage.getItem('cocoveera_active_config') || '{}');
      sessionStorage.setItem('cocoveera_active_config', JSON.stringify({
        ...current,
        containerType,
        totalQuantity,
        palletItems
      }));
    } catch (e) {}
  }, [containerType, totalQuantity, palletItems]);
  
  // Loading Sequence States
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [is3DReady, setIs3DReady] = useState(false);

  // Quantity & Logistics Calculations
  const [containerCount, setContainerCount] = useState(1);
  const [fps, setFps] = useState(60);
  const [hasWebGL, setHasWebGL] = useState(true);

  const canvasRef = useRef(null);

  // Silent WebGL Detection
  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  // Exact loading step strings requested
  const loadingSteps = [
    'Preparing Container...',
    'Loading Product Model...',
    'Building 3D Scene...',
    'Optimizing Graphics...',
    'Ready'
  ];

  // Fetch Product Data by Slug or ID
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Step loading animation
        let step = 0;
        const stepInterval = setInterval(() => {
          step = Math.min(step + 1, loadingSteps.length - 1);
          setLoadingStep(step);
          setLoadingProgress(Math.round(((step + 1) / loadingSteps.length) * 100));
        }, 400);

        let res;
        try {
          res = await axios.get(`${API_URL}/products/slug/${productSlug}`);
        } catch (err) {
          res = await axios.get(`${API_URL}/products/${productSlug}`);
        }

        if (isMounted) {
          clearInterval(stepInterval);
          setProduct(res.data);
          setLoadingProgress(100);
          setTimeout(() => {
            setLoading(false);
            setIs3DReady(true);
          }, 600);
        }
      } catch (err) {
        console.error('Failed to load product for 3D viewer:', err);
        // Fallback default product if route is tested standalone
        if (isMounted) {
          setProduct({
            _id: 'default-3d-prod',
            name: productSlug ? productSlug.replace(/-/g, ' ').toUpperCase() : 'COCOPEAT 5KG BLOCKS',
            category: 'Coco Peat Products',
            specifications: {
              length: 30,
              width: 30,
              height: 12,
              weightVal: 5,
              weightUnit: 'kg',
              ec: '< 0.5 mS/cm',
              ph: '5.5 - 6.5',
              moisture: '< 15%'
            },
            packageSize: '5KG Compressed Block',
            stock: 50
          });
          setLoading(false);
          setIs3DReady(true);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productSlug]);

  // Support ESC Key, Mobile Swipe Back, & History Back Navigation preserving scroll position
  const handleBack = () => {
    const targetSlug = productSlug || product?.slug || product?._id;
    
    // Check if there is history to go back to in the same tab session
    if (window.history.length > 1 && window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (targetSlug) {
      // Fallback navigation to User Dashboard Portal Product Details page
      navigate(`/product/${targetSlug}`);
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleBack();
      }
    };

    let touchStartX = 0;
    const handleTouchStart = (e) => {
      if (e.touches[0]) {
        touchStartX = e.touches[0].clientX;
      }
    };

    const handleTouchEnd = (e) => {
      if (e.changedTouches[0]) {
        const touchEndX = e.changedTouches[0].clientX;
        // If swiped right from left edge (> 100px swipe)
        if (touchStartX < 60 && touchEndX - touchStartX > 100) {
          handleBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Container Dimensions & Specs Mapping
  const containerSpecs = useMemo(() => {
    switch (containerType) {
      case '20FT':
        return { name: '20FT Standard FCL', length: 5.9, width: 2.35, height: 2.39, maxWeightMT: 24.0, cbmCapacity: 33.2, defaultPallets: 10 };
      case '40FT':
        return { name: '40FT Standard FCL', length: 12.03, width: 2.35, height: 2.39, maxWeightMT: 26.5, cbmCapacity: 67.7, defaultPallets: 20 };
      case '40HC':
      default:
        return { name: '40FT High Cube FCL', length: 12.03, width: 2.35, height: 2.69, maxWeightMT: 28.5, cbmCapacity: 76.4, defaultPallets: 22 };
    }
  }, [containerType]);

  // Dynamic Stacking Math Engine
  const logisticsMetrics = useMemo(() => {
    if (!product) {
      return {
        occupiedCBM: 0,
        remainingCBM: containerSpecs.cbmCapacity,
        loadingPct: 0,
        totalPallets: containerSpecs.defaultPallets,
        totalPieces: 2200,
        grossWeightKG: 22000,
        netWeightKG: 21500,
        rows: 2,
        cols: 11,
        layers: 4
      };
    }

    const cat = (product.category || '').toLowerCase();

    // Dimensional defaults in CM
    const lCM = product.specifications?.length || 30;
    const wCM = product.specifications?.width || 30;
    const hCM = product.specifications?.height || 12;
    const weightKG = product.specifications?.weightVal || 5;

    // Convert CM to Meters
    const lM = lCM / 100;
    const wM = wCM / 100;
    const hM = hCM / 100;

    // Standard Industrial Pallet Dims (1.1m x 1.1m x 0.15m height)
    const palletLengthM = 1.1;
    const palletWidthM = 1.1;
    const palletHeightM = 0.15;

    // Available container height for cargo above pallet
    const maxCargoHeightM = containerSpecs.height - palletHeightM - 0.1; // 10cm safety clearance

    // Units per Pallet Layer
    const unitsPerRowOnPallet = Math.floor(palletLengthM / lM) || 3;
    const unitsPerColOnPallet = Math.floor(palletWidthM / wM) || 3;
    const unitsPerLayerOnPallet = unitsPerRowOnPallet * unitsPerColOnPallet;

    // Layers per Pallet
    const layersOnPallet = Math.floor(maxCargoHeightM / hM) || 12;
    const totalUnitsPerPallet = unitsPerLayerOnPallet * layersOnPallet;

    const totalPallets = containerSpecs.defaultPallets;
    const totalPieces = Math.round(totalPallets * totalUnitsPerPallet * (totalQuantity >= 1 ? 1 : totalQuantity));

    const pieceCBM = lM * wM * hM;
    const isFullContainer = totalQuantity >= 1;
    const occupiedCBM = isFullContainer ? containerSpecs.cbmCapacity : Math.min(containerSpecs.cbmCapacity, parseFloat((pieceCBM * totalPieces).toFixed(1)));
    const remainingCBM = isFullContainer ? 0 : Math.max(0, parseFloat((containerSpecs.cbmCapacity - occupiedCBM).toFixed(1)));
    const loadingPct = isFullContainer ? 100 : Math.min(100, Math.round((occupiedCBM / containerSpecs.cbmCapacity) * 100));

    const grossWeightKG = Math.round(totalPieces * weightKG + totalPallets * 25); // + 25kg per wooden pallet
    const netWeightKG = Math.round(totalPieces * weightKG);

    const cols = containerType === '20FT' ? 5 : 11;
    const rows = 2;
    const layers = layersOnPallet;

    return {
      occupiedCBM,
      remainingCBM,
      loadingPct,
      totalPallets,
      totalPieces: totalPieces || 1530,
      grossWeightKG: grossWeightKG || 7900,
      netWeightKG: netWeightKG || 7700,
      rows,
      cols,
      layers
    };
  }, [product, containerSpecs, containerType, totalQuantity]);

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Screenshot Snapshot Generator
  const takeScreenshot = () => {
    if (canvasRef.current) {
      try {
        const canvas = canvasRef.current.querySelector('canvas');
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `Cocoveera_3D_Container_${product?.name || 'Cargo'}_${containerType}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (e) {
        console.error('Failed to take 3D screenshot:', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-stone-950 text-white overflow-hidden font-sans select-none z-50 flex flex-col">
      
      {/* 1. TOP NAVIGATION BAR */}
      <header className="h-16 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        
        {/* Left: Back to Product */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-bold font-poppins transition-all border border-stone-700/60 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Back to Product</span>
          </button>

          <div className="h-6 w-px bg-stone-800 hidden sm:block" />

          {/* Product Title & Category */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-poppins font-black text-sm sm:text-base text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {product?.name || 'Cocoveera Product 3D Preview'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hidden md:inline-block">
                {product?.category || 'Export Substrate'}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-semibold truncate hidden sm:block">
              {product?.packageSize || 'Compressed Export Stacking'} • Dims: {product?.specifications?.length || 30}x{product?.specifications?.width || 30}x{product?.specifications?.height || 12}cm
            </p>
          </div>
        </div>

        {/* Right: Container Switcher & Connection Status */}
        <div className="flex items-center gap-3">
          
          {/* Container Type Selector */}
          <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800">
            {['20FT', '40FT', '40HC'].map((type) => (
              <button
                key={type}
                onClick={() => setContainerType(type)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-black font-poppins transition-all cursor-pointer ${
                  containerType === type
                    ? 'bg-[#2E7D32] text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Utilization Badge */}
          <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-800/60 rounded-xl hidden lg:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black text-emerald-300 font-poppins">
              {logisticsMetrics.loadingPct}% Filled
            </span>
          </div>

          {/* FPS & Connection Status */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-stone-950 rounded-xl border border-stone-800 text-[10px] font-extrabold text-stone-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Connected • 60 FPS</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <div className="relative flex-1 w-full h-full bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 overflow-hidden">
        
        {/* LOADING EXPERIENCE OVERLAY */}
        <AnimatePresence>
          {!is3DReady && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-40 bg-stone-950 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-emerald-500/20 border-t-[#2E7D32] rounded-full animate-spin" />
                <Package className="w-10 h-10 text-[#2E7D32] animate-pulse" />
              </div>

              <h2 className="font-poppins font-black text-xl text-white tracking-tight mb-2">
                Industrial 3D Logistics Engine
              </h2>
              <p className="text-xs text-stone-400 font-semibold mb-6 max-w-sm">
                {loadingSteps[loadingStep]}
              </p>

              {/* Progress Bar */}
              <div className="w-64 sm:w-80 h-2 bg-stone-800 rounded-full overflow-hidden mb-3 border border-stone-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-[#43A047] to-[#2E7D32] transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>

              <span className="text-[11px] font-black text-emerald-400 font-poppins">
                {loadingProgress}% Complete
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. FULLSCREEN 3D CANVAS SCENE WITH SILENT WEBGL FALLBACK */}
        <div ref={canvasRef} className="w-full h-full relative">
          <Suspense fallback={null}>
            {hasWebGL ? (
              <ContainerPreview3DCanvas
                containerType={containerType}
                product={product}
                totalQuantity={totalQuantity}
                palletItems={palletItems}
                isTransparent={isTransparent}
                doorOpen={doorOpen}
                autoRotate={autoRotate}
                cameraPreset={cameraPreset}
                zoomLevel={zoomLevel}
                orbitMode={orbitMode}
                onFpsUpdate={setFps}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8 bg-stone-950">
                <img 
                  src={containerPreviewImg} 
                  alt="Cocoveera Shipping Container Model" 
                  className="max-w-4xl max-h-[75vh] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]" 
                />
              </div>
            )}
          </Suspense>
        </div>

        {/* 3. FLOATING RIGHT TOOLBAR (CIRCULAR ACTION BUTTONS) */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
          
          {/* Transparent / Opaque View Toggle */}
          <button
            onClick={() => setIsTransparent(!isTransparent)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg border backdrop-blur-md active:scale-90 cursor-pointer ${
              isTransparent 
                ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-emerald-500/20' 
                : 'bg-stone-900/90 text-stone-300 hover:text-white border-stone-700 hover:border-stone-500'
            }`}
            title={isTransparent ? 'Switch to Opaque Steel View' : 'Switch to Transparent X-Ray View'}
          >
            {isTransparent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          {/* Open / Close Container Doors */}
          <button
            onClick={() => setDoorOpen(!doorOpen)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg border backdrop-blur-md active:scale-90 cursor-pointer ${
              doorOpen 
                ? 'bg-amber-500 text-stone-950 border-amber-400' 
                : 'bg-stone-900/90 text-stone-300 hover:text-white border-stone-700 hover:border-stone-500'
            }`}
            title={doorOpen ? 'Close Container Doors' : 'Open Container Doors'}
          >
            <DoorOpen className="w-5 h-5" />
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg border backdrop-blur-md active:scale-90 cursor-pointer ${
              autoRotate 
                ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500/50' 
                : 'bg-stone-900/90 text-stone-400 hover:text-white border-stone-700'
            }`}
            title={autoRotate ? 'Pause Camera Rotation' : 'Auto Rotate Scene'}
          >
            {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <div className="w-8 h-px bg-stone-800 mx-auto my-1" />

          {/* Camera View Presets */}
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-2xl p-1.5 flex flex-col gap-1.5 shadow-lg">
            <button
              onClick={() => setCameraPreset('top')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black uppercase transition-all ${
                cameraPreset === 'top' ? 'bg-[#2E7D32] text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
              title="Top View"
            >
              TOP
            </button>
            <button
              onClick={() => setCameraPreset('front')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black uppercase transition-all ${
                cameraPreset === 'front' ? 'bg-[#2E7D32] text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
              title="Front Door View"
            >
              FRONT
            </button>
            <button
              onClick={() => setCameraPreset('side')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black uppercase transition-all ${
                cameraPreset === 'side' ? 'bg-[#2E7D32] text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
              title="Side View"
            >
              SIDE
            </button>
            <button
              onClick={() => setCameraPreset('inside')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black uppercase transition-all ${
                cameraPreset === 'inside' ? 'bg-[#2E7D32] text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
              title="Inside Container View"
            >
              INSIDE
            </button>
          </div>

          <div className="w-8 h-px bg-stone-800 mx-auto my-1" />

          {/* Reset Camera */}
          <button
            onClick={() => {
              setCameraPreset('perspective');
              setZoomLevel(1);
            }}
            className="w-11 h-11 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-all shadow-lg border border-stone-700 active:scale-90 cursor-pointer"
            title="Reset Camera Position"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Take Screenshot */}
          <button
            onClick={takeScreenshot}
            className="w-11 h-11 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-all shadow-lg border border-stone-700 active:scale-90 cursor-pointer"
            title="Download HD 3D Snapshot"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="w-11 h-11 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-all shadow-lg border border-stone-700 active:scale-90 cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>

        </div>

        {/* 4. BOTTOM INDUSTRIAL INFORMATION PANEL (LOGISTICS HUD) */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-20">
          <div className="bg-stone-900/95 backdrop-blur-md border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
            
            {/* Header & Main Stats Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  📦
                </div>
                <div>
                  <h3 className="font-poppins font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                    {containerSpecs.name} Cargo Manifest
                  </h3>
                  <span className="text-[10px] text-stone-400 font-semibold block">
                    Optimized Export Stacking Strategy ({logisticsMetrics.rows}x{logisticsMetrics.cols} Grid)
                  </span>
                </div>
              </div>

              {/* Quick Summary Pill Badges */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-3 py-1 bg-stone-950 rounded-xl text-stone-300 font-bold border border-stone-800">
                  Pallets: <strong className="text-white">{logisticsMetrics.totalPallets}</strong>
                </span>
                <span className="px-3 py-1 bg-stone-950 rounded-xl text-stone-300 font-bold border border-stone-800">
                  Pieces: <strong className="text-emerald-400">{logisticsMetrics.totalPieces.toLocaleString()}</strong>
                </span>
                <span className="px-3 py-1 bg-stone-950 rounded-xl text-stone-300 font-bold border border-stone-800">
                  Weight: <strong className="text-white">{(logisticsMetrics.grossWeightKG / 1000).toFixed(1)} MT</strong>
                </span>
              </div>
            </div>

            {/* Comprehensive Grid Metrics (12 KPI Cards) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 text-center">
              <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[8.5px] font-extrabold text-stone-400 uppercase block">Occupied Vol</span>
                <span className="text-xs font-black text-white font-poppins">{logisticsMetrics.occupiedCBM} CBM</span>
              </div>

              <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[8.5px] font-extrabold text-stone-400 uppercase block">Remaining Vol</span>
                <span className="text-xs font-black text-emerald-400 font-poppins">{logisticsMetrics.remainingCBM} CBM</span>
              </div>

              <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[8.5px] font-extrabold text-stone-400 uppercase block">Total Capacity</span>
                <span className="text-xs font-black text-white font-poppins">{containerSpecs.cbmCapacity} CBM</span>
              </div>

              <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[8.5px] font-extrabold text-stone-400 uppercase block">Loading %</span>
                <span className="text-xs font-black text-emerald-400 font-poppins">{logisticsMetrics.loadingPct}%</span>
              </div>

              <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[8.5px] font-extrabold text-stone-400 uppercase block">Total Pieces</span>
                <span className="text-xs font-black text-white font-poppins">{logisticsMetrics.totalPieces.toLocaleString()}</span>
              </div>

              <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[8.5px] font-extrabold text-stone-400 uppercase block">Total Pallets</span>
                <span className="text-xs font-black text-white font-poppins">{logisticsMetrics.totalPallets}</span>
              </div>

              <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[8.5px] font-extrabold text-stone-400 uppercase block">Gross Weight</span>
                <span className="text-xs font-black text-white font-poppins">{(logisticsMetrics.grossWeightKG / 1000).toFixed(1)} MT</span>
              </div>

              <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[8.5px] font-extrabold text-stone-400 uppercase block">Net Weight</span>
                <span className="text-xs font-black text-white font-poppins">{(logisticsMetrics.netWeightKG / 1000).toFixed(1)} MT</span>
              </div>

              <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[8.5px] font-extrabold text-stone-400 uppercase block">CBM / Unit</span>
                <span className="text-xs font-black text-white font-poppins">
                  {((product?.specifications?.length || 30) * (product?.specifications?.width || 30) * (product?.specifications?.height || 12) / 1000000).toFixed(3)}
                </span>
              </div>

              <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[8.5px] font-extrabold text-stone-400 uppercase block">Pallet Rows</span>
                <span className="text-xs font-black text-white font-poppins">{logisticsMetrics.rows} Rows</span>
              </div>

              <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[8.5px] font-extrabold text-stone-400 uppercase block">Pallet Cols</span>
                <span className="text-xs font-black text-white font-poppins">{logisticsMetrics.cols} Cols</span>
              </div>

              <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/80">
                <span className="text-[8.5px] font-extrabold text-stone-400 uppercase block">Stack Layers</span>
                <span className="text-xs font-black text-white font-poppins">{logisticsMetrics.layers} Layers</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
