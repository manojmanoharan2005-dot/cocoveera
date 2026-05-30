import React, { useState } from 'react';
import { motion } from 'framer-motion';

const GlobalMap = () => {
  const [activePort, setActivePort] = useState(null);

  const ports = [
    { id: 'origin', name: 'Cocoveera Cochin Port (India)', x: 620, y: 260, isOrigin: true, type: 'Manufacturing HQ & Port' },
    { id: 'nl', name: 'Rotterdam Port (Netherlands)', x: 490, y: 145, country: 'Europe', transit: '18 Days', volume: 'High' },
    { id: 'la', name: 'Port of Los Angeles (USA)', x: 210, y: 170, country: 'North America', transit: '24 Days', volume: 'Very High' },
    { id: 'jp', name: 'Port of Tokyo (Japan)', x: 780, y: 180, country: 'East Asia', transit: '12 Days', volume: 'Medium' },
    { id: 'au', name: 'Port of Melbourne (Australia)', x: 790, y: 350, country: 'Oceania', transit: '14 Days', volume: 'High' },
    { id: 'za', name: 'Port of Durban (South Africa)', x: 530, y: 320, country: 'Africa', transit: '16 Days', volume: 'Medium' },
  ];

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

      {/* SVG Map Canvas */}
      <div className="relative w-full overflow-x-auto select-none">
        <div className="min-w-[800px] aspect-[800/400] relative">
          <svg
            viewBox="0 0 900 450"
            className="w-full h-full text-stone-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            {/* Soft grid lines */}
            <g strokeDasharray="3 6" stroke="rgba(47,125,50,0.06)">
              <line x1="0" y1="75" x2="900" y2="75" />
              <line x1="0" y1="150" x2="900" y2="150" />
              <line x1="0" y1="225" x2="900" y2="225" />
              <line x1="0" y1="300" x2="900" y2="300" />
              <line x1="0" y1="375" x2="900" y2="375" />
              
              <line x1="150" y1="0" x2="150" y2="450" />
              <line x1="300" y1="0" x2="300" y2="450" />
              <line x1="450" y1="0" x2="450" y2="450" />
              <line x1="600" y1="0" x2="600" y2="450" />
              <line x1="750" y1="0" x2="750" y2="450" />
            </g>

            {/* Continent shapes in light grey/green */}
            <g fill="rgba(47, 125, 50, 0.03)" stroke="rgba(47, 125, 50, 0.08)" strokeWidth="0.8">
              {/* North America */}
              <path d="M 80,80 L 260,90 L 270,160 L 200,210 L 160,250 L 130,220 Z" />
              {/* South America */}
              <path d="M 230,260 L 290,290 L 310,380 L 260,420 L 240,320 Z" />
              {/* Europe & Africa */}
              <path d="M 400,100 L 530,90 L 550,160 L 580,240 L 580,350 L 510,380 L 480,260 L 420,200 Z" />
              {/* Asia */}
              <path d="M 530,100 L 800,100 L 820,220 L 720,280 L 680,260 L 590,200 Z" />
              {/* Australia */}
              <path d="M 740,320 L 820,330 L 810,390 L 730,370 Z" />
            </g>

            {/* Flow Paths (Animate dash-offset for moving effect) */}
            {ports.filter(p => !p.isOrigin).map((port) => (
              <g key={`path-${port.id}`}>
                {/* Static base line */}
                <path
                  d={`M 620 260 Q ${(620 + port.x) / 2} ${(260 + port.y) / 2 - 50} ${port.x} ${port.y}`}
                  stroke="rgba(162, 107, 61, 0.15)"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Animated dash line */}
                <path
                  d={`M 620 260 Q ${(620 + port.x) / 2} ${(260 + port.y) / 2 - 50} ${port.x} ${port.y}`}
                  stroke="#2F7D32"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  fill="none"
                  className="animate-pulse-subtle"
                />
              </g>
            ))}

            {/* Glow / Hub Indicators */}
            {ports.map((port) => (
              <g
                key={port.id}
                className="cursor-pointer"
                onMouseEnter={() => setActivePort(port)}
                onMouseLeave={() => setActivePort(null)}
              >
                {/* Ping rings */}
                {port.isOrigin ? (
                  <>
                    <circle cx={port.x} cy={port.y} r="10" fill="rgba(47, 125, 50, 0.2)" />
                    <circle cx={port.x} cy={port.y} r="18" fill="none" stroke="#2F7D32" strokeWidth="1" className="animate-ping" />
                  </>
                ) : (
                  <>
                    <circle cx={port.x} cy={port.y} r="8" fill="rgba(162, 107, 61, 0.2)" />
                    <circle cx={port.x} cy={port.y} r="14" fill="none" stroke="#A26B3D" strokeWidth="1" className="animate-pulse" />
                  </>
                )}
                {/* Core dot */}
                <circle
                  cx={port.x}
                  cy={port.y}
                  r="5"
                  fill={port.isOrigin ? '#2F7D32' : '#A26B3D'}
                  stroke="#fff"
                  strokeWidth="1.5"
                />
              </g>
            ))}
          </svg>

          {/* Active port popover card absolute overlay */}
          {activePort && (
            <div
              className="absolute bg-white text-stone-900 border border-stone-200 rounded-xl p-4 shadow-lg z-30 transition-opacity duration-300 pointer-events-none"
              style={{
                left: `${(activePort.x / 900) * 100}%`,
                top: `${(activePort.y / 450) * 100 - 20}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="font-poppins font-bold text-xs text-primary mb-0.5">
                {activePort.name}
              </div>
              <div className="text-[10px] text-stone-500 font-semibold">
                {activePort.isOrigin ? (
                  <span>{activePort.type}</span>
                ) : (
                  <div className="space-y-0.5">
                    <div>Continent: {activePort.country}</div>
                    <div>Est. Transit: {activePort.transit}</div>
                    <div>Demand: {activePort.volume}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 border-t border-stone-100 pt-8 text-center">
        <div>
          <div className="text-xl font-poppins font-extrabold text-primary">60+ Countries</div>
          <div className="text-[10px] text-stone-400 font-bold uppercase mt-1">Export Destination Reach</div>
        </div>
        <div>
          <div className="text-xl font-poppins font-extrabold text-primary">4 Ports</div>
          <div className="text-[10px] text-stone-400 font-bold uppercase mt-1">Primary Shipping Hubs</div>
        </div>
        <div>
          <div className="text-xl font-poppins font-extrabold text-primary">100% Traceable</div>
          <div className="text-[10px] text-stone-400 font-bold uppercase mt-1">Export Batch Tracking</div>
        </div>
        <div>
          <div className="text-xl font-poppins font-extrabold text-primary">24/7 Logistics</div>
          <div className="text-[10px] text-stone-400 font-bold uppercase mt-1">Clearance Support</div>
        </div>
      </div>
    </div>
  );
};

export default GlobalMap;
