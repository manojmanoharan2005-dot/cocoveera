/**
 * File: frontend/src/components/GlobalMap.jsx
 * Purpose: Enterprise "Global Supply Chain Network" component for Cocoveera B2B Export Website.
 * Uses real latitude and longitude geographic projection (geoMercator) via react-simple-maps.
 */

import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import {
  Globe,
  Anchor,
  Users,
  Compass,
  Package,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Manufacturing HQ (Coimbatore, Tamil Nadu, India)
// Real Geographic Coordinates: [longitude, latitude]
const ORIGIN = {
  id: 'coimbatore',
  name: 'Coimbatore',
  sub: 'Tamil Nadu, India',
  role: 'Manufacturing HQ',
  coordinates: [76.9558, 11.0168],
};

// Real Destination Coordinates: [longitude, latitude]
const DESTINATIONS = [
  {
    id: 'usa',
    country: 'USA',
    flag: '🇺🇸',
    port: 'Los Angeles Port',
    secondaryPorts: ['Los Angeles Port', 'Houston Port'],
    region: 'North America',
    majorOnMobile: true,
    coordinates: [-118.2437, 34.0522],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    labelOffset: { x: 10, y: 4, textAnchor: 'start' },
  },
  {
    id: 'canada',
    country: 'Canada',
    flag: '🇨🇦',
    port: 'Toronto Port',
    secondaryPorts: ['Toronto Port'],
    region: 'North America',
    majorOnMobile: false,
    coordinates: [-79.3832, 43.6532],
    products: ['Cocopeat Blocks', 'Coir Pith'],
    labelOffset: { x: 10, y: -6, textAnchor: 'start' },
  },
  {
    id: 'uk',
    country: 'UK',
    flag: '🇬🇧',
    port: 'London Port',
    secondaryPorts: ['London Port'],
    region: 'Europe',
    majorOnMobile: false,
    coordinates: [-0.1276, 51.5072],
    products: ['Cocopeat Blocks', 'Coco Chips'],
    labelOffset: { x: -10, y: -8, textAnchor: 'end' }, // Offset to avoid Netherlands/Germany
  },
  {
    id: 'netherlands',
    country: 'Netherlands',
    flag: '🇳🇱',
    port: 'Rotterdam Port',
    secondaryPorts: ['Rotterdam Port'],
    region: 'Europe',
    majorOnMobile: false,
    coordinates: [4.4777, 51.9244],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    labelOffset: { x: 8, y: 12, textAnchor: 'start' }, // Offset to avoid UK/Germany
  },
  {
    id: 'germany',
    country: 'Germany',
    flag: '🇩🇪',
    port: 'Hamburg Port',
    secondaryPorts: ['Hamburg Port'],
    region: 'Europe',
    majorOnMobile: true,
    coordinates: [9.9937, 53.5511],
    products: ['Grow Bags', 'Coco Chips'],
    labelOffset: { x: 10, y: -6, textAnchor: 'start' }, // Separate offset
  },
  {
    id: 'spain',
    country: 'Spain',
    flag: '🇪🇸',
    port: 'Valencia Port',
    secondaryPorts: ['Valencia Port'],
    region: 'Europe',
    majorOnMobile: false,
    coordinates: [-0.3763, 39.4699],
    products: ['Grow Bags', 'Coir Pith'],
    labelOffset: { x: -10, y: 8, textAnchor: 'end' },
  },
  {
    id: 'uae',
    country: 'UAE',
    flag: '🇦🇪',
    port: 'Jebel Ali Port',
    secondaryPorts: ['Jebel Ali Port'],
    region: 'Middle East',
    majorOnMobile: true,
    coordinates: [55.1713, 25.0657],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    labelOffset: { x: -10, y: 12, textAnchor: 'end' },
  },
  {
    id: 'saudi',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    port: 'Jeddah Port',
    secondaryPorts: ['Jeddah Port'],
    region: 'Middle East',
    majorOnMobile: false,
    coordinates: [39.1925, 21.4858],
    products: ['Cocopeat Blocks', 'Coir Pith'],
    labelOffset: { x: -10, y: 10, textAnchor: 'end' },
  },
  {
    id: 'singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    port: 'Singapore Port',
    secondaryPorts: ['Singapore Port'],
    region: 'Asia Pacific',
    majorOnMobile: false,
    coordinates: [103.8198, 1.3521],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    labelOffset: { x: 10, y: 10, textAnchor: 'start' },
  },
  {
    id: 'skorea',
    country: 'South Korea',
    flag: '🇰🇷',
    port: 'Busan Port',
    secondaryPorts: ['Busan Port'],
    region: 'Asia Pacific',
    majorOnMobile: false,
    coordinates: [129.0756, 35.1796],
    products: ['Grow Bags', 'Coco Chips'],
    labelOffset: { x: -10, y: -8, textAnchor: 'end' }, // Separate offset from Japan
  },
  {
    id: 'japan',
    country: 'Japan',
    flag: '🇯🇵',
    port: 'Tokyo Port',
    secondaryPorts: ['Tokyo Port'],
    region: 'Asia Pacific',
    majorOnMobile: true,
    coordinates: [139.6503, 35.6762],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    labelOffset: { x: 10, y: -6, textAnchor: 'start' }, // Separate offset from SKorea
  },
  {
    id: 'australia',
    country: 'Australia',
    flag: '🇦🇺',
    port: 'Melbourne Port',
    secondaryPorts: ['Melbourne Port'],
    region: 'Asia Pacific',
    majorOnMobile: true,
    coordinates: [144.9631, -37.8136],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    labelOffset: { x: 10, y: 4, textAnchor: 'start' },
  },
  {
    id: 'nz',
    country: 'New Zealand',
    flag: '🇳🇿',
    port: 'Auckland Port',
    secondaryPorts: ['Auckland Port'],
    region: 'Oceania',
    majorOnMobile: false,
    coordinates: [174.7633, -36.8485],
    products: ['Cocopeat Blocks', 'Coco Husk Chips'],
    labelOffset: { x: 10, y: 6, textAnchor: 'start' },
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

const GlobalMap = () => {
  const [hoveredDest, setHoveredDest] = useState(null);
  const [selectedDestMobile, setSelectedDestMobile] = useState(null);
  const filterId = useId();

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
            2. MAIN INTERACTIVE MAP SECTION (MERCATOR PROJECTION WITH REAL LAT/LONG)
        ========================================================================= */}
        <div className="relative w-full bg-[#F5F7F4] rounded-[16px] border border-stone-200/70 overflow-hidden shadow-inner mb-8">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#2E7D32_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-10 pointer-events-none z-10"></div>

          <div className="w-full relative select-none">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 135, center: [20, 18] }}
              style={{ width: "100%", height: "auto" }}
            >
              <defs>
                {/* Glow Filter for HQ Origin */}
                <filter id={`glow-${filterId}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Real World Atlas Geographies */}
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#E8F5E9"
                      stroke="#C8E6C9"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#C8E6C9", outline: "none", transition: "all 200ms" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* REAL CURVED GEOGRAPHIC SHIPPING ROUTES (ORIGINATING EXACTLY FROM COIMBATORE) */}
              {DESTINATIONS.map((dest) => {
                const isHovered = hoveredDest?.id === dest.id;

                return (
                  <g key={`route-${dest.id}`}>
                    {/* Base Curve Line */}
                    <Line
                      from={ORIGIN.coordinates}
                      to={dest.coordinates}
                      stroke={isHovered ? "#2E7D32" : "#A26B3D"}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      strokeOpacity={isHovered ? 0.9 : 0.3}
                      strokeLinecap="round"
                    />

                    {/* Animated Pulse Flow Line */}
                    <Line
                      from={ORIGIN.coordinates}
                      to={dest.coordinates}
                      stroke="#2E7D32"
                      strokeWidth={isHovered ? 3 : 2}
                      strokeDasharray="6 8"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  </g>
                );
              })}

              {/* DESTINATION MARKERS WITH NON-OVERLAPPING OFFSET LABELS */}
              {DESTINATIONS.map((dest) => {
                const isHovered = hoveredDest?.id === dest.id;
                const isMajor = dest.majorOnMobile;

                return (
                  <Marker
                    key={`marker-${dest.id}`}
                    coordinates={dest.coordinates}
                    onMouseEnter={() => setHoveredDest(dest)}
                    onMouseLeave={() => setHoveredDest(null)}
                    onClick={() => {
                      setHoveredDest(dest);
                      setSelectedDestMobile(dest);
                    }}
                    className={`cursor-pointer outline-none transition-transform duration-300 ${
                      !isMajor ? 'hidden sm:block' : 'block'
                    }`}
                  >
                    {/* Touch Ripple / Pulse on Hover */}
                    {isHovered && (
                      <circle r="14" fill="#F59E0B" opacity="0.25" />
                    )}

                    {/* Outer Pin Halo */}
                    <circle r="7" fill="#F59E0B" opacity="0.35" />
                    {/* Inner Center Dot */}
                    <circle r="4" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />

                    {/* Non-overlapping Geographic Label */}
                    <text
                      x={dest.labelOffset.x}
                      y={dest.labelOffset.y}
                      textAnchor={dest.labelOffset.textAnchor}
                      className="hidden lg:block fill-stone-800 text-[10px] font-extrabold tracking-tight pointer-events-none drop-shadow-xs"
                      style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif' }}
                    >
                      {dest.country}
                    </text>
                  </Marker>
                );
              })}

              {/* MANUFACTURING HQ MARKER (COIMBATORE, TAMIL NADU, INDIA) */}
              <Marker coordinates={ORIGIN.coordinates} className="cursor-pointer">
                {/* Multi-layered Animated Pulse Halo */}
                <circle r="18" fill="#2E7D32" opacity="0.2" filter={`url(#glow-${filterId})`}>
                  <animate attributeName="r" values="12;24;12" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2.2s" repeatCount="indefinite" />
                </circle>

                <circle r="10" fill="#2E7D32" opacity="0.3" />
                <circle r="6" fill="#2E7D32" stroke="#FFFFFF" strokeWidth="2" />
                <circle r="2" fill="#FFFFFF" />

                {/* HQ Label */}
                <g transform="translate(0, -22)">
                  <rect
                    x="-48"
                    y="-12"
                    width="96"
                    height="18"
                    rx="4"
                    fill="#2E7D32"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    className="shadow-md"
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    className="text-[9px] font-extrabold tracking-tight pointer-events-none"
                    style={{ fontSize: '9px', fontFamily: 'Inter, sans-serif', fontWeight: '800' }}
                  >
                    Manufacturing HQ
                  </text>
                </g>
              </Marker>
            </ComposableMap>
          </div>

          {/* DESKTOP HOVER TOOLTIP */}
          <AnimatePresence>
            {hoveredDest && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-4 right-4 z-40 hidden sm:block pointer-events-none"
              >
                <div className="bg-white/95 backdrop-blur-md text-stone-900 rounded-xl p-4 shadow-xl border border-stone-200/90 w-56">
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
                        Supplied Products:
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
        ========================================================================= */}
        <div>
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
