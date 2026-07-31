/**
 * File: frontend/src/components/GlobalMap.jsx
 * Purpose: Enterprise "Global Supply Chain Network" map component for Cocoveera B2B Export Website.
 * Clean, modern, export-focused interactive logistics map with real geographic projections,
 * SVG curved routes, interactive marker tooltips, responsive zoom/pan, and premium styling.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { geoMercator } from 'd3-geo';
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

// 13 Export Destinations with exact longitude & latitude coordinates [long, lat]
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
    curveOffset: 40,
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
    curveOffset: 35,
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
    curveOffset: -50,
    shipPos: 0.55,
  },
];

// Quadratic Bezier Curve path string & interpolation helper
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

const getPointOnQuadraticBezier = (start, ctrl, end, t) => {
  const x = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * ctrl[0] + t * t * end[0];
  const y = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * ctrl[1] + t * t * end[1];
  return [x, y];
};

const GlobalMap = ({ onSelectDestination, activeDestId }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredDestId, setHoveredDestId] = useState(null);
  const [selectedDestId, setSelectedDestId] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive projection settings:
  // Desktop: Scale 155, centered at [20, 15] for full world overview
  // Mobile: Scale 210 (zoomed in nicely), centered at [55, 18] around India hub
  const width = 1000;
  const height = isMobile ? 520 : 600;
  const scale = isMobile ? 210 : 155;
  const center = useMemo(() => (isMobile ? [55, 18] : [20, 15]), [isMobile]);

  // Projection instance matching react-simple-maps for accurate curved route rendering
  const projection = useMemo(() => {
    return geoMercator()
      .scale(scale)
      .center(center)
      .translate([width / 2, height / 2]);
  }, [scale, center, width, height]);

  const hqPos = useMemo(() => projection(ORIGIN.coordinates), [projection]);

  const activeId = activeDestId || selectedDestId || hoveredDestId;

  const handleMarkerClick = (dest) => {
    setSelectedDestId(prev => (prev === dest.id ? null : dest.id));
    if (onSelectDestination) {
      onSelectDestination(dest);
    }
  };

  return (
    <div className="w-full bg-white rounded-[24px] border border-stone-200/80 p-3.5 sm:p-8 lg:p-10 shadow-lg shadow-stone-100/70 overflow-hidden font-sans">
      
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-6 mb-4 sm:mb-8">
        <div>
          <span className="text-[#2E7D32] text-xs font-extrabold uppercase tracking-widest block mb-1 sm:mb-2">
            LOGISTICS &amp; DISTRIBUTION
          </span>

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#1C1917] tracking-tight mb-1.5 sm:mb-3">
            Global <span className="text-[#2E7D32]">Supply Chain</span> Network
          </h2>

          <p className="text-stone-500 text-xs sm:text-sm max-w-xl leading-relaxed">
            Cocoveera exports premium coco peat, coir products, and coconut growing substrates to customers across multiple international destinations.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 sm:gap-6 bg-stone-50/90 border border-stone-200/80 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full shadow-xs text-[11px] sm:text-xs font-semibold text-stone-700 self-start md:self-auto">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D32] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#2E7D32]"></span>
            </span>
            <span>HQ (Coimbatore)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#F59E0B] border border-white shadow-xs" />
            <span>Export Destinations</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAP CONTAINER
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full bg-[#FAF9F6] rounded-[20px] border border-stone-200/60 overflow-hidden shadow-inner h-[420px] sm:h-[520px] lg:h-[600px] flex items-center justify-center select-none">
        
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale, center }}
          width={width}
          height={height}
          style={{ width: "100%", height: "100%", backgroundColor: "#FAF9F6" }}
        >
          <ZoomableGroup center={center} zoom={1} minZoom={0.7} maxZoom={4}>
            
            {/* World Country Geographies */}
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

            {/* SVG Curved Export Routes & Cargo Ships */}
            <g className="pointer-events-none">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#81C784" stopOpacity="0.65" />
                </linearGradient>
              </defs>

              {DESTINATIONS.map((dest) => {
                const destPos = projection(dest.coordinates);
                if (!destPos || !hqPos) return null;

                const { d, ctrl } = getCurvedPath(hqPos, destPos, dest.curveOffset || -30);
                const isSelected = activeId === dest.id;
                const shipCoords = getPointOnQuadraticBezier(hqPos, ctrl, destPos, dest.shipPos || 0.5);

                return (
                  <g key={`route-group-${dest.id}`}>
                    <motion.path
                      d={d}
                      fill="none"
                      stroke={isSelected ? "#1B5E20" : "url(#routeGrad)"}
                      strokeWidth={isSelected ? (isMobile ? 3 : 3.5) : (isMobile ? 1.8 : 2)}
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: isSelected ? 1 : 0.75 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                    />

                    {/* Cargo ship icon along curve */}
                    <g transform={`translate(${shipCoords[0] - 6}, ${shipCoords[1] - 6})`}>
                      <rect width="12" height="12" rx="6" fill="#FFFFFF" opacity="0.95" className="shadow-xs" />
                      <Ship className="w-3 h-3 text-[#2E7D32] p-0.5" />
                    </g>
                  </g>
                );
              })}
            </g>

            {/* MANUFACTURING HQ MARKER (COIMBATORE, INDIA) */}
            <Marker coordinates={ORIGIN.coordinates}>
              <g className="cursor-pointer group" transform="translate(0, 0)">
                <circle r={isMobile ? 14 : 16} fill="#2E7D32" opacity={0.25} className="animate-ping" />
                <circle r={isMobile ? 10 : 11} fill="#2E7D32" stroke="#FFFFFF" strokeWidth={2} className="shadow-md" />
                <foreignObject x="-14" y="-14" width="28" height="28" className="pointer-events-none">
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Factory className="w-3.5 h-3.5" />
                  </div>
                </foreignObject>

                {/* Always Visible Clean HQ Badge */}
                <foreignObject x="-60" y="14" width="120" height="40" className="pointer-events-none overflow-visible">
                  <div className="flex flex-col items-center">
                    <div className="bg-[#2E7D32] text-white px-2 py-0.5 rounded-md shadow-md border border-white/40 text-center whitespace-nowrap">
                      <div className="text-[9px] sm:text-[10px] font-extrabold tracking-wider leading-tight">
                        {ORIGIN.name}
                      </div>
                      <div className="text-[8px] text-white/90 font-medium leading-tight">
                        {ORIGIN.sub}
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </g>
            </Marker>

            {/* 13 DESTINATION MARKERS PLACED AT REAL LAT/LONG */}
            {DESTINATIONS.map((dest) => {
              const isSelected = activeId === dest.id;
              const isHovered = hoveredDestId === dest.id;

              return (
                <Marker key={`dest-marker-${dest.id}`} coordinates={dest.coordinates}>
                  <g
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkerClick(dest);
                    }}
                    onMouseEnter={() => setHoveredDestId(dest.id)}
                    onMouseLeave={() => setHoveredDestId(null)}
                  >
                    {/* Location Pin Ring Animation */}
                    <circle
                      r={isSelected ? (isMobile ? 12 : 14) : (isMobile ? 8 : 9)}
                      fill={isSelected ? '#1B5E20' : '#F59E0B'}
                      opacity={0.35}
                      className="animate-pulse"
                    />
                    
                    {/* Main Pin Icon Circle */}
                    <circle
                      r={isSelected ? (isMobile ? 7 : 8) : (isMobile ? 5.5 : 6)}
                      fill={isSelected ? '#1B5E20' : '#F59E0B'}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                      className="shadow-sm transition-transform duration-200 hover:scale-125"
                    />

                    {/* INTERACTIVE HOVER/SELECTED TOOLTIP CARD */}
                    <AnimatePresence>
                      {(isSelected || isHovered) && (
                        <foreignObject
                          x="-80"
                          y={isMobile ? "-65" : "-75"}
                          width="160"
                          height="70"
                          className="pointer-events-none overflow-visible z-50"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center"
                          >
                            <div className="bg-stone-900/95 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl shadow-xl border border-white/20 text-center whitespace-nowrap min-w-[110px]">
                              <div className="text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center gap-1.5 leading-tight">
                                <span>{dest.flag}</span>
                                <span>{dest.country}</span>
                              </div>
                              <div className="text-[8.5px] sm:text-[9.5px] text-stone-300 font-medium leading-tight mt-0.5">
                                {dest.city}
                              </div>
                            </div>
                            {/* Down Arrow Tip */}
                            <div className="w-2 h-2 bg-stone-900/95 rotate-45 -mt-1 border-r border-b border-white/20" />
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

        {/* Mobile Drag & Zoom Hint Overlay */}
        {isMobile && (
          <div className="absolute bottom-2.5 right-3 bg-stone-900/75 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-medium pointer-events-none z-30 shadow-md">
            Pinch / Drag to explore map
          </div>
        )}

      </div>
    </div>
  );
};

export default GlobalMap;


