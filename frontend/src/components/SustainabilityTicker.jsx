/**
 * File: frontend/src/components/SustainabilityTicker.jsx
 * Purpose: Reusable sustainability announcement marquee strip placed directly below Navbar.
 */
import React from 'react';

const SustainabilityTicker = () => {
  const message = "Every New Registration Plants 50 Seed Balls for a Greener Tomorrow.";
  const items = Array(4).fill(message);

  return (
    <div 
      className="w-full bg-[#FFFFFF] border-t border-b border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.02)] h-[36px] sm:h-[38px] flex items-center overflow-hidden select-none pointer-events-auto z-40 relative"
      aria-label="Sustainability Announcement Ticker"
    >
      <div className="w-full overflow-hidden flex items-center">
        <div className="flex shrink-0 whitespace-nowrap animate-marquee md:hover:[animation-play-state:paused] will-change-transform">
          {items.map((text, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-[#2E7D32] font-medium text-[11px] sm:text-[12px] md:text-[13px] tracking-normal px-12 sm:px-16 md:px-20"
            >
              <span className="mr-2 text-xs sm:text-sm inline-block">🌱</span>
              {text}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 whitespace-nowrap animate-marquee md:hover:[animation-play-state:paused] will-change-transform" aria-hidden="true">
          {items.map((text, idx) => (
            <span
              key={`dup-${idx}`}
              className="inline-flex items-center text-[#2E7D32] font-medium text-[11px] sm:text-[12px] md:text-[13px] tracking-normal px-12 sm:px-16 md:px-20"
            >
              <span className="mr-2 text-xs sm:text-sm inline-block">🌱</span>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SustainabilityTicker;
