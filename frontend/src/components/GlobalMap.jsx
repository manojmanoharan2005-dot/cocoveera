/**
 * File: frontend/src/components/GlobalMap.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const GlobalMap = () => {
  const [activePort, setActivePort] = useState(null);

  // Accurate [longitude, latitude] coordinates for all ports
  const ports = [
    { id: 'origin', name: 'Cocoveera Coimbatore Hub', coordinates: [76.9558, 11.0168], isOrigin: true, type: 'Manufacturing HQ & Export Hub', country: 'India' },
    
    // Japan
    { id: 'jp-tyo', name: 'Port of Tokyo', coordinates: [139.6917, 35.6895], country: 'Japan', transit: '18 Days', volume: 'High' },
    { id: 'jp-yok', name: 'Port of Yokohama', coordinates: [139.6380, 35.4437], country: 'Japan', transit: '18 Days', volume: 'High' },
    { id: 'jp-osa', name: 'Port of Osaka', coordinates: [135.5023, 34.6937], country: 'Japan', transit: '20 Days', volume: 'Medium' },
    
    // Australia
    { id: 'au-syd', name: 'Sydney (Port Botany)', coordinates: [151.2093, -33.8688], country: 'Australia', transit: '22 Days', volume: 'High' },
    { id: 'au-mel', name: 'Port of Melbourne', coordinates: [144.9631, -37.8136], country: 'Australia', transit: '24 Days', volume: 'Very High' },
    { id: 'au-bne', name: 'Port of Brisbane', coordinates: [153.0251, -27.4698], country: 'Australia', transit: '21 Days', volume: 'Medium' },
    
    // USA
    { id: 'us-la', name: 'Port of Los Angeles', coordinates: [-118.2437, 34.0522], country: 'USA', transit: '35 Days', volume: 'Very High' },
    { id: 'us-lb', name: 'Port of Long Beach', coordinates: [-118.1937, 33.7701], country: 'USA', transit: '35 Days', volume: 'High' },
    { id: 'us-ny', name: 'New York/New Jersey', coordinates: [-74.0060, 40.7128], country: 'USA', transit: '42 Days', volume: 'Very High' },
    { id: 'us-sav', name: 'Port of Savannah', coordinates: [-81.0998, 32.0809], country: 'USA', transit: '40 Days', volume: 'High' },
  ];

  const origin = ports.find(p => p.isOrigin);

  return (
    <div className="relative bg-white rounded-3xl p-4 sm:p-6 lg:p-10 shadow-soft border border-stone-200 overflow-hidden">
      {/* Background glow effects - softened for light mode */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2F7D32_1px,transparent_1px)] [background-size:20px_20px]"></div>
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 lg:mb-8 relative z-10">
        <div>
          <span className="text-secondary font-poppins text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            LOGISTICS & DISTRIBUTION
          </span>
          <h3 className="text-xl sm:text-2xl font-poppins font-extrabold text-stone-900 mt-1">
            Global Supply Chain Network
          </h3>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-4 text-[11px] text-stone-500 font-semibold uppercase tracking-wider">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></span>
            <span className="text-stone-700">Export Hub</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-secondary rounded-full"></span>
            <span className="text-stone-700">Receiving Terminal</span>
          </div>
        </div>
      </div>

      {/* Real Map Canvas */}
      <div className="relative w-full overflow-hidden select-none bg-stone-50/30 rounded-2xl border border-stone-100 backdrop-blur-sm">
        <div className="w-full relative overflow-x-auto custom-scrollbar">
          <div className="min-w-[600px] sm:min-w-full relative">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 130, center: [10, 15] }}
              style={{ width: "100%", height: "auto" }}
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
                        hover: { fill: "#A5D6A7", outline: "none", transition: "all 250ms" },
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
                    strokeWidth={1.5}
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
                  onClick={() => setActivePort(port)}
                  className="cursor-pointer outline-none"
                  data-tooltip-id="map-tooltip"
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
          </div>
        </div>
      </div>

      {/* Port Details Cards (for mobile & easier access) */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {['Japan', 'Australia', 'USA'].map((region) => (
          <div key={region} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">{region}</h4>
            <div className="space-y-3">
              {ports.filter(p => p.country === region).map(port => (
                <div 
                  key={port.id}
                  className="flex items-center justify-between group cursor-pointer"
                  onMouseEnter={() => setActivePort(port)}
                  onMouseLeave={() => setActivePort(null)}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-60 group-hover:opacity-100 transition-opacity"></span>
                    <span className="text-sm text-stone-700 font-medium group-hover:text-stone-900 transition-colors">{port.name}</span>
                  </div>
                  <span className="text-[10px] bg-white border border-stone-200 px-2 py-0.5 rounded-md text-stone-500">{port.transit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
           <h4 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">Origin</h4>
           <div className="flex flex-col justify-center h-full pb-6">
             <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-sm font-bold text-green-900">{origin.name}</span>
             </div>
             <span className="text-xs text-green-700">{origin.type}</span>
           </div>
        </div>
      </div>

      {/* react-tooltip dynamic popover */}
      <Tooltip 
        id="map-tooltip" 
        place="top"
        offset={15}
        className="!bg-white !opacity-100 !text-stone-900 !rounded-xl !p-0 !shadow-xl !border !border-stone-200 z-50 pointer-events-none"
      >
        {activePort && (
          <div className="p-4 min-w-[200px]">
            <div className="font-poppins font-bold text-sm text-primary mb-0.5 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activePort.isOrigin ? 'bg-primary' : 'bg-secondary'}`}></span>
              {activePort.name}
            </div>
            <div className="text-[11px] text-stone-500 font-semibold">
              {activePort.type || `${activePort.country} · Transit: ${activePort.transit}`}
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
      </Tooltip>
    </div>
  );
};

export default GlobalMap;

