/**
 * File: frontend/src/components/GlobalMap.jsx
 * Purpose: Enterprise Global Shipping Network Dashboard for Cocoveera B2B Export Website.
 * Renders real-time SVG cargo vessel transit from Tuticorin Port to global destination ports.
 * Features 100% precise SVG path tracking via native getPointAtLength API, smooth 2.6s voyage,
 * rotational alignment, arrival ripples, and clean light UI with no transit days displayed.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { geoMercator } from 'd3-geo';
import { Anchor, Ship, CheckCircle2, Box, Award } from 'lucide-react';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Hero Origin Port (Tuticorin Port / Coimbatore HQ, Tamil Nadu, India)
export const ORIGIN = {
  id: 'india_hub',
  name: 'TUTICORIN PORT',
  sub: 'Manufacturing & Export Hub',
  country: 'India',
  city: 'Tuticorin Port (Thoothukudi)',
  coordinates: [78.1348, 8.7642],
};

// Global Export Destinations (Strictly NO transit days or distance fields)
export const DESTINATIONS = [
  {
    id: 'usa',
    code: 'US',
    country: 'USA',
    flag: '🇺🇸',
    city: 'Los Angeles',
    port: 'Port of Los Angeles',
    products: ['Cocopeat 5kg Blocks', 'Grow Bags'],
    containersExported: '850+ FEU',
    yearsPartnership: '6+ Years',
    coordinates: [-118.2437, 34.0522],
    curveOffset: -45,
  },
  {
    id: 'uk',
    code: 'GB',
    country: 'UK',
    flag: '🇬🇧',
    city: 'London',
    port: 'Port of Tilbury',
    products: ['Cocopeat Blocks', 'Coco Husk Chips'],
    containersExported: '420+ FEU',
    yearsPartnership: '5+ Years',
    coordinates: [-0.1276, 51.5072],
    curveOffset: 45,
  },
  {
    id: 'netherlands',
    code: 'NL',
    country: 'Netherlands',
    flag: '🇳🇱',
    city: 'Rotterdam',
    port: 'Port of Rotterdam',
    products: ['Buffered Grow Bags', 'Coir Pith'],
    containersExported: '650+ FEU',
    yearsPartnership: '7+ Years',
    coordinates: [4.4777, 51.9244],
    curveOffset: 38,
  },
  {
    id: 'germany',
    code: 'DE',
    country: 'Germany',
    flag: '🇩🇪',
    city: 'Hamburg',
    port: 'Port of Hamburg',
    products: ['Grow Bags', 'Coco Chips'],
    containersExported: '380+ FEU',
    yearsPartnership: '4+ Years',
    coordinates: [9.9937, 53.5511],
    curveOffset: 30,
  },
  {
    id: 'spain',
    code: 'ES',
    country: 'Spain',
    flag: '🇪🇸',
    city: 'Valencia',
    port: 'Port of Valencia',
    products: ['Grow Bags', 'Coir Pith'],
    containersExported: '290+ FEU',
    yearsPartnership: '4+ Years',
    coordinates: [-0.3763, 39.4699],
    curveOffset: 32,
  },
  {
    id: 'uae',
    code: 'AE',
    country: 'UAE',
    flag: '🇦🇪',
    city: 'Dubai',
    port: 'Jebel Ali Port',
    products: ['Cocopeat Blocks', 'Grow Bags'],
    containersExported: '510+ FEU',
    yearsPartnership: '6+ Years',
    coordinates: [55.1713, 25.0657],
    curveOffset: 18,
  },
  {
    id: 'saudi',
    code: 'SA',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    city: 'Jeddah',
    port: 'Jeddah Islamic Port',
    products: ['Cocopeat Blocks', 'Coir Pith'],
    containersExported: '340+ FEU',
    yearsPartnership: '4+ Years',
    coordinates: [39.1925, 21.4858],
    curveOffset: 22,
  },
  {
    id: 'singapore',
    code: 'SG',
    country: 'Singapore',
    flag: '🇸🇬',
    city: 'Singapore',
    port: 'Port of Singapore',
    products: ['Hydroponic Substrates', 'Grow Bags'],
    containersExported: '260+ FEU',
    yearsPartnership: '3+ Years',
    coordinates: [103.8198, 1.3521],
    curveOffset: -18,
  },
  {
    id: 'vietnam',
    code: 'VN',
    country: 'Vietnam',
    flag: '🇻🇳',
    city: 'Hai Phong',
    port: 'Hai Phong Port',
    products: ['Coir Pith Blocks', 'Grow Bags'],
    containersExported: '430+ FEU',
    yearsPartnership: '4+ Years',
    coordinates: [106.6881, 20.8651],
    curveOffset: -22,
  },
  {
    id: 'skorea',
    code: 'KR',
    country: 'South Korea',
    flag: '🇰🇷',
    city: 'Busan',
    port: 'Port of Busan',
    products: ['Grow Bags', 'Coco Chips'],
    containersExported: '490+ FEU',
    yearsPartnership: '5+ Years',
    coordinates: [129.0756, 35.1796],
    curveOffset: -32,
  },
  {
    id: 'japan',
    code: 'JP',
    country: 'Japan',
    flag: '🇯🇵',
    city: 'Tokyo',
    port: 'Port of Tokyo',
    products: ['Cocopeat Blocks', 'Grow Bags'],
    containersExported: '530+ FEU',
    yearsPartnership: '6+ Years',
    coordinates: [139.6503, 35.6762],
    curveOffset: -38,
  },
  {
    id: 'australia',
    code: 'AU',
    country: 'Australia',
    flag: '🇦🇺',
    city: 'Melbourne',
    port: 'Port of Melbourne',
    products: ['Buffered Grow Bags', 'Coco Chips'],
    containersExported: '610+ FEU',
    yearsPartnership: '5+ Years',
    coordinates: [144.9631, -37.8136],
    curveOffset: -45,
  },
  {
    id: 'nz',
    code: 'NZ',
    country: 'New Zealand',
    flag: '🇳🇿',
    city: 'Auckland',
    port: 'Ports of Auckland',
    products: ['Cocopeat Blocks', 'Husk Chips'],
    containersExported: '210+ FEU',
    yearsPartnership: '3+ Years',
    coordinates: [174.7633, -36.8485],
    curveOffset: -52,
  },
];

// Helper: Calculate Quadratic Bezier Curve string
const getCurvedPathString = (start, end, offset = -30) => {
  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2;
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const ctrlX = midX + nx * offset;
  const ctrlY = midY + ny * offset;

  return `M ${start[0]} ${start[1]} Q ${ctrlX} ${ctrlY} ${end[0]} ${end[1]}`;
};

const GlobalMap = ({ onSelectDestination, activeDestId }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDestId, setSelectedDestId] = useState('vietnam');
  const [hoveredDestId, setHoveredDestId] = useState(null);

  // Live Voyage Progress State (0 to 1)
  const [progress, setProgress] = useState(0);
  const [isDelivered, setIsDelivered] = useState(false);
  const [shipState, setShipState] = useState({ x: 0, y: 0, angle: 0 });

  const activePathRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeDest = useMemo(() => {
    const id = activeDestId || selectedDestId;
    return DESTINATIONS.find((d) => d.id === id) || DESTINATIONS[8]; // Default Vietnam
  }, [activeDestId, selectedDestId]);

  // Map Projection Dimensions & Positioning
  const width = 1000;
  const height = isMobile ? 460 : 580;
  const scale = isMobile ? 145 : 155;
  const center = useMemo(() => (isMobile ? [15, 10] : [20, 15]), [isMobile]);

  const projection = useMemo(() => {
    return geoMercator()
      .scale(scale)
      .center(center)
      .translate([width / 2, height / 2]);
  }, [scale, center, width, height]);

  const hqPos = useMemo(() => projection(ORIGIN.coordinates), [projection]);
  const activeDestPos = useMemo(() => projection(activeDest.coordinates), [projection, activeDest]);

  // Compute curved SVG path string for active shipping lane
  const activePathD = useMemo(() => {
    if (!hqPos || !activeDestPos) return "";
    return getCurvedPathString(hqPos, activeDestPos, activeDest.curveOffset || -30);
  }, [hqPos, activeDestPos, activeDest]);

  // 100% Reliable SVG Path Tracking & Vessel Navigation Loop
  useEffect(() => {
    if (!activeDest) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    setProgress(0);
    setIsDelivered(false);

    const startTime = performance.now();
    const duration = 2600; // 2.6 seconds voyage duration

    const updateVesselPosition = (now) => {
      const elapsed = now - startTime;
      const currentProgress = Math.min(1, elapsed / duration);
      setProgress(currentProgress);

      // Query native SVGPathElement for exact coordinates and tangent direction
      if (activePathRef.current) {
        try {
          const totalLen = activePathRef.current.getTotalLength();
          if (totalLen > 0) {
            const currentLen = currentProgress * totalLen;
            const pt = activePathRef.current.getPointAtLength(currentLen);
            const nextLen = Math.min(totalLen, currentLen + 2.0);
            const nextPt = activePathRef.current.getPointAtLength(nextLen);
            
            const dx = nextPt.x - pt.x;
            const dy = nextPt.y - pt.y;
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

            setShipState({ x: pt.x, y: pt.y, angle });
          }
        } catch (e) {
          // Fallback if path element not ready
        }
      }

      if (currentProgress < 1) {
        animFrameRef.current = requestAnimationFrame(updateVesselPosition);
      } else {
        setIsDelivered(true);
      }
    };

    // Small delay to allow SVG path element ref to register
    const timer = setTimeout(() => {
      animFrameRef.current = requestAnimationFrame(updateVesselPosition);
    }, 30);

    return () => {
      clearTimeout(timer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeDest?.id, activePathD]);

  const handleSelectCountry = (dest) => {
    setSelectedDestId(dest.id);
    if (onSelectDestination) {
      onSelectDestination(dest);
    }
  };

  return (
    <div className="w-full bg-[#F4FAF6] rounded-[32px] border border-emerald-100/90 p-4 sm:p-8 shadow-2xl overflow-hidden font-sans text-stone-800 relative">
      
      {/* ═══════════════════════════════════════════════════════════════════
          1. TOP COUNTRY SELECTOR PILLS
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none border-b border-emerald-100/70 relative z-20">
        <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-widest whitespace-nowrap mr-2">
          SELECT COUNTRY:
        </span>
        {DESTINATIONS.map((dest) => {
          const isSelected = activeDest.id === dest.id;
          return (
            <button
              key={`chip-${dest.id}`}
              onClick={() => handleSelectCountry(dest)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-[#10B981] text-white border-[#059669] shadow-md shadow-emerald-500/30 scale-105'
                  : 'bg-white hover:bg-emerald-50 text-stone-700 border-stone-200/80 hover:border-emerald-300'
              }`}
            >
              <span className="text-[10px] opacity-75 font-semibold">{dest.code}</span>
              <span>{dest.country}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          2. LIGHT MAP CANVAS
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full bg-[#F8FBF9] rounded-[26px] border border-emerald-100/80 overflow-hidden shadow-inner h-[360px] xs:h-[420px] sm:h-[520px] lg:h-[620px] select-none flex items-center justify-center">
        
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale, center }}
          width={width}
          height={height}
          style={{ width: "100%", height: "100%", backgroundColor: "#F8FBF9" }}
        >
          <ZoomableGroup center={center} zoom={1} minZoom={1} maxZoom={1} disableZoom disablePanning>
            
            {/* World Land Mass */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#DDE8E1"
                    stroke="#C8D6CF"
                    strokeWidth={0.6}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#CDE3D5", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* INACTIVE ROUTE LINES */}
            <g className="pointer-events-none">
              {DESTINATIONS.map((dest) => {
                if (dest.id === activeDest.id) return null;
                const pos = projection(dest.coordinates);
                if (!pos || !hqPos) return null;

                const pathD = getCurvedPathString(hqPos, pos, dest.curveOffset || -30);
                return (
                  <path
                    key={`inactive-route-${dest.id}`}
                    d={pathD}
                    fill="none"
                    stroke="#B4C9BC"
                    strokeWidth={1.2}
                    strokeDasharray="4 4"
                    opacity={0.35}
                  />
                );
              })}
            </g>

            {/* ACTIVE SHIPPING ROUTE PATH */}
            {activePathD && (
              <g className="pointer-events-none">
                <defs>
                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Soft Green Glow Aura */}
                <path
                  d={activePathD}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={6}
                  opacity={0.3}
                  filter="url(#routeGlow)"
                />

                {/* Main Active Route Line (Ref attached for getPointAtLength) */}
                <path
                  ref={activePathRef}
                  id="active-shipping-lane"
                  d={activePathD}
                  fill="none"
                  stroke="#059669"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeDasharray="7 5"
                />
              </g>
            )}

            {/* TUTICORIN PORT (HERO DISPATCH HUB) */}
            <Marker coordinates={ORIGIN.coordinates}>
              <g className="cursor-pointer group" transform="translate(0, 0)">
                <circle r={isMobile ? 18 : 22} fill="#10B981" opacity={0.25} className="animate-ping" />
                <circle r={isMobile ? 12 : 14} fill="#059669" stroke="#FFFFFF" strokeWidth={3} className="shadow-lg" />
                
                <foreignObject x="-14" y="-14" width="28" height="28" className="pointer-events-none">
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Anchor className="w-4 h-4 text-white" />
                  </div>
                </foreignObject>

                {/* Permanent Tuticorin Port Label Badge */}
                <foreignObject x="-85" y="18" width="170" height="48" className="pointer-events-none overflow-visible">
                  <div className="flex flex-col items-center">
                    <div className="bg-white/95 text-stone-900 px-3 py-1 rounded-xl border border-emerald-300 shadow-xl text-center whitespace-nowrap backdrop-blur-md">
                      <div className="text-[10px] font-extrabold tracking-wider leading-tight text-emerald-800 flex items-center justify-center gap-1">
                        <span>🇮🇳</span> {ORIGIN.name}
                      </div>
                      <div className="text-[8px] text-emerald-700 font-semibold leading-tight">
                        {ORIGIN.sub}
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </g>
            </Marker>

            {/* ALL DESTINATION MARKERS */}
            {DESTINATIONS.map((dest) => {
              const isSelected = activeDest.id === dest.id;
              const isHovered = hoveredDestId === dest.id;

              return (
                <Marker key={`dest-marker-${dest.id}`} coordinates={dest.coordinates}>
                  <g
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCountry(dest);
                    }}
                    onMouseEnter={() => setHoveredDestId(dest.id)}
                    onMouseLeave={() => setHoveredDestId(null)}
                  >
                    {/* Destination Arrival Ripple when Delivered */}
                    {isSelected && isDelivered && (
                      <>
                        <circle r={isMobile ? 26 : 32} fill="#34D399" opacity={0.35} className="animate-ping" />
                        <circle r={isMobile ? 18 : 22} fill="#059669" opacity={0.25} className="animate-pulse" />
                      </>
                    )}

                    {/* Outer Pin */}
                    <circle
                      r={isSelected ? (isMobile ? 13 : 15) : (isMobile ? 7.5 : 9)}
                      fill={isSelected ? '#059669' : '#10B981'}
                      opacity={isSelected ? 0.95 : 0.75}
                      className={isSelected ? "animate-pulse" : ""}
                    />
                    
                    {/* Inner Core Circle */}
                    <circle
                      r={isSelected ? (isMobile ? 7.5 : 8.5) : (isMobile ? 4.5 : 5.5)}
                      fill={isSelected ? '#FFFFFF' : '#ECFDF5'}
                      stroke={isSelected ? '#047857' : '#059669'}
                      strokeWidth={2.2}
                      className="transition-transform duration-200 group-hover:scale-125 shadow-md"
                    />

                    {/* ANCHORED POPUP CARD ABOVE ACTIVE DESTINATION PIN */}
                    <AnimatePresence>
                      {isSelected && (
                        <foreignObject
                          x="-95"
                          y={isMobile ? "-75" : "-85"}
                          width="190"
                          height="80"
                          className="pointer-events-none overflow-visible z-50"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center"
                          >
                            <div className="bg-white/95 text-stone-900 px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-300 text-center whitespace-nowrap min-w-[140px] backdrop-blur-md">
                              <div className="text-[11px] font-extrabold flex items-center justify-center gap-1.5 leading-tight text-stone-900">
                                <span>{dest.code}</span>
                                <span>{dest.country}</span>
                              </div>
                              <div className="text-[9px] text-emerald-700 font-semibold leading-tight mt-0.5 flex items-center justify-center gap-1">
                                <Anchor className="w-2.5 h-2.5 text-emerald-600" /> {dest.port}
                              </div>
                              <div className="mt-1 flex items-center justify-center gap-1 text-[8px] font-extrabold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {isDelivered ? (
                                  <span className="text-emerald-700 flex items-center gap-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> DELIVERED
                                  </span>
                                ) : (
                                  <span className="text-teal-700 flex items-center gap-0.5">
                                    <Ship className="w-2.5 h-2.5 text-teal-600 animate-bounce" /> IN TRANSIT ({Math.round(progress * 100)}%)
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-2.5 h-2.5 bg-white/95 rotate-45 -mt-1 border-r border-b border-emerald-300" />
                          </motion.div>
                        </foreignObject>
                      )}
                    </AnimatePresence>
                  </g>
                </Marker>
              );
            })}

            {/* REALISTIC SVG CARGO VESSEL FLOATING & SAILING ALONG PATH */}
            <g className="cargo-ship-layer" style={{ pointerEvents: 'none' }}>
              <g 
                transform={`translate(${shipState.x}, ${shipState.y}) rotate(${shipState.angle})`}
                style={{ transition: 'transform 0.03s linear' }}
              >
                {/* Stern Water Trail & Foam */}
                <ellipse cx="-22" cy="0" rx="14" ry="4" fill="#6EE7B7" opacity={0.6} className="animate-pulse" />
                <circle cx="-10" cy="-2" r="1.5" fill="#A7F3D0" opacity={0.8} />

                {/* Detailed Container Ship SVG */}
                <g transform="translate(-20, -11)">
                  {/* Drop Shadow */}
                  <path 
                    d="M 2 13 L 8 17 L 30 17 L 36 13 L 30 9 L 8 9 Z" 
                    fill="#000000" 
                    opacity={0.18} 
                    transform="translate(0, 3)" 
                  />

                  {/* Steel Hull */}
                  <path 
                    d="M 2 11 L 8 5 L 30 5 L 36 11 L 30 17 L 8 17 Z" 
                    fill="#047857" 
                    stroke="#FFFFFF" 
                    strokeWidth="1.5" 
                  />

                  {/* Stacked Green Cargo Containers */}
                  <rect x="10" y="6.5" width="5" height="9" rx="0.5" fill="#10B981" />
                  <rect x="16" y="6.5" width="5" height="9" rx="0.5" fill="#059669" />
                  <rect x="22" y="6.5" width="5" height="9" rx="0.5" fill="#34D399" />
                  <rect x="28" y="6.5" width="4.5" height="9" rx="0.5" fill="#047857" />

                  {/* Ship Bridge & Tower */}
                  <rect x="5" y="5.5" width="4" height="10" rx="0.8" fill="#FFFFFF" stroke="#047857" strokeWidth="0.8" />
                  <rect x="6" y="7" width="2" height="2" fill="#0284C7" />
                </g>
              </g>
            </g>

          </ZoomableGroup>
        </ComposableMap>

        {/* ═══════════════════════════════════════════════════════════════════
            3. FLOATING WHITE TELEMETRY CARD (BOTTOM-LEFT)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto bg-white/95 border border-emerald-100 backdrop-blur-xl p-4 sm:p-5 rounded-[24px] shadow-2xl shadow-emerald-950/10 max-w-md pointer-events-auto">
          
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-extrabold text-emerald-800 text-xs shadow-xs">
                {activeDest.code}
              </div>
              <div>
                <div className="text-sm font-extrabold text-stone-900 leading-tight">
                  Tuticorin ➔ {activeDest.country}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <Anchor className="w-3 h-3 text-emerald-600" /> {activeDest.port}
                </div>
              </div>
            </div>

            <div>
              {isDelivered ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-full shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> DELIVERED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-800 bg-teal-100/90 border border-teal-300 px-2.5 py-1 rounded-full shadow-xs">
                  <Ship className="w-3 h-3 text-teal-600 animate-bounce" /> IN TRANSIT
                </span>
              )}
            </div>
          </div>

          {/* GREEN PROGRESS BAR WITH GLIDING VESSEL ICON */}
          <div className="relative w-full bg-stone-100 rounded-full h-2.5 mb-3 overflow-hidden border border-stone-200/60">
            <div 
              className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 h-full transition-all duration-75 rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* 2-COLUMN METRICS GRID (STRICTLY NO TRANSIT DAYS / DISTANCE) */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
            <div className="bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-100/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-700 shadow-xs border border-emerald-100">
                <Box className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-stone-500 font-semibold">Exported</div>
                <div className="text-xs sm:text-sm font-extrabold text-stone-900">{activeDest.containersExported}</div>
              </div>
            </div>

            <div className="bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-100/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-700 shadow-xs border border-emerald-100">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-stone-500 font-semibold">Partnership</div>
                <div className="text-xs sm:text-sm font-extrabold text-stone-900">{activeDest.yearsPartnership}</div>
              </div>
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            4. BOTTOM-RIGHT MAP LEGEND BAR
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-4 bg-white/95 border border-emerald-100/90 px-4 py-2 rounded-full shadow-lg text-[11px] font-bold text-stone-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white" />
            <span>Port</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-emerald-600 stroke-dashed" />
            <span>In Transit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white animate-pulse" />
            <span>Delivered</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GlobalMap;
