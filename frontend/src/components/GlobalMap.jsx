/**
 * File: frontend/src/components/GlobalMap.jsx
 * Purpose: World-Class Light Enterprise Export Logistics Dashboard for Cocoveera B2B Web App.
 * Inspired by Apple + Stripe + Flexport + Maersk design aesthetics.
 * Features clean light map rendering, real-time SVG cargo vessel navigation from Tuticorin Port,
 * Bezier path tracking with rotational alignment, water wakes, arrival confetti ripples,
 * glass telemetry cards, and multi-stage shipment timeline.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { geoMercator } from 'd3-geo';
import { Anchor, Ship, CheckCircle2, Navigation, Box, Clock, Globe2, Sparkles, ShieldCheck, ArrowRight, Award, MapPin } from 'lucide-react';

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

// Global Export Destinations with Full Telemetry & Port Coordinates
export const DESTINATIONS = [
  {
    id: 'usa',
    country: 'USA',
    flag: '🇺🇸',
    city: 'Los Angeles',
    port: 'Port of Los Angeles',
    distance: '8,450 NM',
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
    distance: '6,200 NM',
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
    distance: '6,450 NM',
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
    distance: '6,600 NM',
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
    distance: '5,300 NM',
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
    distance: '1,850 NM',
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
    distance: '2,200 NM',
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
    distance: '1,650 NM',
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
    distance: '2,800 NM',
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
    distance: '3,900 NM',
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
    distance: '4,300 NM',
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
    distance: '5,100 NM',
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
    distance: '6,150 NM',
    products: ['Cocopeat Blocks', 'Husk Chips'],
    containersExported: '210+ FEU',
    yearsPartnership: '3+ Years',
    transitDays: '16 Days',
    coordinates: [174.7633, -36.8485],
    curveOffset: -52,
  },
];

// Quadratic Bezier Curve Helper
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

// Compute point and angle along quadratic Bezier curve at progress t [0..1]
const getPointAndAngleOnBezier = (start, ctrl, end, t) => {
  const oneMinusT = 1 - t;
  const x = oneMinusT * oneMinusT * start[0] + 2 * oneMinusT * t * ctrl[0] + t * t * end[0];
  const y = oneMinusT * oneMinusT * start[1] + 2 * oneMinusT * t * ctrl[1] + t * t * end[1];

  const dx = 2 * oneMinusT * (ctrl[0] - start[0]) + 2 * t * (end[0] - ctrl[0]);
  const dy = 2 * oneMinusT * (ctrl[1] - start[1]) + 2 * t * (end[1] - ctrl[1]);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return { x, y, angle };
};

const GlobalMap = ({ onSelectDestination, activeDestId }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDestId, setSelectedDestId] = useState('usa');
  const [hoveredDestId, setHoveredDestId] = useState(null);

  // Live Voyage Telemetry Progress State
  const [voyageProgress, setVoyageProgress] = useState(0); // 0 -> 1
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

  // Smooth Voyage Animation Controller (2.5s journey)
  useEffect(() => {
    if (!activeDest) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    setVoyageProgress(0);
    setIsDelivered(false);

    const startTime = performance.now();
    const duration = 2500; // 2.5s duration as requested

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

  // Curved Route Path calculation
  const activeRoutePath = useMemo(() => {
    if (!hqPos || !activeDestPos) return null;
    return getCurvedPath(hqPos, activeDestPos, activeDest.curveOffset || -30);
  }, [hqPos, activeDestPos, activeDest]);

  // Real-time vessel coordinates & rotation calculation
  const currentShipState = useMemo(() => {
    if (!hqPos || !activeDestPos || !activeRoutePath) return null;
    return getPointAndAngleOnBezier(hqPos, activeRoutePath.ctrl, activeDestPos, voyageProgress);
  }, [hqPos, activeDestPos, activeRoutePath, voyageProgress]);

  return (
    <div className="w-full bg-gradient-to-br from-[#F8FFF8] via-[#F6FFF9] to-[#EEFDF3] rounded-[32px] border border-emerald-100/90 p-4 sm:p-8 lg:p-10 shadow-2xl shadow-emerald-950/5 overflow-hidden font-sans text-stone-800 relative">
      
      {/* ═══════════════════════════════════════════════════════════════════
          1. HEADER & TOP LIVE METRIC STATISTICS
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-200 px-3.5 py-1 rounded-full text-emerald-800 text-xs font-extrabold uppercase tracking-widest mb-3 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span>GLOBAL EXPORT LOGISTICS DASHBOARD</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900 mb-2">
            Live Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600">Supply Network</span>
          </h2>

          <p className="text-stone-600 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
            Trace real-time container cargo shipments departing directly from <strong>Tuticorin Port (India)</strong> to our international distributor network.
          </p>
        </div>

        {/* TOP STATISTICS GLASS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 self-start lg:self-auto">
          {[
            { label: 'Destinations', val: '18+', icon: Globe2, color: 'text-emerald-700' },
            { label: 'Substrates', val: '142+', icon: Box, color: 'text-teal-700' },
            { label: 'Containers', val: '2,500+', icon: Ship, color: 'text-emerald-800' },
            { label: 'On-Time', val: '100%', icon: ShieldCheck, color: 'text-green-700' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-md border border-emerald-100/80 p-3 rounded-2xl shadow-sm text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <div className="text-base sm:text-lg font-extrabold text-stone-900 leading-tight">{stat.val}</div>
              <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK COUNTRY SELECTOR CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-emerald-100/80 relative z-10">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-emerald-600" /> Select Country:
        </span>
        {DESTINATIONS.map((dest) => {
          const isSelected = activeDest.id === dest.id;
          return (
            <button
              key={`chip-${dest.id}`}
              onClick={() => handleSelectCountry(dest)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-700/20 scale-105'
                  : 'bg-white hover:bg-emerald-50/80 text-stone-700 border-emerald-200/70 hover:border-emerald-300'
              }`}
            >
              <span className="text-sm">{dest.flag}</span>
              <span>{dest.country}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          2. LIGHT THEME MAP CONTAINER (APPLE / FLEXPORT / STRIPE STYLE)
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full bg-[#F8FBF9] rounded-[28px] border border-emerald-100 overflow-hidden shadow-inner h-[340px] xs:h-[400px] sm:h-[500px] lg:h-[600px] select-none flex items-center justify-center">
        
        {/* Subtle Light Grid Pattern (5% Opacity) */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale, center }}
          width={width}
          height={height}
          style={{ width: "100%", height: "100%", backgroundColor: "#F8FBF9" }}
        >
          <ZoomableGroup center={center} zoom={1} minZoom={1} maxZoom={1} disableZoom disablePanning>
            
            {/* World Country Geographies (Light Theme: #DDE8E1 land, #C8D6CF borders) */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#DDE8E1"
                    stroke="#C8D6CF"
                    strokeWidth={0.65}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#CDE3D5", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* INACTIVE SUBTLE DASHED ROUTES */}
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
                    stroke="#A3B8AC"
                    strokeWidth={1.2}
                    strokeDasharray="4 4"
                    opacity={0.4}
                  />
                );
              })}
            </g>

            {/* ACTIVE ANIMATED ROUTE & REALISTIC 3D SVG CARGO VESSEL */}
            {activeRoutePath && (
              <g className="pointer-events-none">
                <defs>
                  <linearGradient id="lightRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#10B981" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0.85" />
                  </linearGradient>

                  <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Soft Green Glow Aura around path */}
                <path
                  d={activeRoutePath.d}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={6}
                  opacity={0.35}
                  filter="url(#softGlow)"
                />

                {/* Animated Bezier Path Line (Stroke Dash Draw) */}
                <motion.path
                  d={activeRoutePath.d}
                  fill="none"
                  stroke="url(#lightRouteGrad)"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeDasharray="9 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                />

                {/* REALISTIC SVG CARGO SHIP MOVING ALONG PATH WITH ROTATION & WATER WAKE */}
                {currentShipState && (
                  <g 
                    transform={`translate(${currentShipState.x}, ${currentShipState.y}) rotate(${currentShipState.angle})`}
                    style={{ transition: 'transform 0.04s linear' }}
                  >
                    {/* Stern Water Wake & Particles */}
                    <g transform="translate(-20, 0)">
                      <ellipse cx="0" cy="0" rx="14" ry="4" fill="#6EE7B7" opacity={0.5} className="animate-ping" />
                      <circle cx="-6" cy="-2" r="1.5" fill="#A7F3D0" opacity={0.8} />
                      <circle cx="-10" cy="2" r="1" fill="#A7F3D0" opacity={0.6} />
                    </g>

                    {/* Realistic Detailed Container Ship SVG */}
                    <g transform="translate(-18, -10)">
                      {/* Vessel Soft Shadow */}
                      <path 
                        d="M 2 12 L 8 16 L 28 16 L 34 12 L 28 8 L 8 8 Z" 
                        fill="#000000" 
                        opacity={0.15} 
                        transform="translate(0, 3)" 
                      />

                      {/* Steel Hull Base */}
                      <path 
                        d="M 2 10 L 8 4 L 28 4 L 34 10 L 28 16 L 8 16 Z" 
                        fill="#065F46" 
                        stroke="#047857" 
                        strokeWidth="1.5" 
                      />

                      {/* Stacked Containers on Deck */}
                      <rect x="9" y="5.5" width="4.5" height="9" rx="0.5" fill="#10B981" />
                      <rect x="14.5" y="5.5" width="4.5" height="9" rx="0.5" fill="#F59E0B" />
                      <rect x="20" y="5.5" width="4.5" height="9" rx="0.5" fill="#3B82F6" />
                      <rect x="25.5" y="5.5" width="4" height="9" rx="0.5" fill="#EF4444" />

                      {/* Navigation Bridge Castle */}
                      <rect x="4.5" y="5" width="3.5" height="10" rx="0.8" fill="#FFFFFF" stroke="#047857" strokeWidth="0.8" />
                      <rect x="5.5" y="6.5" width="1.5" height="2" fill="#0284C7" />
                    </g>
                  </g>
                )}
              </g>
            )}

            {/* TUTICORIN PORT (HERO DISPATCH ORIGIN HUB) */}
            <Marker coordinates={ORIGIN.coordinates}>
              <g className="cursor-pointer group" transform="translate(0, 0)">
                <circle r={isMobile ? 18 : 22} fill="#10B981" opacity={0.25} className="animate-ping" />
                <circle r={isMobile ? 12 : 14} fill="#059669" stroke="#FFFFFF" strokeWidth={3} className="shadow-lg" />
                
                <foreignObject x="-14" y="-14" width="28" height="28" className="pointer-events-none">
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Anchor className="w-4 h-4 text-white" />
                  </div>
                </foreignObject>

                {/* Permanent Hero Port Badge */}
                <foreignObject x="-80" y="18" width="160" height="48" className="pointer-events-none overflow-visible">
                  <div className="flex flex-col items-center">
                    <div className="bg-white/95 text-stone-900 px-3 py-1 rounded-xl border border-emerald-300 shadow-xl text-center whitespace-nowrap backdrop-blur-md">
                      <div className="text-[10px] font-extrabold tracking-wider leading-tight text-emerald-800 flex items-center justify-center gap-1">
                        <span>🇮🇳</span> {ORIGIN.name}
                      </div>
                      <div className="text-[8px] text-stone-500 font-semibold leading-tight">
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
              const opacity = isSelected ? 1 : 0.6;

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
                    {/* Destination Arrival Multi-Ring Ripple Animation */}
                    {isSelected && isDelivered && (
                      <>
                        <circle r={isMobile ? 26 : 32} fill="#34D399" opacity={0.3} className="animate-ping" />
                        <circle r={isMobile ? 18 : 22} fill="#059669" opacity={0.2} className="animate-pulse" />
                      </>
                    )}

                    {/* Outer Glow Pin */}
                    <circle
                      r={isSelected ? (isMobile ? 13 : 15) : (isMobile ? 7.5 : 9)}
                      fill={isSelected ? '#059669' : '#10B981'}
                      opacity={isSelected ? 0.95 : 0.85}
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

                    {/* Confetti Sparkles when Delivered */}
                    {isSelected && isDelivered && (
                      <foreignObject x="-15" y="-35" width="30" height="30" className="pointer-events-none">
                        <div className="flex items-center justify-center text-amber-500 animate-bounce">
                          <Sparkles className="w-5 h-5" />
                        </div>
                      </foreignObject>
                    )}

                    {/* TOOLTIP ON HOVER/ACTIVE */}
                    <AnimatePresence>
                      {(isSelected || isHovered) && (
                        <foreignObject
                          x="-95"
                          y={isMobile ? "-72" : "-82"}
                          width="190"
                          height="78"
                          className="pointer-events-none overflow-visible z-50"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center"
                          >
                            <div className="bg-white/95 text-stone-900 px-3 py-2 rounded-2xl shadow-xl border border-emerald-200 text-center whitespace-nowrap min-w-[135px] backdrop-blur-md">
                              <div className="text-[11px] font-extrabold flex items-center justify-center gap-1.5 leading-tight text-stone-900">
                                <span className="text-sm">{dest.flag}</span>
                                <span>{dest.country}</span>
                              </div>
                              <div className="text-[9px] text-emerald-700 font-semibold leading-tight mt-0.5">
                                ⚓ {dest.port}
                              </div>
                              {isSelected && (
                                <div className="mt-1 flex items-center justify-center gap-1 text-[8px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  {isDelivered ? (
                                    <span className="text-emerald-700 flex items-center gap-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> DELIVERED
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-0.5 text-teal-700">
                                      <Ship className="w-2.5 h-2.5 animate-bounce" /> IN TRANSIT ({Math.round(voyageProgress * 100)}%)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="w-2.5 h-2.5 bg-white/95 rotate-45 -mt-1 border-r border-b border-emerald-200" />
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
            3. FLOATING WHITE GLASS INFORMATION CARD
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-auto bg-white/95 border border-emerald-100/90 backdrop-blur-xl p-4 sm:p-5 rounded-[24px] shadow-2xl shadow-emerald-950/10 max-w-md pointer-events-auto">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{activeDest.flag}</span>
              <div>
                <div className="text-sm font-extrabold text-stone-900 leading-tight">
                  Tuticorin ➔ {activeDest.country}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <Anchor className="w-3 h-3" /> {activeDest.port}
                </div>
              </div>
            </div>

            <div className="text-right">
              {isDelivered ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-1 rounded-full shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> DELIVERED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-800 bg-teal-100/80 border border-teal-300 px-2.5 py-1 rounded-full shadow-xs">
                  <Ship className="w-3 h-3 text-teal-600 animate-bounce" /> SAILING ({Math.round(voyageProgress * 100)}%)
                </span>
              )}
            </div>
          </div>

          {/* ANIMATED PROGRESS BAR */}
          <div className="w-full bg-stone-100 rounded-full h-2 mb-3 overflow-hidden border border-stone-200/60">
            <div 
              className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 h-full transition-all duration-75 rounded-full"
              style={{ width: `${voyageProgress * 100}%` }}
            />
          </div>

          {/* TELEMETRY METRICS GRID */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-stone-100">
            <div className="bg-emerald-50/60 p-2 rounded-2xl border border-emerald-100/60">
              <div className="text-[9.5px] text-stone-500 font-semibold flex items-center justify-center gap-1">
                <Box className="w-3 h-3 text-emerald-600" /> Exported
              </div>
              <div className="text-xs font-extrabold text-stone-900 mt-0.5">
                {activeDest.containersExported}
              </div>
            </div>

            <div className="bg-emerald-50/60 p-2 rounded-2xl border border-emerald-100/60">
              <div className="text-[9.5px] text-stone-500 font-semibold flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-teal-600" /> Transit Time
              </div>
              <div className="text-xs font-extrabold text-stone-900 mt-0.5">
                {activeDest.transitDays} ({activeDest.distance})
              </div>
            </div>

            <div className="bg-emerald-50/60 p-2 rounded-2xl border border-emerald-100/60">
              <div className="text-[9.5px] text-stone-500 font-semibold flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-emerald-600" /> Partnership
              </div>
              <div className="text-xs font-extrabold text-stone-900 mt-0.5">
                {activeDest.yearsPartnership}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          4. BOTTOM TIMELINE MILESTONE TRACKER
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="mt-6 bg-white/80 border border-emerald-100/80 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Ocean Logistics Shipment Stage</span>
          <span className="text-emerald-700 font-extrabold">Route: Tuticorin Port ➔ {activeDest.port}</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
          {/* Stage 1 */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md mb-1 text-xs">
              1
            </div>
            <span className="text-stone-900 font-extrabold text-[11px]">Tuticorin Port</span>
            <span className="text-[9.5px] text-stone-400 font-medium">Dispatched</span>
          </div>

          {/* Stage 2 */}
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md mb-1 text-xs transition-colors ${
              voyageProgress > 0.15 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
            }`}>
              2
            </div>
            <span className="text-stone-900 font-extrabold text-[11px]">In Transit</span>
            <span className="text-[9.5px] text-stone-400 font-medium">{Math.round(voyageProgress * 100)}% Complete</span>
          </div>

          {/* Stage 3 */}
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md mb-1 text-xs transition-colors ${
              voyageProgress > 0.85 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
            }`}>
              3
            </div>
            <span className="text-stone-900 font-extrabold text-[11px]">{activeDest.country} Port</span>
            <span className="text-[9.5px] text-stone-400 font-medium">Approaching</span>
          </div>

          {/* Stage 4 */}
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md mb-1 text-xs transition-colors ${
              isDelivered ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
            }`}>
              4
            </div>
            <span className="text-stone-900 font-extrabold text-[11px]">Delivered</span>
            <span className="text-[9.5px] text-stone-400 font-medium">Unloaded</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GlobalMap;
