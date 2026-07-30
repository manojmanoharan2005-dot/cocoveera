/**
 * File: frontend/src/components/GlobalMap.jsx
 * Purpose: Enterprise "Global Supply Chain Network" map component for Cocoveera B2B Export Website.
 * Clean, map-focused mobile experience with native gesture pan/zoom, no floating UI/popups/buttons on mobile,
 * and compact single-line touch tooltips. Full desktop UI completely preserved.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from 'react-simple-maps';
import { Anchor, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Manufacturing HQ (Coimbatore, Tamil Nadu, India)
export const ORIGIN = {
  id: 'coimbatore',
  name: 'Coimbatore',
  city: 'Coimbatore',
  sub: 'Tamil Nadu, India',
  role: 'Manufacturing HQ',
  status: 'Active Export Hub',
  coordinates: [76.9558, 11.0168],
};

// 13 Destination Markets with Real Geographic Coordinates
export const DESTINATIONS = [
  {
    id: 'usa',
    country: 'USA',
    city: 'Los Angeles Port',
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
    city: 'Toronto Port',
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
    city: 'London Port',
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
    city: 'Rotterdam Port',
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
    city: 'Hamburg Port',
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
    city: 'Valencia Port',
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
    city: 'Jebel Ali Port',
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
    city: 'Jeddah Port',
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
    city: 'Singapore Port',
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
    city: 'Busan Port',
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
    city: 'Tokyo Port',
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
    city: 'Melbourne Port',
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
    city: 'Auckland Port',
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
  const [tappedDest, setTappedDest] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState({ coordinates: [20, 18], zoom: 1 });

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setPosition({ coordinates: [18, 12], zoom: 1.1 });
      } else {
        setPosition({ coordinates: [20, 18], zoom: 1 });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMarkerClick = (dest) => {
    setTappedDest(dest);
    if (onSelectDestination) {
      onSelectDestination(dest);
    }
  };

  const handleZoomIn = () => {
    if (position.zoom < 4) {
      setPosition((prev) => ({ ...prev, zoom: prev.zoom * 1.3 }));
    }
  };

  const handleZoomOut = () => {
    if (position.zoom > 0.8) {
      setPosition((prev) => ({ ...prev, zoom: prev.zoom / 1.3 }));
    }
  };

  const handleResetZoom = () => {
    setPosition({
      coordinates: [20, isMobile ? 12 : 18],
      zoom: isMobile ? 1.1 : 1,
    });
  };

  const handleMoveEnd = (newPosition) => {
    setPosition(newPosition);
  };

  return (
    <div className="relative w-full bg-[#FAF9F6] rounded-[20px] border border-stone-200/80 overflow-hidden shadow-sm touch-pan-x touch-pan-y">
      
      {/* DESKTOP ONLY Zoom Controls */}
      {!isMobile && (
        <div className="absolute top-4 left-4 z-40 flex flex-col gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-[14px] shadow-sm border border-stone-200">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100 active:scale-95 transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100 active:scale-95 transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            aria-label="Reset zoom"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Map Canvas Container - Mobile Height: 480px, Desktop: 650px */}
      <div className="w-full relative select-none bg-[#FAF9F6] h-[480px] md:h-[500px] lg:h-[550px] xl:h-[650px] flex items-center justify-center">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: isMobile ? 140 : 135 }}
          style={{ width: "100%", height: "100%", backgroundColor: "#FAF9F6" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            minZoom={0.8}
            maxZoom={5}
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

            {/* Export Route Lines - Visible with high contrast */}
            {DESTINATIONS.map((dest) => {
              const isSelected = activeDestId === dest.id || tappedDest?.id === dest.id;
              const isHovered = hoveredDest?.id === dest.id;
              const active = isSelected || isHovered;

              return (
                <g key={`route-${dest.id}`}>
                  <Line
                    from={ORIGIN.coordinates}
                    to={dest.coordinates}
                    stroke={active ? "#2E7D32" : "#2E7D32"}
                    strokeWidth={isMobile ? (active ? 2.5 : 1.5) : (active ? 2 : 1)}
                    strokeOpacity={active ? 0.95 : (isMobile ? 0.45 : 0.3)}
                    strokeLinecap="round"
                  />
                  <Line
                    from={ORIGIN.coordinates}
                    to={dest.coordinates}
                    stroke={active ? "#2E7D32" : "#4CAF50"}
                    strokeWidth={isMobile ? (active ? 3 : 1.8) : (active ? 2.2 : 1.2)}
                    strokeDasharray="4 6"
                    strokeLinecap="round"
                    opacity={active ? 1 : (isMobile ? 0.6 : 0.4)}
                  />
                </g>
              );
            })}

            {/* Destination Markers */}
            {DESTINATIONS.map((dest) => {
              const isSelected = activeDestId === dest.id || tappedDest?.id === dest.id;
              const markerRadius = isMobile ? (isSelected ? 8.5 : 6.5) : (isSelected ? 6 : 4.5);

              return (
                <Marker
                  key={`marker-${dest.id}`}
                  coordinates={dest.coordinates}
                  onMouseEnter={() => !isMobile && setHoveredDest(dest)}
                  onMouseLeave={() => !isMobile && setHoveredDest(null)}
                  onClick={() => handleMarkerClick(dest)}
                  className="cursor-pointer outline-none"
                >
                  {/* Outer pulse animation */}
                  <circle r={isMobile ? (isSelected ? 16 : 10) : (isSelected ? 14 : 8)} fill="#F59E0B" opacity={isSelected ? 0.4 : 0.25}>
                    <animate attributeName="r" values={isMobile ? "8;18;8" : "6;14;6"} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>

                  {/* Marker Dot */}
                  <circle
                    r={markerRadius}
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth={isMobile ? 2 : 1.5}
                    className="transition-all duration-300 shadow-sm"
                  />

                  {/* DESKTOP ONLY Inline Country Labels */}
                  {!isMobile && (
                    <text
                      x={dest.labelOffset.x}
                      y={dest.labelOffset.y}
                      textAnchor={dest.labelOffset.textAnchor}
                      className={`transition-all duration-300 ${
                        isSelected
                          ? 'fill-[#2E7D32] text-[10px] font-bold'
                          : 'fill-stone-600 text-[9px] font-medium'
                      } pointer-events-none`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {dest.country}
                    </text>
                  )}
                </Marker>
              );
            })}

            {/* Manufacturing HQ Marker (Green pulse on Coimbatore) */}
            <Marker
              coordinates={ORIGIN.coordinates}
              onClick={() => isMobile && setTappedDest(ORIGIN)}
              className="cursor-pointer z-30"
            >
              <circle r={isMobile ? 24 : 22} fill="#2E7D32" opacity="0.25">
                <animate attributeName="r" values={isMobile ? "12;26;12" : "10;24;10"} dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2.2s" repeatCount="indefinite" />
              </circle>

              <circle r={isMobile ? 10 : 9} fill="#2E7D32" opacity="0.35" />
              <circle r={isMobile ? 7 : 6} fill="#2E7D32" stroke="#FFFFFF" strokeWidth={isMobile ? 2 : 2} />
              <circle r={isMobile ? 2.5 : 2} fill="#FFFFFF" />

              {!isMobile && (
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
              )}
            </Marker>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* DESKTOP ONLY Hover Card */}
      <AnimatePresence>
        {!isMobile && hoveredDest && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-4 right-4 z-40 pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-md text-stone-900 rounded-[14px] p-3.5 shadow-md border border-stone-200 w-56 text-xs">
              <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
                <span className="text-base">{hoveredDest.flag}</span>
                <span>{hoveredDest.country}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600 font-medium mb-1">
                <Anchor className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>{hoveredDest.port}</span>
              </div>
              <div className="text-[10px] text-stone-500 font-medium">
                Products: {hoveredDest.products.join(', ')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE ONLY Small Tapped Tooltip (Only Country / City) */}
      <AnimatePresence>
        {isMobile && tappedDest && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          >
            <div
              onClick={() => setTappedDest(null)}
              className="bg-stone-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-2 text-xs font-bold"
            >
              {tappedDest.flag && <span>{tappedDest.flag}</span>}
              <span>{tappedDest.country || tappedDest.name}</span>
              {tappedDest.city && <span className="opacity-70 font-normal">({tappedDest.city})</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GlobalMap;
