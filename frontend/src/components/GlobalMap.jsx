/**
 * File: frontend/src/components/GlobalMap.jsx
 * Purpose: Enterprise "Global Supply Chain Network" map component for Cocoveera B2B Export Website.
 * Clean, modern, export-focused interactive logistics map with SVG curved routes, static layout cards,
 * clear marker labels, responsive proportional scaling, and premium enterprise styling.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { MapPin, Factory, Ship } from 'lucide-react';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Manufacturing HQ (Coimbatore, Tamil Nadu, India)
export const ORIGIN = {
  id: 'coimbatore',
  name: 'COIMBATORE',
  sub: 'Manufacturing HQ',
  city: 'Coimbatore',
  coordinates: [76.9558, 11.0168],
};

// 13 Export Destinations with custom label offsets & curve curvature parameters
export const DESTINATIONS = [
  {
    id: 'usa',
    country: 'USA',
    city: 'Los Angeles Port',
    flag: '🇺🇸',
    port: 'Los Angeles Port',
    products: ['Cocopeat Blocks', 'Grow Bags'],
    image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=600&q=80',
    coordinates: [-118.2437, 34.0522],
    labelDx: 12,
    labelDy: -12,
    mobileDx: 10,
    mobileDy: -10,
    curveOffset: -40,
    shipPos: 0.45,
  },
  {
    id: 'canada',
    country: 'Canada',
    city: 'Toronto Port',
    flag: '🇨🇦',
    port: 'Toronto Port',
    products: ['Cocopeat Blocks', 'Coir Pith'],
    image: 'https://images.unsplash.com/photo-1517935703635-27c57d382432?auto=format&fit=crop&w=600&q=80',
    coordinates: [-79.3832, 43.6532],
    labelDx: 12,
    labelDy: -28,
    mobileDx: 10,
    mobileDy: -24,
    curveOffset: -50,
    shipPos: 0.5,
  },
  {
    id: 'uk',
    country: 'UK',
    city: 'London Port',
    flag: '🇬🇧',
    port: 'London Port',
    products: ['Cocopeat Blocks', 'Coco Chips'],
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
    coordinates: [-0.1276, 51.5072],
    labelDx: -105,
    labelDy: -24,
    mobileDx: -80,
    mobileDy: -22,
    curveOffset: 35,
    shipPos: 0.4,
  },
  {
    id: 'netherlands',
    country: 'Netherlands',
    city: 'Rotterdam Port',
    flag: '🇳🇱',
    port: 'Rotterdam Port',
    products: ['Cocopeat Blocks', 'Grow Bags'],
    image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=600&q=80',
    coordinates: [4.4777, 51.9244],
    labelDx: 12,
    labelDy: -26,
    mobileDx: 10,
    mobileDy: -20,
    curveOffset: 30,
    shipPos: 0.45,
  },
  {
    id: 'germany',
    country: 'Germany',
    city: 'Hamburg Port',
    flag: '🇩🇪',
    port: 'Hamburg Port',
    products: ['Grow Bags', 'Coco Chips'],
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80',
    coordinates: [9.9937, 53.5511],
    labelDx: 12,
    labelDy: -8,
    mobileDx: 10,
    mobileDy: -6,
    curveOffset: 25,
    shipPos: 0.5,
  },
  {
    id: 'spain',
    country: 'Spain',
    city: 'Valencia Port',
    flag: '🇪🇸',
    port: 'Valencia Port',
    products: ['Grow Bags', 'Coir Pith'],
    image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=600&q=80',
    coordinates: [-0.3763, 39.4699],
    labelDx: -105,
    labelDy: 10,
    mobileDx: -80,
    mobileDy: 8,
    curveOffset: 30,
    shipPos: 0.45,
  },
  {
    id: 'uae',
    country: 'UAE',
    city: 'Jebel Ali Port',
    flag: '🇦🇪',
    port: 'Jebel Ali Port',
    products: ['Cocopeat Blocks', 'Grow Bags'],
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    coordinates: [55.1713, 25.0657],
    labelDx: -95,
    labelDy: -22,
    mobileDx: -75,
    mobileDy: -18,
    curveOffset: 15,
    shipPos: 0.5,
  },
  {
    id: 'saudi',
    country: 'Saudi Arabia',
    city: 'Jeddah Port',
    flag: '🇸🇦',
    port: 'Jeddah Port',
    products: ['Cocopeat Blocks', 'Coir Pith'],
    image: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=600&q=80',
    coordinates: [39.1925, 21.4858],
    labelDx: -105,
    labelDy: 12,
    mobileDx: -80,
    mobileDy: 10,
    curveOffset: 20,
    shipPos: 0.5,
  },
  {
    id: 'singapore',
    country: 'Singapore',
    city: 'Singapore Port',
    flag: '🇸🇬',
    port: 'Singapore Port',
    products: ['Cocopeat Blocks', 'Grow Bags'],
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
    coordinates: [103.8198, 1.3521],
    labelDx: 12,
    labelDy: 12,
    mobileDx: 8,
    mobileDy: 10,
    curveOffset: -15,
    shipPos: 0.5,
  },
  {
    id: 'skorea',
    country: 'South Korea',
    city: 'Busan Port',
    flag: '🇰🇷',
    port: 'Busan Port',
    products: ['Grow Bags', 'Coco Chips'],
    image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=600&q=80',
    coordinates: [129.0756, 35.1796],
    labelDx: 12,
    labelDy: -24,
    mobileDx: 10,
    mobileDy: -20,
    curveOffset: -30,
    shipPos: 0.55,
  },
  {
    id: 'japan',
    country: 'Japan',
    city: 'Tokyo Port',
    flag: '🇯🇵',
    port: 'Tokyo Port',
    products: ['Cocopeat Blocks', 'Grow Bags'],
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    coordinates: [139.6503, 35.6762],
    labelDx: 12,
    labelDy: 8,
    mobileDx: 10,
    mobileDy: 6,
    curveOffset: -35,
    shipPos: 0.5,
  },
  {
    id: 'australia',
    country: 'Australia',
    city: 'Melbourne Port',
    flag: '🇦🇺',
    port: 'Melbourne Port',
    products: ['Cocopeat Blocks', 'Grow Bags'],
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80',
    coordinates: [144.9631, -37.8136],
    labelDx: 12,
    labelDy: -10,
    mobileDx: 10,
    mobileDy: -8,
    curveOffset: -40,
    shipPos: 0.5,
  },
  {
    id: 'nz',
    country: 'New Zealand',
    city: 'Auckland Port',
    flag: '🇳🇿',
    port: 'Auckland Port',
    products: ['Cocopeat Blocks', 'Coco Husk Chips'],
    image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=600&q=80',
    coordinates: [174.7633, -36.8485],
    labelDx: -110,
    labelDy: 12,
    mobileDx: -85,
    mobileDy: 10,
    curveOffset: -50,
    shipPos: 0.55,
  },
];

// Helper to project geographic coordinates [long, lat] to SVG Mercator space
const projectCoord = ([long, lat], scale, center, width, height) => {
  const rad = Math.PI / 180;
  const lambda = long * rad;
  const phi = lat * rad;
  const lambda0 = center[0] * rad;
  const phi0 = center[1] * rad;

  // Mercator formula
  const x = width / 2 + (scale / (2 * Math.PI)) * (lambda - lambda0);
  const y = height / 2 - (scale / (2 * Math.PI)) * (Math.log(Math.tan(Math.PI / 4 + phi / 2)) - Math.log(Math.tan(Math.PI / 4 + phi0 / 2)));
  return [x, y];
};

// Quadratic Bezier Curve path string & interpolation helper
const getCurvedPath = (start, end, offset = -30) => {
  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2;
  
  // Normal perpendicular vector for smooth arching
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

const getPointOnQuadraticBezier = (start, ctrl, end, t) => {
  const x = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * ctrl[0] + t * t * end[0];
  const y = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * ctrl[1] + t * t * end[1];
  return [x, y];
};

const GlobalMap = ({ onSelectDestination, activeDestId }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Viewport projection parameters
  // Mobile width 800 (viewBox), Desktop 1000
  const width = isMobile ? 800 : 1000;
  const height = isMobile ? 480 : 650;
  const scale = isMobile ? 125 : 160;
  const center = isMobile ? [20, 10] : [20, 18];

  const hqPos = projectCoord(ORIGIN.coordinates, scale, center, width, height);

  return (
    <div className="w-full bg-white rounded-[24px] border border-stone-200/80 p-5 sm:p-8 lg:p-10 shadow-lg shadow-stone-100/70 overflow-hidden font-sans">
      
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          {/* Small Green Subtitle */}
          <span className="text-[#2E7D32] text-xs font-extrabold uppercase tracking-widest block mb-2">
            LOGISTICS &amp; DISTRIBUTION
          </span>

          {/* Main Heading with Highlighted "Supply Chain" */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1C1917] tracking-tight mb-3">
            Global <span className="text-[#2E7D32]">Supply Chain</span> Network
          </h2>

          {/* Subtitle Description */}
          <p className="text-stone-500 text-xs sm:text-sm max-w-xl leading-relaxed">
            Cocoveera exports premium coco peat, coir products, and coconut growing substrates to customers across multiple international destinations.
          </p>
        </div>

        {/* Clean Top-Right Legend */}
        <div className="flex items-center gap-6 bg-stone-50/90 border border-stone-200/80 px-4 py-2.5 rounded-full shadow-sm text-xs font-semibold text-stone-700 self-start md:self-auto">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2E7D32]"></span>
            </span>
            <span>Origin (Manufacturing HQ)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-white shadow-xs" />
            <span>Export Destinations</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAP CONTAINER
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full bg-[#FAF9F6] rounded-[20px] border border-stone-200/60 overflow-hidden shadow-inner h-[450px] sm:h-[500px] lg:h-[650px] flex items-center justify-center">
        
        {/* React Simple Maps World Vector Layer */}
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale, center }}
          width={width}
          height={height}
          style={{ width: "100%", height: "100%", backgroundColor: "#FAF9F6" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#E5E7EB"
                  stroke="#D1D5DB"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#E2E8F0", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
        </ComposableMap>

        {/* SVG Curved Export Lines & Cargo Ships Layer */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#81C784" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Export Curved Routes */}
          {DESTINATIONS.map((dest) => {
            const destPos = projectCoord(dest.coordinates, scale, center, width, height);
            const { d, ctrl } = getCurvedPath(hqPos, destPos, dest.curveOffset || -30);
            const isSelected = activeDestId === dest.id;

            // Interpolated ship position along curve
            const shipCoords = getPointOnQuadraticBezier(hqPos, ctrl, destPos, dest.shipPos || 0.5);

            return (
              <g key={`route-group-${dest.id}`}>
                {/* Curved SVG Line with route animation */}
                <motion.path
                  d={d}
                  fill="none"
                  stroke={isSelected ? "#1B5E20" : "url(#routeGrad)"}
                  strokeWidth={isSelected ? (isMobile ? 2.5 : 3) : (isMobile ? 1.5 : 2)}
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Optional tiny cargo ship icon on ocean route */}
                <g transform={`translate(${shipCoords[0] - 6}, ${shipCoords[1] - 6})`}>
                  <rect width="12" height="12" rx="6" fill="#FFFFFF" opacity="0.9" />
                  <Ship className="w-3 h-3 text-[#2E7D32] p-0.5" />
                </g>
              </g>
            );
          })}
        </svg>

        {/* Static HTML Overlay Markers & Always-Visible Information Cards */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
          
          {/* MANUFACTURING HQ MARKER (COIMBATORE) */}
          {(() => {
            const [x, y] = hqPos;
            const leftPct = (x / width) * 100;
            const topPct = (y / height) * 100;

            return (
              <div
                key="hq-marker"
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center group cursor-pointer"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              >
                {/* Green Pulsing Glow Rings */}
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#2E7D32] opacity-50"></span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2E7D32] border-2 border-white shadow-md flex items-center justify-center text-white">
                    <Factory className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  </div>
                </div>

                {/* Always-Visible HQ Information Card */}
                <div className="mt-1.5 bg-[#2E7D32] text-white px-2.5 py-1 rounded-lg shadow-md border border-white/30 text-center whitespace-nowrap">
                  <div className="text-[10px] sm:text-[11px] font-extrabold tracking-wider leading-tight">
                    {ORIGIN.name}
                  </div>
                  <div className="text-[8.5px] sm:text-[9.5px] text-white/90 font-medium leading-tight">
                    {ORIGIN.sub}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 13 EXPORT DESTINATION MARKERS & CARDS */}
          {DESTINATIONS.map((dest) => {
            const destPos = projectCoord(dest.coordinates, scale, center, width, height);
            const leftPct = (destPos[0] / width) * 100;
            const topPct = (destPos[1] / height) * 100;

            const dx = isMobile ? dest.mobileDx : dest.labelDx;
            const dy = isMobile ? dest.mobileDy : dest.labelDy;
            const isSelected = activeDestId === dest.id;

            return (
              <div
                key={`dest-${dest.id}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                onClick={() => onSelectDestination && onSelectDestination(dest)}
              >
                {/* Orange Location Pin Marker */}
                <div className="relative flex items-center justify-center cursor-pointer group">
                  <span className="animate-pulse absolute inline-flex h-5 w-5 rounded-full bg-[#F59E0B] opacity-40"></span>
                  <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#1B5E20] scale-125' : 'bg-[#F59E0B]'
                  }`}>
                    <MapPin className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </div>
                </div>

                {/* Always-Visible White Marker Information Card */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={`absolute bg-white/95 backdrop-blur-xs text-stone-900 px-2 sm:px-2.5 py-1 rounded-md shadow-md border text-left whitespace-nowrap pointer-events-none transition-all ${
                    isSelected ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/20' : 'border-stone-200/90'
                  }`}
                  style={{
                    transform: `translate(${dx}px, ${dy}px)`,
                  }}
                >
                  <div className="text-[9.5px] sm:text-[11px] font-extrabold text-[#1C1917] leading-tight flex items-center gap-1">
                    <span>{dest.country}</span>
                  </div>
                  <div className="text-[8px] sm:text-[9.5px] text-stone-500 font-medium leading-tight">
                    {dest.city}
                  </div>
                </motion.div>
              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
};

export default GlobalMap;
