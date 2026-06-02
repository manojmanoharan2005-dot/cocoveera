import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const GlobalMap = () => {
  const [activePort, setActivePort] = useState(null);

  // Approximate [longitude, latitude] coordinates
  const ports = [
    { id: 'origin', name: 'Cocoveera Cochin Port (India)', coordinates: [76.2673, 9.9312], isOrigin: true, type: 'Manufacturing HQ & Port' },
    { id: 'nl', name: 'Rotterdam Port (Netherlands)', coordinates: [4.4791, 51.9225], country: 'Europe', transit: '18 Days', volume: 'High' },
    { id: 'la', name: 'Port of Los Angeles (USA)', coordinates: [-118.2437, 34.0522], country: 'North America', transit: '24 Days', volume: 'Very High' },
    { id: 'jp', name: 'Port of Tokyo (Japan)', coordinates: [139.6917, 35.6895], country: 'East Asia', transit: '12 Days', volume: 'Medium' },
    { id: 'au', name: 'Port of Melbourne (Australia)', coordinates: [144.9631, -37.8136], country: 'Oceania', transit: '14 Days', volume: 'High' },
    { id: 'za', name: 'Port of Durban (South Africa)', coordinates: [31.0218, -29.8587], country: 'Africa', transit: '16 Days', volume: 'Medium' },
  ];

  const origin = ports.find(p => p.isOrigin);

  return (
    <div className="relative bg-white rounded-3xl p-6 lg:p-10 shadow-soft border border-stone-200 overflow-hidden">
      {/* Soft background grid dots */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2F7D32_1px,transparent_1px)] [background-size:20px_20px]"></div>
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 relative z-10">
        <div>
          <span className="text-secondary font-poppins text-[10px] font-bold uppercase tracking-widest">
            LOGISTICS & DISTRIBUTION
          </span>
          <h3 className="text-xl font-poppins font-extrabold text-stone-900 mt-1">
            Global Supply Chain Network
          </h3>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-6 text-[11px] text-stone-500 font-semibold uppercase tracking-wider">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></span>
            <span>Export Hub</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-secondary rounded-full"></span>
            <span>Receiving Terminal</span>
          </div>
        </div>
      </div>

      {/* Real Map Canvas */}
      <div className="relative w-full overflow-x-auto select-none bg-stone-50/30 rounded-2xl border border-stone-100">
        <div className="min-w-[800px] aspect-[800/400] relative">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 120, center: [10, 15] }}
            style={{ width: "100%", height: "100%" }}
          >
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
                      hover: { fill: "#C8E6C9", outline: "none", transition: "all 250ms" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Connection Lines */}
            {ports.filter(p => !p.isOrigin).map(port => (
              <g key={`line-${port.id}`}>
                {/* Static base line */}
                <Line
                  from={origin.coordinates}
                  to={port.coordinates}
                  stroke="rgba(162, 107, 61, 0.15)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {/* Dashed animated line */}
                <Line
                  from={origin.coordinates}
                  to={port.coordinates}
                  stroke="#2F7D32"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              </g>
            ))}

            {/* Markers */}
            {ports.map((port) => (
              <Marker 
                key={port.id} 
                coordinates={port.coordinates}
                onMouseEnter={() => setActivePort(port)}
                onMouseLeave={() => setActivePort(null)}
                className="cursor-pointer outline-none"
              >
                {port.isOrigin ? (
                  <g>
                    <circle r="12" fill="rgba(47, 125, 50, 0.2)" />
                    <circle r="20" fill="none" stroke="#2F7D32" strokeWidth="1.5" className="animate-ping" />
                    <circle r="6" fill="#2F7D32" stroke="#fff" strokeWidth="2" />
                  </g>
                ) : (
                  <g>
                    <circle r="10" fill="rgba(162, 107, 61, 0.2)" />
                    <circle r="16" fill="none" stroke="#A26B3D" strokeWidth="1" className="animate-pulse" />
                    <circle r="5" fill="#A26B3D" stroke="#fff" strokeWidth="1.5" />
                  </g>
                )}
              </Marker>
            ))}
          </ComposableMap>

          {/* Active port popover card */}
          {activePort && (
            <div
              className="absolute left-1/2 top-10 transform -translate-x-1/2 bg-white text-stone-900 border border-stone-200 rounded-xl p-4 shadow-lg z-30 transition-opacity duration-300 pointer-events-none"
            >
              <div className="font-poppins font-bold text-xs text-primary mb-0.5">
                {activePort.name}
              </div>
              <div className="text-[10px] text-stone-500 font-semibold">
                {activePort.type || `${activePort.country} · ${activePort.transit}`}
              </div>
              
              {!activePort.isOrigin && (
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3">
                  <div>
                    <div className="text-[9px] text-stone-400 uppercase tracking-wider mb-0.5">Volume</div>
                    <div className="text-xs font-bold text-stone-700">{activePort.volume}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-stone-400 uppercase tracking-wider mb-0.5">Status</div>
                    <div className="text-xs font-bold text-green-600">Active Route</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalMap;
