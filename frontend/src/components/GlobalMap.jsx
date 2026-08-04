/**
 * File: frontend/src/components/GlobalMap.jsx
 * Purpose: Interactive Global Shipping Logistics Experience for Cocoveera Export Web App.
 * Features real-time animated ocean shipping routes from Tuticorin Port (India) to global destinations,
 * animated cargo vessel traversing curved Bezier paths with real-time rotational alignment,
 * arrival ripples, interactive country tooltips, and logistics telemetry.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { geoMercator } from 'd3-geo';
import { Factory, Ship, Anchor, CheckCircle2, Navigation, ArrowRight, Play, RotateCcw, Box, Clock, Globe2 } from 'lucide-react';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Primary Origin Port (Tuticorin Port / Coimbatore HQ, Tamil Nadu, India)
export const ORIGIN = {
  id: 'india_hub',
  name: 'TUTICORIN PORT',
  sub: 'Manufacturing & Export Hub',
  country: 'India',
  city: 'Tuticorin Port (Thoothukudi)',
  coordinates: [78.1348, 8.7642],
};

// Global Export Destinations with Port Details, Coordinates & Shipping Telemetry
export const DESTINATIONS = [
  {
    id: 'usa',
    country: 'USA',
    flag: '🇺🇸',
    city: 'Los Angeles',
    port: 'Port of Los Angeles',
    products: ['Cocopeat 5kg Blocks', 'Grow Bags', 'Coir Discs'],
    containersExported: '850+ FEU',
    yearsPartnership: '6+ Years',
    transitDays: '22 Days',
    coordinates: [-118.2437, 34.0522],
    curveOffset: -45,
  },
  {
    id: 'uk',
    country: 'UK',
    flag: '🇬🇧',
    city: 'London',
    port: 'Port of Tilbury / Felixstowe',
    products: ['Cocopeat Blocks', 'Coco Husk Chips'],
    containersExported: '420+ FEU',
    yearsPartnership: '5+ Years',
    transitDays: '18 Days',
    coordinates: [-0.1276, 51.5072],
    curveOffset: 45,
  },
  {
    id: 'netherlands',
    country: 'Netherlands',
    flag: '🇳🇱',
    city: 'Rotterdam',
    port: 'Port of Rotterdam',
    products: ['Buffered Grow Bags', 'Coir Pith'],
    containersExported: '650+ FEU',
    yearsPartnership: '7+ Years',
    transitDays: '16 Days',
    coordinates: [4.4777, 51.9244],
    curveOffset: 38,
  },
  {
    id: 'germany',
    country: 'Germany',
    flag: '🇩🇪',
    city: 'Hamburg',
    port: 'Port of Hamburg',
    products: ['Grow Bags', 'Coco Chips'],
    containersExported: '380+ FEU',
    yearsPartnership: '4+ Years',
    transitDays: '17 Days',
    coordinates: [9.9937, 53.5511],
    curveOffset: 30,
  },
  {
    id: 'spain',
    country: 'Spain',
    flag: '🇪🇸',
    city: 'Valencia',
    port: 'Port of Valencia',
    products: ['Grow Bags', 'Coir Pith'],
    containersExported: '290+ FEU',
    yearsPartnership: '4+ Years',
    transitDays: '15 Days',
    coordinates: [-0.3763, 39.4699],
    curveOffset: 32,
  },
  {
    id: 'uae',
    country: 'UAE',
    flag: '🇦🇪',
    city: 'Dubai',
    port: 'Jebel Ali Port',
    products: ['Cocopeat Blocks', 'Urban Grow Bags'],
    containersExported: '510+ FEU',
    yearsPartnership: '6+ Years',
    transitDays: '5 Days',
    coordinates: [55.1713, 25.0657],
    curveOffset: 18,
  },
  {
    id: 'saudi',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    city: 'Jeddah',
    port: 'Jeddah Islamic Port',
    products: ['Cocopeat Blocks', 'Coir Pith'],
    containersExported: '340+ FEU',
    yearsPartnership: '4+ Years',
    transitDays: '7 Days',
    coordinates: [39.1925, 21.4858],
    curveOffset: 22,
  },
  {
    id: 'singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    city: 'Singapore',
    port: 'Port of Singapore',
    products: ['Hydroponic Substrates', 'Grow Bags'],
    containersExported: '260+ FEU',
    yearsPartnership: '3+ Years',
    transitDays: '6 Days',
    coordinates: [103.8198, 1.3521],
    curveOffset: -18,
  },
  {
    id: 'vietnam',
    country: 'Vietnam',
    flag: '🇻🇳',
    city: 'Hai Phong',
    port: 'Hai Phong Port',
    products: ['Coir Pith Blocks', 'Grow Bags'],
    containersExported: '430+ FEU',
    yearsPartnership: '4+ Years',
    transitDays: '8 Days',
    coordinates: [106.6881, 20.8651],
    curveOffset: -22,
  },
  {
    id: 'skorea',
    country: 'South Korea',
    flag: '🇰🇷',
    city: 'Busan',
    port: 'Port of Busan',
    products: ['Grow Bags', 'Coco Chips'],
    containersExported: '490+ FEU',
    yearsPartnership: '5+ Years',
    transitDays: '11 Days',
    coordinates: [129.0756, 35.1796],
    curveOffset: -32,
  },
  {
    id: 'japan',
    country: 'Japan',
    flag: '🇯🇵',
    city: 'Tokyo',
    port: 'Port of Tokyo',
    products: ['Cocopeat Blocks', 'Grow Bags'],
    containersExported: '530+ FEU',
    yearsPartnership: '6+ Years',
    transitDays: '12 Days',
    coordinates: [139.6503, 35.6762],
    curveOffset: -38,
  },
  {
    id: 'australia',
    country: 'Australia',
    flag: '🇦🇺',
    city: 'Melbourne',
    port: 'Port of Melbourne',
    products: ['Buffered Grow Bags', 'Coco Chips'],
    containersExported: '610+ FEU',
    yearsPartnership: '5+ Years',
    transitDays: '14 Days',
    coordinates: [144.9631, -37.8136],
    curveOffset: -45,
  },
  {
    id: 'nz',
    country: 'New Zealand',
    flag: '🇳🇿',
    city: 'Auckland',
    port: 'Ports of Auckland',
    products: ['Cocopeat Blocks', 'Husk Chips'],
    containersExported: '210+ FEU',
    yearsPartnership: '3+ Years',
    transitDays: '16 Days',
    coordinates: [174.7633, -36.8485],
    curveOffset: -52,
  },
];

// Helper: Calculate Quadratic Bezier Curve & Controls
const getCurvedPath = (start, end, offset = -30) => {
  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2;
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const ctrlX = midX + nx * offset;
  const ctrlY = midY + ny * offset;

  return {
    d: `M ${start[0]} ${start[1]} Q ${ctrlX} ${ctrlY} ${end[0]} ${end[1]}`,
    ctrl: [ctrlX, ctrlY],
  };
};

// Helper: Calculate Bezier Point & Tangent Angle at progress t [0..1]
const getPointAndAngleOnBezier = (start, ctrl, end, t) => {
  const oneMinusT = 1 - t;
  const x = oneMinusT * oneMinusT * start[0] + 2 * oneMinusT * t * ctrl[0] + t * t * end[0];
  const y = oneMinusT * oneMinusT * start[1] + 2 * oneMinusT * t * ctrl[1] + t * t * end[1];

  // Derivative dx/dt, dy/dt for rotation angle calculation
  const dx = 2 * oneMinusT * (ctrl[0] - start[0]) + 2 * t * (end[0] - ctrl[0]);
  const dy = 2 * oneMinusT * (ctrl[1] - start[1]) + 2 * t * (end[1] - ctrl[1]);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return { x, y, angle };
};

const GlobalMap = ({ onSelectDestination, activeDestId }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDestId, setSelectedDestId] = useState('usa'); // Default active route USA
  const [hoveredDestId, setHoveredDestId] = useState(null);

  // Ship Voyage Telemetry State
  const [voyageProgress, setVoyageProgress] = useState(0); // 0 to 1
  const [isDelivered, setIsDelivered] = useState(false);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeDest = useMemo(() => {
    const id = activeDestId || selectedDestId;
    return DESTINATIONS.find((d) => d.id === id) || DESTINATIONS[0];
  }, [activeDestId, selectedDestId]);

  // Handle voyage animation when active destination changes
  useEffect(() => {
    if (!activeDest) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    setVoyageProgress(0);
    setIsDelivered(false);

    const startTime = performance.now();
    const duration = 2400; // 2.4s voyage animation

    const animateShip = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      setVoyageProgress(progress);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateShip);
      } else {
        setIsDelivered(true);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateShip);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeDest?.id]);

  const handleSelectCountry = (dest) => {
    setSelectedDestId(dest.id);
    if (onSelectDestination) {
      onSelectDestination(dest);
    }
  };

  // Projection configuration matching geographic coordinates
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

  // Compute curved path for active route
  const activeRoutePath = useMemo(() => {
    if (!hqPos || !activeDestPos) return null;
    return getCurvedPath(hqPos, activeDestPos, activeDest.curveOffset || -30);
  }, [hqPos, activeDestPos, activeDest]);

  // Compute live position & angle of cargo ship along curve
  const currentShipState = useMemo(() => {
    if (!hqPos || !activeDestPos || !activeRoutePath) return null;
    return getPointAndAngleOnBezier(hqPos, activeRoutePath.ctrl, activeDestPos, voyageProgress);
  }, [hqPos, activeDestPos, activeRoutePath, voyageProgress]);

  return (
    <div className="w-full bg-stone-900 rounded-[28px] border border-stone-800 p-4 sm:p-8 lg:p-10 shadow-2xl overflow-hidden font-sans text-white">
      
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER & INTERACTIVE COUNTRY SELECTOR
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-widest mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>LIVE GLOBAL LOGISTICS SIMULATOR</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">
            Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Export Network</span>
          </h2>

          <p className="text-stone-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Select an export destination to trace live cargo vessel transit routes departing directly from <strong>Tuticorin Port (India)</strong> to global agricultural hubs.
          </p>
        </div>

        {/* Origin Hub Badge */}
        <div className="flex items-center gap-3 bg-stone-800/80 border border-stone-700/80 px-4 py-2.5 rounded-2xl self-start lg:self-auto shadow-md">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Anchor className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400">Export Dispatch Port</div>
            <div className="text-xs font-extrabold text-white">Tuticorin Port, Tamil Nadu, India 🇮🇳</div>
          </div>
        </div>
      </div>

      {/* QUICK COUNTRY SELECT CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-stone-800">
        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
          <Globe2 className="w-3.5 h-3.5 text-emerald-400" /> Select Country:
        </span>
        {DESTINATIONS.map((dest) => {
          const isSelected = activeDest.id === dest.id;
          return (
            <button
              key={`chip-${dest.id}`}
              onClick={() => handleSelectCountry(dest)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/50 scale-105'
                  : 'bg-stone-800/70 hover:bg-stone-800 text-stone-300 border-stone-700/60 hover:text-white'
              }`}
            >
              <span className="text-sm">{dest.flag}</span>
              <span>{dest.country}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAP CONTAINER
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full bg-[#0F172A] rounded-[24px] border border-stone-800 overflow-hidden shadow-inner h-[340px] xs:h-[400px] sm:h-[500px] lg:h-[600px] select-none flex items-center justify-center">
        
        {/* Subtle Map Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#38BDF8 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale, center }}
          width={width}
          height={height}
          style={{ width: "100%", height: "100%", backgroundColor: "#0F172A" }}
        >
          <ZoomableGroup center={center} zoom={1} minZoom={1} maxZoom={1} disableZoom disablePanning>
            
            {/* World Country Geographies */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth={0.6}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#334155", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* INACTIVE ROUTE LINES (SUBTLE DASHED) */}
            <g className="pointer-events-none">
              {DESTINATIONS.map((dest) => {
                if (dest.id === activeDest.id) return null;
                const pos = projection(dest.coordinates);
                if (!pos || !hqPos) return null;

                const { d } = getCurvedPath(hqPos, pos, dest.curveOffset || -30);
                return (
                  <path
                    key={`inactive-route-${dest.id}`}
                    d={d}
                    fill="none"
                    stroke="#334155"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    opacity={0.4}
                  />
                );
              })}
            </g>

            {/* ACTIVE ROUTE LINE & ANIMATED CARGO VESSEL */}
            {activeRoutePath && (
              <g className="pointer-events-none">
                <defs>
                  <linearGradient id="activeRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0.85" />
                  </linearGradient>
                  
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Base Glow Line */}
                <path
                  d={activeRoutePath.d}
                  fill="none"
                  stroke="#059669"
                  strokeWidth={5}
                  opacity={0.3}
                  filter="url(#glow)"
                />

                {/* Animated Path Line */}
                <motion.path
                  d={activeRoutePath.d}
                  fill="none"
                  stroke="url(#activeRouteGrad)"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />

                {/* ANIMATED CARGO SHIP MOVING ALONG ROUTE */}
                {currentShipState && (
                  <g 
                    transform={`translate(${currentShipState.x}, ${currentShipState.y}) rotate(${currentShipState.angle})`}
                    style={{ transition: 'transform 0.05s linear' }}
                  >
                    {/* Ship Ripple Trail */}
                    <ellipse cx="-12" cy="0" rx="8" ry="3" fill="#34D399" opacity={0.4} className="animate-pulse" />

                    {/* Cargo Ship Vessel Container Shape */}
                    <g transform="translate(-14, -8)">
                      {/* Vessel Hull */}
                      <path 
                        d="M 2 8 L 8 4 L 22 4 L 26 8 L 22 12 L 8 12 Z" 
                        fill="#064E3B" 
                        stroke="#10B981" 
                        strokeWidth="1.5" 
                      />
                      {/* Stacked Containers on Deck */}
                      <rect x="9" y="5.5" width="4" height="5" rx="0.5" fill="#F59E0B" />
                      <rect x="14" y="5.5" width="4" height="5" rx="0.5" fill="#3B82F6" />
                      <rect x="19" y="5.5" width="4" height="5" rx="0.5" fill="#EF4444" />
                      {/* Ship Bridge */}
                      <rect x="5" y="5" width="3" height="6" rx="0.5" fill="#FFFFFF" />
                    </g>
                  </g>
                )}
              </g>
            )}

            {/* MANUFACTURING & DISPATCH ORIGIN HUB (TUTICORIN PORT) */}
            <Marker coordinates={ORIGIN.coordinates}>
              <g className="cursor-pointer group" transform="translate(0, 0)">
                <circle r={isMobile ? 16 : 18} fill="#10B981" opacity={0.2} className="animate-ping" />
                <circle r={isMobile ? 10 : 12} fill="#059669" stroke="#FFFFFF" strokeWidth={2.5} className="shadow-lg" />
                
                <foreignObject x="-14" y="-14" width="28" height="28" className="pointer-events-none">
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Anchor className="w-3.5 h-3.5 text-white" />
                  </div>
                </foreignObject>

                {/* Permanent Origin Badge */}
                <foreignObject x="-70" y="16" width="140" height="45" className="pointer-events-none overflow-visible">
                  <div className="flex flex-col items-center">
                    <div className="bg-emerald-950/90 text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-500/50 shadow-xl text-center whitespace-nowrap backdrop-blur-md">
                      <div className="text-[9px] font-extrabold tracking-wider leading-tight text-white flex items-center justify-center gap-1">
                        <span>🇮🇳</span> {ORIGIN.name}
                      </div>
                      <div className="text-[7.5px] text-emerald-400 font-semibold leading-tight">
                        {ORIGIN.sub}
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </g>
            </Marker>

            {/* DESTINATION MARKERS */}
            {DESTINATIONS.map((dest) => {
              const isSelected = activeDest.id === dest.id;
              const isHovered = hoveredDestId === dest.id;
              const opacity = isSelected ? 1 : 0.45;

              return (
                <Marker key={`dest-marker-${dest.id}`} coordinates={dest.coordinates}>
                  <g
                    className="cursor-pointer group"
                    style={{ opacity }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCountry(dest);
                    }}
                    onMouseEnter={() => setHoveredDestId(dest.id)}
                    onMouseLeave={() => setHoveredDestId(null)}
                  >
                    {/* Destination Arrival Ripple Animation when Delivered */}
                    {isSelected && isDelivered && (
                      <circle
                        r={isMobile ? 22 : 26}
                        fill="#34D399"
                        opacity={0.35}
                        className="animate-ping"
                      />
                    )}

                    {/* Outer Glow Pin */}
                    <circle
                      r={isSelected ? (isMobile ? 12 : 14) : (isMobile ? 7 : 8)}
                      fill={isSelected ? '#10B981' : '#F59E0B'}
                      opacity={isSelected ? 0.9 : 0.8}
                      className={isSelected ? "animate-pulse" : ""}
                    />
                    
                    {/* Inner Core Circle */}
                    <circle
                      r={isSelected ? (isMobile ? 7 : 8) : (isMobile ? 4.5 : 5)}
                      fill={isSelected ? '#FFFFFF' : '#FEF08A'}
                      stroke={isSelected ? '#059669' : '#D97706'}
                      strokeWidth={2}
                      className="transition-transform duration-200 group-hover:scale-125 shadow-md"
                    />

                    {/* TOOLTIP & STATUS CARD OVERLAY */}
                    <AnimatePresence>
                      {(isSelected || isHovered) && (
                        <foreignObject
                          x="-90"
                          y={isMobile ? "-70" : "-80"}
                          width="180"
                          height="75"
                          className="pointer-events-none overflow-visible z-50"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center"
                          >
                            <div className="bg-stone-950/95 text-white px-3 py-2 rounded-2xl shadow-2xl border border-emerald-500/40 text-center whitespace-nowrap min-w-[130px] backdrop-blur-md">
                              <div className="text-[11px] font-extrabold flex items-center justify-center gap-1.5 leading-tight">
                                <span className="text-sm">{dest.flag}</span>
                                <span>{dest.country}</span>
                              </div>
                              <div className="text-[9px] text-emerald-400 font-semibold leading-tight mt-0.5">
                                ⚓ {dest.port}
                              </div>
                              {isSelected && (
                                <div className="mt-1 flex items-center justify-center gap-1 text-[8px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/50 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                                  {isDelivered ? (
                                    <span className="text-emerald-400 flex items-center gap-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5" /> DELIVERED
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-0.5">
                                      <Ship className="w-2.5 h-2.5 animate-bounce" /> IN TRANSIT ({Math.round(voyageProgress * 100)}%)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="w-2.5 h-2.5 bg-stone-950/95 rotate-45 -mt-1 border-r border-b border-emerald-500/40" />
                          </motion.div>
                        </foreignObject>
                      )}
                    </AnimatePresence>
                  </g>
                </Marker>
              );
            })}

          </ZoomableGroup>
        </ComposableMap>

        {/* ═══════════════════════════════════════════════════════════════════
            LIVE VOYAGE TELEMETRY CARD (OVERLAY IN BOTTOM CORNER)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-auto bg-stone-900/90 border border-stone-700/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-2xl max-w-md pointer-events-auto">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{activeDest.flag}</span>
              <div>
                <div className="text-xs font-extrabold text-white leading-tight">
                  Export Route: Tuticorin ➔ {activeDest.country}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  Destination Port: {activeDest.port}
                </div>
              </div>
            </div>

            <div className="text-right">
              {isDelivered ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> ARRIVED AT PORT
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded-full">
                  <Ship className="w-3 h-3 animate-bounce" /> SAILING ({Math.round(voyageProgress * 100)}%)
                </span>
              )}
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-stone-800 rounded-full h-1.5 mb-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-75 rounded-full"
              style={{ width: `${voyageProgress * 100}%` }}
            />
          </div>

          {/* Logistics Telemetry Grid */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-stone-800/80">
            <div className="bg-stone-800/50 p-1.5 rounded-xl">
              <div className="text-[9px] text-stone-400 font-medium flex items-center justify-center gap-0.5">
                <Box className="w-2.5 h-2.5 text-emerald-400" /> Exported
              </div>
              <div className="text-[11px] font-extrabold text-white mt-0.5">
                {activeDest.containersExported}
              </div>
            </div>

            <div className="bg-stone-800/50 p-1.5 rounded-xl">
              <div className="text-[9px] text-stone-400 font-medium flex items-center justify-center gap-0.5">
                <Clock className="w-2.5 h-2.5 text-teal-400" /> Ocean Transit
              </div>
              <div className="text-[11px] font-extrabold text-white mt-0.5">
                {activeDest.transitDays}
              </div>
            </div>

            <div className="bg-stone-800/50 p-1.5 rounded-xl">
              <div className="text-[9px] text-stone-400 font-medium flex items-center justify-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-amber-400" /> Partnership
              </div>
              <div className="text-[11px] font-extrabold text-white mt-0.5">
                {activeDest.yearsPartnership}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GlobalMap;
