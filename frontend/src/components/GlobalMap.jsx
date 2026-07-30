/**
 * File: frontend/src/components/GlobalMap.jsx
 * Purpose: Enterprise "Global Supply Chain Network" component for Cocoveera B2B Export Website.
 * Uses real latitude and longitude geographic projection (geoMercator) via react-simple-maps.
 * Massive hero map component with responsive heights (650px Desktop, 580px Laptop, 500px Tablet, 320px Mobile).
 */

import React, { useState, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { Anchor } from 'lucide-react';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Manufacturing HQ (Coimbatore, Tamil Nadu, India)
const ORIGIN = {
  id: 'coimbatore',
  name: 'Coimbatore',
  sub: 'Tamil Nadu, India',
  role: 'Manufacturing HQ',
  coordinates: [76.9558, 11.0168],
};

// Destination Data with Real Longitude/Latitude
const DESTINATIONS = [
  {
    id: 'usa',
    country: 'USA',
    flag: '🇺🇸',
    port: 'Los Angeles Port',
    secondaryPorts: ['Los Angeles Port', 'Houston Port'],
    region: 'North America',
    coordinates: [-118.2437, 34.0522],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    labelOffset: { x: 10, y: 3, textAnchor: 'start' },
  },
  {
    id: 'canada',
    country: 'Canada',
    flag: '🇨🇦',
    port: 'Toronto Port',
    secondaryPorts: ['Toronto Port'],
    region: 'North America',
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
    coordinates: [-0.1276, 51.5072],
    products: ['Cocopeat Blocks', 'Coco Chips'],
    labelOffset: { x: -8, y: -8, textAnchor: 'end' },
  },
  {
    id: 'netherlands',
    country: 'Netherlands',
    flag: '🇳🇱',
    port: 'Rotterdam Port',
    secondaryPorts: ['Rotterdam Port'],
    region: 'Europe',
    coordinates: [4.4777, 51.9244],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    labelOffset: { x: 8, y: 12, textAnchor: 'start' },
  },
  {
    id: 'germany',
    country: 'Germany',
    flag: '🇩🇪',
    port: 'Hamburg Port',
    secondaryPorts: ['Hamburg Port'],
    region: 'Europe',
    coordinates: [9.9937, 53.5511],
    products: ['Grow Bags', 'Coco Chips'],
    labelOffset: { x: 8, y: -6, textAnchor: 'start' },
  },
  {
    id: 'spain',
    country: 'Spain',
    flag: '🇪🇸',
    port: 'Valencia Port',
    secondaryPorts: ['Valencia Port'],
    region: 'Europe',
    coordinates: [-0.3763, 39.4699],
    products: ['Grow Bags', 'Coir Pith'],
    labelOffset: { x: -8, y: 8, textAnchor: 'end' },
  },
  {
    id: 'uae',
    country: 'UAE',
    flag: '🇦🇪',
    port: 'Jebel Ali Port',
    secondaryPorts: ['Jebel Ali Port'],
    region: 'Middle East',
    coordinates: [55.1713, 25.0657],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    labelOffset: { x: -8, y: 12, textAnchor: 'end' },
  },
  {
    id: 'saudi',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    port: 'Jeddah Port',
    secondaryPorts: ['Jeddah Port'],
    region: 'Middle East',
    coordinates: [39.1925, 21.4858],
    products: ['Cocopeat Blocks', 'Coir Pith'],
    labelOffset: { x: -8, y: 10, textAnchor: 'end' },
  },
  {
    id: 'singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    port: 'Singapore Port',
    secondaryPorts: ['Singapore Port'],
    region: 'Asia Pacific',
    coordinates: [103.8198, 1.3521],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    labelOffset: { x: 8, y: 10, textAnchor: 'start' },
  },
  {
    id: 'skorea',
    country: 'South Korea',
    flag: '🇰🇷',
    port: 'Busan Port',
    secondaryPorts: ['Busan Port'],
    region: 'Asia Pacific',
    coordinates: [129.0756, 35.1796],
    products: ['Grow Bags', 'Coco Chips'],
    labelOffset: { x: -8, y: -6, textAnchor: 'end' },
  },
  {
    id: 'japan',
    country: 'Japan',
    flag: '🇯🇵',
    port: 'Tokyo Port',
    secondaryPorts: ['Tokyo Port'],
    region: 'Asia Pacific',
    coordinates: [139.6503, 35.6762],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    labelOffset: { x: 8, y: -6, textAnchor: 'start' },
  },
  {
    id: 'australia',
    country: 'Australia',
    flag: '🇦🇺',
    port: 'Melbourne Port',
    secondaryPorts: ['Melbourne Port'],
    region: 'Asia Pacific',
    coordinates: [144.9631, -37.8136],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    labelOffset: { x: 8, y: 4, textAnchor: 'start' },
  },
  {
    id: 'nz',
    country: 'New Zealand',
    flag: '🇳🇿',
    port: 'Auckland Port',
    secondaryPorts: ['Auckland Port'],
    region: 'Oceania',
    coordinates: [174.7633, -36.8485],
    products: ['Cocopeat Blocks', 'Coco Husk Chips'],
    labelOffset: { x: 8, y: 6, textAnchor: 'start' },
  },
];

const GlobalMap = ({ onSelectDestination, activeDestId }) => {
  const [hoveredDest, setHoveredDest] = useState(null);
  const filterId = useId();

  return (
    <div className="relative w-full bg-white rounded-[24px] border border-stone-200/90 overflow-hidden shadow-xs">
      {/* Map Canvas Container with Exact Responsive Heights: Mobile 320px, Tablet 500px, Laptop 580px, Desktop 650px */}
      <div className="w-full relative select-none bg-white h-[320px] md:h-[500px] lg:h-[580px] xl:h-[650px] flex items-center justify-center">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140, center: [20, 18] }}
          style={{ width: "100%", height: "100%", backgroundColor: "#FFFFFF" }}
        >
          <defs>
            <filter id={`glow-${filterId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Clean Vector World Map - Light Grey Continents on Pure White */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#EEEEEE"
                  stroke="#E0E0E0"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#E2E8F0", outline: "none", transition: "all 200ms" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* ELEGANT THIN CURVED SHIPPING ROUTES (ORIGINATING EXACTLY FROM COIMBATORE) */}
          {DESTINATIONS.map((dest) => {
            const isSelected = activeDestId === dest.id;
            const isHovered = hoveredDest?.id === dest.id;
            const active = isSelected || isHovered;

            return (
              <g key={`route-${dest.id}`}>
                <Line
                  from={ORIGIN.coordinates}
                  to={dest.coordinates}
                  stroke={active ? "#2E7D32" : "#94A3B8"}
                  strokeWidth={active ? 2 : 1}
                  strokeOpacity={active ? 0.9 : 0.35}
                  strokeLinecap="round"
                />
                <Line
                  from={ORIGIN.coordinates}
                  to={dest.coordinates}
                  stroke={active ? "#2E7D32" : "#64748B"}
                  strokeWidth={active ? 2.2 : 1.2}
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                  opacity={active ? 1 : 0.4}
                  className={active ? "animate-pulse" : ""}
                />
              </g>
            );
          })}

          {/* DESTINATION MARKERS */}
          {DESTINATIONS.map((dest) => {
            const isSelected = activeDestId === dest.id;

            return (
              <Marker
                key={`marker-${dest.id}`}
                coordinates={dest.coordinates}
                onMouseEnter={() => setHoveredDest(dest)}
                onMouseLeave={() => setHoveredDest(null)}
                onClick={() => onSelectDestination && onSelectDestination(dest)}
                className="cursor-pointer outline-none transition-transform duration-300"
              >
                {isSelected && (
                  <circle r="14" fill="#2E7D32" opacity="0.25">
                    <animate attributeName="r" values="6;16;6" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.05;0.4" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}

                <circle
                  r={isSelected ? 6.5 : 4.5}
                  fill={isSelected ? '#2E7D32' : '#F59E0B'}
                  opacity={isSelected ? 0.95 : 0.6}
                  className="transition-all duration-300"
                />

                <circle
                  r={isSelected ? 4 : 2.5}
                  fill={isSelected ? '#2E7D32' : '#F59E0B'}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  className="transition-all duration-300"
                />

                <text
                  x={dest.labelOffset.x}
                  y={dest.labelOffset.y}
                  textAnchor={dest.labelOffset.textAnchor}
                  className={`hidden lg:block transition-all duration-300 ${
                    isSelected
                      ? 'fill-[#2E7D32] text-[10px] font-black'
                      : 'fill-stone-600 text-[9px] font-semibold'
                  } pointer-events-none`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {dest.country}
                </text>
              </Marker>
            );
          })}

          {/* MANUFACTURING HQ MARKER (COIMBATORE) */}
          <Marker coordinates={ORIGIN.coordinates} className="cursor-pointer z-30">
            <circle r="22" fill="#2E7D32" opacity="0.2" filter={`url(#glow-${filterId})`}>
              <animate attributeName="r" values="14;28;14" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2.4s" repeatCount="indefinite" />
            </circle>

            <circle r="12" fill="#2E7D32" opacity="0.35" />
            <circle r="7" fill="#2E7D32" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle r="2.5" fill="#FFFFFF" />

            <g transform="translate(0, -24)">
              <rect
                x="-50"
                y="-13"
                width="100"
                height="20"
                rx="5"
                fill="#2E7D32"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                className="shadow-md"
              />
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fill="#FFFFFF"
                className="text-[9px] font-black tracking-tight pointer-events-none"
                style={{ fontSize: '9px', fontFamily: 'Inter, sans-serif', fontWeight: '900' }}
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalMap;
