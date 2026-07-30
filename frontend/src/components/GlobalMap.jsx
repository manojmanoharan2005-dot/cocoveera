/**
 * File: frontend/src/components/GlobalMap.jsx
 * Purpose: Enterprise "Global Supply Chain Network" map component for Cocoveera B2B Export Website.
 * Features clean vector map, responsive heights (Desktop: 650px, Laptop: 550px, Tablet: 450px, Mobile: 320px),
 * green pulse animation on Coimbatore HQ, thin elegant export routes with moving ship icons, and 13 export destinations.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { Anchor } from 'lucide-react';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Manufacturing HQ (Coimbatore, Tamil Nadu, India)
export const ORIGIN = {
  id: 'coimbatore',
  name: 'Coimbatore',
  sub: 'Tamil Nadu, India',
  role: 'Manufacturing HQ',
  coordinates: [76.9558, 11.0168],
};

// 13 Destination Markets with Real Geographic Coordinates
export const DESTINATIONS = [
  {
    id: 'usa',
    country: 'USA',
    flag: '🇺🇸',
    port: 'Los Angeles Port',
    secondaryPorts: ['Los Angeles Port', 'Houston Port'],
    region: 'North America',
    coordinates: [-118.2437, 34.0522],
    products: ['Cocopeat Blocks', 'Grow Bags'],
    image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=600&q=80',
    labelOffset: { x: 8, y: 3, textAnchor: 'start' },
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
    image: 'https://images.unsplash.com/photo-1517935703635-27c57d382432?auto=format&fit=crop&w=600&q=80',
    labelOffset: { x: 8, y: -6, textAnchor: 'start' },
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
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
    labelOffset: { x: -8, y: -6, textAnchor: 'end' },
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
    image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=600&q=80',
    labelOffset: { x: 8, y: 10, textAnchor: 'start' },
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
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80',
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
    image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=600&q=80',
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
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    labelOffset: { x: -8, y: 10, textAnchor: 'end' },
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
    image: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=600&q=80',
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
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
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
    image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=600&q=80',
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
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
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
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80',
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
    image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=600&q=80',
    labelOffset: { x: 8, y: 6, textAnchor: 'start' },
  },
];

const GlobalMap = ({ onSelectDestination, activeDestId }) => {
  const [hoveredDest, setHoveredDest] = useState(null);

  return (
    <div className="relative w-full bg-[#FAF9F6] rounded-[20px] border border-stone-200/80 overflow-hidden shadow-sm">
      {/* Map Canvas Container - Heights: Mobile 320px, Tablet 450px, Laptop 550px, Desktop 650px */}
      <div className="w-full relative select-none bg-[#FAF9F6] h-[320px] md:h-[450px] lg:h-[550px] xl:h-[650px] flex items-center justify-center">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 135, center: [20, 18] }}
          style={{ width: "100%", height: "100%", backgroundColor: "#FAF9F6" }}
        >
          {/* World Vector Map - Light grey continents */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#E5E7EB"
                  stroke="#D1D5DB"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#D1D5DB", outline: "none", transition: "all 200ms" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Thin Curved Shipping Routes */}
          {DESTINATIONS.map((dest) => {
            const isSelected = activeDestId === dest.id;
            const isHovered = hoveredDest?.id === dest.id;
            const active = isSelected || isHovered;

            return (
              <g key={`route-${dest.id}`}>
                <Line
                  from={ORIGIN.coordinates}
                  to={dest.coordinates}
                  stroke={active ? "#2E7D32" : "#4CAF50"}
                  strokeWidth={active ? 1.8 : 0.8}
                  strokeOpacity={active ? 0.9 : 0.25}
                  strokeLinecap="round"
                />
                <Line
                  from={ORIGIN.coordinates}
                  to={dest.coordinates}
                  stroke={active ? "#2E7D32" : "#2E7D32"}
                  strokeWidth={active ? 2 : 1}
                  strokeDasharray="3 5"
                  strokeLinecap="round"
                  opacity={active ? 1 : 0.35}
                />
              </g>
            );
          })}

          {/* Destination Markers (Orange Points with Country Labels) */}
          {DESTINATIONS.map((dest) => {
            const isSelected = activeDestId === dest.id;

            return (
              <Marker
                key={`marker-${dest.id}`}
                coordinates={dest.coordinates}
                onMouseEnter={() => setHoveredDest(dest)}
                onMouseLeave={() => setHoveredDest(null)}
                onClick={() => onSelectDestination && onSelectDestination(dest)}
                className="cursor-pointer outline-none"
              >
                {isSelected && (
                  <circle r="12" fill="#F59E0B" opacity="0.3">
                    <animate attributeName="r" values="5;14;5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                <circle
                  r={isSelected ? 5.5 : 4}
                  fill={isSelected ? '#F59E0B' : '#F59E0B'}
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
                      ? 'fill-[#2E7D32] text-[10px] font-bold'
                      : 'fill-stone-600 text-[9px] font-medium'
                  } pointer-events-none`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {dest.country}
                </text>
              </Marker>
            );
          })}

          {/* Manufacturing HQ Marker (Green pulse on Coimbatore) */}
          <Marker coordinates={ORIGIN.coordinates} className="cursor-pointer z-30">
            {/* Green Pulse Ring */}
            <circle r="20" fill="#2E7D32" opacity="0.2">
              <animate attributeName="r" values="10;24;10" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0.02;0.35" dur="2.2s" repeatCount="indefinite" />
            </circle>

            <circle r="10" fill="#2E7D32" opacity="0.3" />
            <circle r="6" fill="#2E7D32" stroke="#FFFFFF" strokeWidth="2" />

            <g transform="translate(0, -22)">
              <rect
                x="-48"
                y="-12"
                width="96"
                height="18"
                rx="4"
                fill="#2E7D32"
                stroke="#FFFFFF"
                strokeWidth="1.2"
              />
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fill="#FFFFFF"
                style={{ fontSize: '8.5px', fontFamily: 'Inter, sans-serif', fontWeight: '700' }}
              >
                Manufacturing HQ
              </text>
            </g>
          </Marker>
        </ComposableMap>
      </div>

      {/* Hover Info Tag */}
      <AnimatePresence>
        {hoveredDest && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-4 right-4 z-40 hidden sm:block pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-md text-stone-900 rounded-[14px] p-3.5 shadow-md border border-stone-200 w-52 text-xs">
              <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
                <span className="text-base">{hoveredDest.flag}</span>
                <span>{hoveredDest.country}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                <Anchor className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>{hoveredDest.port}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalMap;
