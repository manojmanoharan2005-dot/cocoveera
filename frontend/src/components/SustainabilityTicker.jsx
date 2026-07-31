/**
 * File: frontend/src/components/SustainabilityTicker.jsx
 * Purpose: Reusable sustainability announcement marquee strip placed directly below Navbar.
 */
import React from 'react';

const SustainabilityTicker = () => {
  const message = "Every New Registration Plants 50 Seed Balls for a Greener Tomorrow.";
  const items = Array(4).fill(message);

  const renderGroup = (keyPrefix) => (
    <div className="flex items-center shrink-0">
      {items.map((text, idx) => (
        <div key={`${keyPrefix}-${idx}`} className="flex items-center whitespace-nowrap shrink-0" style={{ gap: '90px', paddingRight: '90px' }}>
          <span className="inline-flex items-center text-[#2E7D32] font-medium text-[13px] whitespace-nowrap">
            <span className="mr-2 inline-block">🌱</span>
            {text}
          </span>
          <span className="text-[#BDBDBD] font-normal select-none" aria-hidden="true">|</span>
        </div>
      ))}
    </div>
  );

  return (
    <div 
      className="w-full bg-[#FFFFFF] border-t border-b border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.02)] h-[34px] flex items-center overflow-hidden select-none pointer-events-auto z-40 relative"
      aria-label="Sustainability Announcement Ticker"
    >
      <div className="flex w-max animate-marquee-track will-change-transform">
        {renderGroup('group-1')}
        {renderGroup('group-2')}
      </div>
    </div>
  );
};

export default SustainabilityTicker;

