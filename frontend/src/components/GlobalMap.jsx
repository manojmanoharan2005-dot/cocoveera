/**
 * File: frontend/src/components/GlobalMap.jsx
 * Purpose: Enterprise "Global Supply Chain Network" component for Cocoveera B2B Export Website.
 * Strictly adheres to design specifications for Desktop, Tablet, and Mobile views.
 */

import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Anchor,
  Users,
  Compass,
  Package,
  Ship,
  MapPin,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

// Origin Coordinates (Coimbatore, Tamil Nadu, India)
// Converted to equirectangular map projection % (0-100% X and Y)
const ORIGIN = {
  id: 'coimbatore',
  name: 'Coimbatore',
  sub: 'Tamil Nadu, India',
  role: 'Manufacturing HQ & Global Export Hub',
  x: 70.8, // X % position on 1000x500 map canvas
  y: 53.0, // Y % position
};

// Destination Data
const DESTINATIONS = [
  {
    id: 'usa',
    country: 'USA',
    flag: '🇺🇸',
    port: 'Los Angeles Port',
    secondaryPorts: ['Los Angeles Port', 'Houston Port'],
    region: 'North America',
    majorOnMobile: true,
    x: 21.0,
    y: 35.0,
    products: ['Cocopeat Blocks', 'Grow Bags'],
  },
  {
    id: 'canada',
    country: 'Canada',
    flag: '🇨🇦',
    port: 'Toronto Port',
    secondaryPorts: ['Toronto Port'],
    region: 'North America',
    majorOnMobile: false,
    x: 26.0,
    y: 26.0,
    products: ['Cocopeat Blocks', 'Coir Pith'],
  },
  {
    id: 'germany',
    country: 'Germany',
    flag: '🇩🇪',
    port: 'Hamburg Port',
    secondaryPorts: ['Hamburg Port'],
    region: 'Europe',
    majorOnMobile: true,
    x: 51.5,
    y: 27.0,
    products: ['Grow Bags', 'Coco Chips'],
  },
  {
    id: 'netherlands',
    country: 'Netherlands',
    flag: '🇳🇱',
    port: 'Rotterdam Port',
    secondaryPorts: ['Rotterdam Port'],
    region: 'Europe',
    majorOnMobile: false,
    x: 49.5,
    y: 28.5,
    products: ['Cocopeat Blocks', 'Grow Bags'],
  },
  {
    id: 'spain',
    country: 'Spain',
    flag: '🇪🇸',
    port: 'Valencia Port',
    secondaryPorts: ['Valencia Port'],
    region: 'Europe',
    majorOnMobile: false,
    x: 47.0,
    y: 36.0,
    products: ['Grow Bags', 'Coir Pith'],
  },
  {
    id: 'uk',
    country: 'UK',
    flag: '🇬🇧',
    port: 'Felixstowe Port',
    secondaryPorts: ['London Port'],
    region: 'Europe',
    majorOnMobile: false,
    x: 47.5,
    y: 26.0,
    products: ['Cocopeat Blocks', 'Coco Chips'],
  },
  {
    id: 'uae',
    country: 'UAE',
    flag: '🇦🇪',
    port: 'Jebel Ali Port',
    secondaryPorts: ['Jebel Ali Port'],
    region: 'Middle East',
    majorOnMobile: true,
    x: 63.5,
    y: 43.0,
    products: ['Cocopeat Blocks', 'Grow Bags'],
  },
  {
    id: 'saudi',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    port: 'Jeddah Port',
    secondaryPorts: ['Jeddah Port'],
    region: 'Middle East',
    majorOnMobile: false,
    x: 60.5,
    y: 45.0,
    products: ['Cocopeat Blocks', 'Coir Pith'],
  },
  {
    id: 'japan',
    country: 'Japan',
    flag: '🇯🇵',
    port: 'Tokyo Port',
    secondaryPorts: ['Tokyo Port'],
    region: 'Asia Pacific',
    majorOnMobile: true,
    x: 87.5,
    y: 36.0,
    products: ['Cocopeat Blocks', 'Grow Bags'],
  },
  {
    id: 'skorea',
    country: 'South Korea',
    flag: '🇰🇷',
    port: 'Busan Port',
    secondaryPorts: ['Busan Port'],
    region: 'Asia Pacific',
    majorOnMobile: false,
    x: 83.5,
    y: 35.5,
    products: ['Grow Bags', 'Coco Chips'],
  },
  {
    id: 'singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    port: 'Singapore Port',
    secondaryPorts: ['Singapore Port'],
    region: 'Asia Pacific',
    majorOnMobile: false,
    x: 77.0,
    y: 57.0,
    products: ['Cocopeat Blocks', 'Grow Bags'],
  },
  {
    id: 'australia',
    country: 'Australia',
    flag: '🇦🇺',
    port: 'Melbourne Port',
    secondaryPorts: ['Melbourne Port'],
    region: 'Asia Pacific',
    majorOnMobile: true,
    x: 88.0,
    y: 78.0,
    products: ['Cocopeat Blocks', 'Grow Bags'],
  },
  {
    id: 'nz',
    country: 'New Zealand',
    flag: '🇳🇿',
    port: 'Auckland Port',
    secondaryPorts: ['Auckland Port'],
    region: 'Oceania',
    majorOnMobile: false,
    x: 95.0,
    y: 84.0,
    products: ['Cocopeat Blocks', 'Coco Husk Chips'],
  },
];

// 5 Region Cards Config
const REGION_CARDS = [
  {
    title: 'North America',
    ports: ['Los Angeles Port', 'Houston Port', 'Toronto Port'],
  },
  {
    title: 'Europe',
    ports: ['Rotterdam Port', 'Hamburg Port', 'Valencia Port'],
  },
  {
    title: 'Middle East',
    ports: ['Jebel Ali Port', 'Jeddah Port'],
  },
  {
    title: 'Asia Pacific',
    ports: ['Singapore Port', 'Tokyo Port', 'Melbourne Port'],
  },
  {
    title: 'Oceania',
    ports: ['Melbourne Port', 'Auckland Port'],
  },
];

// Bottom Statistics Config
const STATS = [
  { icon: Globe, val: '28+', label: 'Countries Served' },
  { icon: Anchor, val: '20+', label: 'Major Ports' },
  { icon: Users, val: '85+', label: 'Distribution Partners' },
  { icon: Compass, val: '5', label: 'Continents' },
  { icon: Package, val: '250K+', label: 'Containers Exported' },
];

const GlobalMap = () => {
  const [hoveredDest, setHoveredDest] = useState(null);
  const [selectedDestMobile, setSelectedDestMobile] = useState(null);
  const filterId = useId();

  // Helper to generate smooth SVG curved path between 2 percentage coords on 1000x500 grid
  const getCurvePath = (x1Pct, y1Pct, x2Pct, y2Pct) => {
    const x1 = (x1Pct / 100) * 1000;
    const y1 = (y1Pct / 100) * 500;
    const x2 = (x2Pct / 100) * 1000;
    const y2 = (y2Pct / 100) * 500;

    // Control point calculation for aesthetic arch
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Arch elevation proportional to distance
    const arch = Math.min(distance * 0.25, 80);
    const cx = midX;
    const cy = midY - arch;

    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  };

  return (
    <section className="w-full font-inter bg-[#FAF9F6] text-stone-800 antialiased selection:bg-[#2E7D32]/20">
      {/* Outer Card Container */}
      <div className="w-full bg-white rounded-[20px] p-4 sm:p-6 lg:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-stone-200/80 overflow-hidden">
        
        {/* =========================================================================
            1. TOP HEADER & LEGEND
        ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div className="max-w-2xl space-y-2">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-[11px] font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse"></span>
              LOGISTICS & DISTRIBUTION
            </div>

            {/* Large Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
              Global Supply Chain Network
            </h2>

            {/* Description */}
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Cocoveera exports premium coco peat and coir substrates to growers and distribution partners across five continents.
            </p>
          </div>

          {/* Top Right Legend */}
          <div className="flex flex-wrap items-center gap-4 bg-[#FAF9F6] border border-stone-200/80 px-4 py-2.5 rounded-xl self-start">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <span className="w-3 h-3 rounded-full bg-[#2E7D32] shadow-[0_0_8px_rgba(46,125,50,0.6)] animate-pulse"></span>
              <span>Manufacturing HQ</span>
            </div>
            <div className="w-px h-4 bg-stone-300"></div>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
              <span>Export Destinations</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. MAIN INTERACTIVE MAP SECTION
        ========================================================================= */}
        <div className="relative w-full bg-[#F5F7F4] rounded-[16px] border border-stone-200/70 overflow-hidden shadow-inner mb-8">
          {/* Subtle Grid / Pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#2E7D32_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

          {/* MAP CANVAS CONTAINER */}
          <div className="relative w-full h-[280px] sm:h-[420px] lg:h-[540px]">
            <svg
              viewBox="0 0 1000 500"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full select-none"
            >
              <defs>
                {/* Glow Filter for HQ Origin */}
                <filter id={`glow-${filterId}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Linear gradient for shipping routes */}
                <linearGradient id={`routeGrad-${filterId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#4CAF50" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* World Map Background (Clean Modern Dotted / Stylized Landmasses) */}
              <g className="fill-stone-300/60 opacity-60">
                {/* North America */}
                <path d="M 120 100 Q 180 80 280 110 T 320 180 Q 280 240 220 250 T 150 200 Z" />
                <path d="M 170 120 Q 230 110 290 140 T 250 220 Z" className="fill-stone-300/80" />
                {/* South America */}
                <path d="M 270 270 Q 330 280 340 350 T 300 450 Q 250 430 260 340 Z" />
                {/* Europe */}
                <path d="M 460 110 Q 530 100 560 150 T 480 200 Q 450 160 460 110 Z" />
                {/* Africa */}
                <path d="M 460 210 Q 550 200 580 280 T 520 420 Q 450 380 460 250 Z" />
                {/* Asia */}
                <path d="M 570 100 Q 750 80 880 140 T 820 280 Q 700 290 600 230 Z" />
                {/* India */}
                <path d="M 670 210 Q 720 220 730 280 L 680 300 Z" className="fill-[#2E7D32]/20" />
                {/* Australia & Oceania */}
                <path d="M 800 350 Q 900 340 920 400 T 830 440 Z" />
              </g>

              {/* Dotted World Grid Lines for high-tech export look */}
              <g stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.6">
                <line x1="0" y1="125" x2="1000" y2="125" />
                <line x1="0" y1="250" x2="1000" y2="250" />
                <line x1="0" y1="375" x2="1000" y2="375" />
                <line x1="250" y1="0" x2="250" y2="500" />
                <line x1="500" y1="0" x2="500" y2="500" />
                <line x1="750" y1="0" x2="750" y2="500" />
              </g>

              {/* ANIMATED SHIPPING ROUTES (Curved dashed lines with smooth moving boat markers) */}
              {DESTINATIONS.map((dest, idx) => {
                const pathD = getCurvePath(ORIGIN.x, ORIGIN.y, dest.x, dest.y);
                const isHovered = hoveredDest?.id === dest.id;

                return (
                  <g key={`route-${dest.id}`}>
                    {/* Base Subtle Curved Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isHovered ? '#2E7D32' : 'url(#routeGrad-' + filterId + ')'}
                      strokeWidth={isHovered ? '2.5' : '1.5'}
                      strokeOpacity={isHovered ? '1' : '0.45'}
                      strokeDasharray="5 5"
                      className="transition-all duration-300"
                    />

                    {/* Animated Dashed Flow overlay */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#4CAF50"
                      strokeWidth={isHovered ? '3' : '2'}
                      strokeDasharray="6 12"
                      strokeLinecap="round"
                      opacity={isHovered ? '0.9' : '0.6'}
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="100"
                        to="0"
                        dur={`${6 + (idx % 4) * 2}s`}
                        repeatCount="indefinite"
                      />
                    </path>

                    {/* Moving Ship Icon along route */}
                    <g>
                      <circle r="4" fill="#2E7D32">
                        <animateMotion
                          path={pathD}
                          dur={`${12 + (idx % 3) * 4}s`}
                          repeatCount="indefinite"
                          rotate="auto"
                        />
                      </circle>
                    </g>
                  </g>
                );
              })}

              {/* DESTINATION MARKERS (Desktop & Tablet: All 13, Mobile: Major 5) */}
              {DESTINATIONS.map((dest) => {
                const isHovered = hoveredDest?.id === dest.id;
                const isMajor = dest.majorOnMobile;

                return (
                  <g
                    key={`marker-${dest.id}`}
                    transform={`translate(${(dest.x / 100) * 1000}, ${(dest.y / 100) * 500})`}
                    className={`cursor-pointer transition-transform duration-300 ${
                      !isMajor ? 'hidden sm:block' : 'block'
                    }`}
                    onMouseEnter={() => setHoveredDest(dest)}
                    onMouseLeave={() => setHoveredDest(null)}
                    onClick={() => {
                      setHoveredDest(dest);
                      setSelectedDestMobile(dest);
                    }}
                  >
                    {/* Touch Ripple / Pulse on Hover */}
                    {isHovered && (
                      <circle r="16" fill="#F59E0B" opacity="0.25">
                        <animate attributeName="r" values="10;22;10" dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Outer Pin Halo */}
                    <circle r="7" fill="#F59E0B" opacity="0.3" />
                    {/* Pin Center */}
                    <circle
                      r="4.5"
                      fill="#F59E0B"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="transition-all duration-300 transform hover:scale-125"
                    />

                    {/* Desktop Country Label (Repositioned automatically) */}
                    <text
                      x="8"
                      y="3"
                      className="hidden lg:block fill-stone-700 text-[10px] font-bold tracking-tight pointer-events-none drop-shadow-sm"
                    >
                      {dest.country}
                    </text>
                  </g>
                );
              })}

              {/* MANUFACTURING HQ MARKER (COIMBATORE) */}
              <g
                transform={`translate(${(ORIGIN.x / 100) * 1000}, ${(ORIGIN.y / 100) * 500})`}
                className="cursor-pointer z-30"
              >
                {/* Large animated pulsing aura */}
                <circle r="28" fill="#2E7D32" opacity="0.2" filter={`url(#glow-${filterId})`}>
                  <animate attributeName="r" values="18;32;18" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2.5s" repeatCount="indefinite" />
                </circle>

                <circle r="14" fill="#2E7D32" opacity="0.4" />
                {/* Core Marker */}
                <circle r="8" fill="#2E7D32" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle r="3" fill="#FFFFFF" />

                {/* HQ Label Pin */}
                <foreignObject x="-70" y="-55" width="140" height="48" className="overflow-visible pointer-events-none">
                  <div className="flex flex-col items-center">
                    <div className="bg-[#2E7D32] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-lg border border-white/30 tracking-tight flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      Manufacturing HQ
                    </div>
                    <div className="text-[10px] font-bold text-stone-900 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded shadow-xs mt-0.5 border border-stone-200">
                      Coimbatore
                    </div>
                  </div>
                </foreignObject>
              </g>
            </svg>

            {/* DESKTOP HOVER TOOLTIP */}
            <AnimatePresence>
              {hoveredDest && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    left: `${Math.min(Math.max(hoveredDest.x, 15), 80)}%`,
                    top: `${Math.min(Math.max(hoveredDest.y - 5, 10), 65)}%`,
                  }}
                  className="absolute pointer-events-none z-40 hidden sm:block transform -translate-x-1/2 -translate-y-full mb-3"
                >
                  <div className="bg-white/95 backdrop-blur-md text-stone-900 rounded-xl p-4 shadow-xl border border-stone-200/90 w-52">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-stone-900">
                        <span className="text-base">{hoveredDest.flag}</span>
                        <span>{hoveredDest.country}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-0.5 rounded-full border border-[#F59E0B]/20">
                        Export Destination
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-600">
                      <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                        <Anchor className="w-3.5 h-3.5 text-[#2E7D32]" />
                        <span>{hoveredDest.port}</span>
                      </div>

                      <div className="pt-2 border-t border-stone-100">
                        <div className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1">
                          Products Supplied:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {hoveredDest.products.map((prod, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded"
                            >
                              • {prod}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* =========================================================================
            3. MOBILE HORIZONTAL SWIPE CARDS (VISIBLE ONLY ON MOBILE 320px–767px)
        ========================================================================= */}
        <div className="block sm:hidden mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" /> Major Global Hubs
            </span>
            <span className="text-[11px] text-stone-400 font-medium">Swipe cards →</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-4 px-4">
            {DESTINATIONS.filter((d) => d.majorOnMobile).map((dest) => (
              <div
                key={`mob-card-${dest.id}`}
                onClick={() => setSelectedDestMobile(dest)}
                className="min-w-[82vw] snap-center bg-[#FAF9F6] border border-stone-200/90 rounded-2xl p-4 shadow-sm active:scale-98 transition-transform"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{dest.flag}</span>
                    <span className="font-extrabold text-stone-900 text-base">{dest.country}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full border border-[#F59E0B]/20">
                    Export Destination
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#2E7D32] bg-white border border-stone-200/60 p-2.5 rounded-xl mb-3">
                  <Anchor className="w-4 h-4 flex-shrink-0" />
                  <span>{dest.port}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <span>Products: {dest.products.join(', ')}</span>
                  <span className="text-[#2E7D32] font-bold flex items-center">
                    Tap details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE BOTTOM SHEET MODAL */}
        <AnimatePresence>
          {selectedDestMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:hidden"
              onClick={() => setSelectedDestMobile(null)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full bg-white rounded-t-3xl p-6 border-t border-stone-200 shadow-2xl space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedDestMobile.flag}</span>
                    <div>
                      <h3 className="font-extrabold text-stone-900 text-lg">{selectedDestMobile.country}</h3>
                      <span className="text-xs text-[#F59E0B] font-semibold">Export Destination</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDestMobile(null)}
                    className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Primary Seaport
                    </label>
                    <div className="flex items-center gap-2 bg-[#FAF9F6] border border-stone-200 p-3 rounded-xl font-bold text-stone-800 text-sm">
                      <Anchor className="w-4 h-4 text-[#2E7D32]" />
                      {selectedDestMobile.port}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Supplied Products
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDestMobile.products.map((prod, idx) => (
                        <span
                          key={idx}
                          className="bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 font-semibold text-xs px-3 py-1.5 rounded-lg"
                        >
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDestMobile(null)}
                  className="w-full bg-[#2E7D32] text-white font-bold text-sm py-3 rounded-xl shadow-md mt-2"
                >
                  Close Network Details
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================================
            4. BOTTOM REGION CARDS (5 CLEAN CARDS)
            Desktop: 5 columns (or flexible row) | Tablet: 2 columns | Mobile: 1 column
        ========================================================================= */}
        <div className="mb-10">
          <h3 className="text-xs font-extrabold uppercase text-stone-400 tracking-widest mb-4">
            Key Seaport Trade Hubs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {REGION_CARDS.map((region, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-[#2E7D32]/40 transition-all"
              >
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
                  <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
                  <h4 className="font-extrabold text-stone-900 text-sm tracking-tight">{region.title}</h4>
                </div>

                <ul className="space-y-2">
                  {region.ports.map((port, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                      <span>{port}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default GlobalMap;
