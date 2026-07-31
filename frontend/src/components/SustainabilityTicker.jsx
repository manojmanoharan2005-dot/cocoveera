/**
 * File: frontend/src/components/SustainabilityTicker.jsx
 * Purpose: Reusable sustainability announcement marquee strip placed directly below Navbar.
 */
import React from 'react';

const SustainabilityTicker = () => {
  const message = "🌱 Every New Registration Plants 50 Seed Balls for a Greener Tomorrow.";
  // Repeat array to ensure seamless infinite looping without gaps on high-res ultra-wide screens
  const items = Array(6).fill(message);

  return (
    <div 
      className="w-full bg-[#FFFFFF] border-t border-b border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.02)] h-11 sm:h-12 flex items-center overflow-hidden select-none pointer-events-auto z-40 relative"
      aria-label="Sustainability Announcement Ticker"
    >
      <div className="w-full overflow-hidden flex items-center">
        <div className="flex whitespace-nowrap animate-marquee md:hover:[animation-play-state:paused] will-change-transform">
          {items.map((text, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-[#2E7D32] font-semibold text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] tracking-tight px-6 sm:px-10"
            >
              {text}
            </span>
          ))}
        </div>
        <div className="flex whitespace-nowrap animate-marquee md:hover:[animation-play-state:paused] will-change-transform" aria-hidden="true">
          {items.map((text, idx) => (
            <span
              key={`dup-${idx}`}
              className="inline-flex items-center text-[#2E7D32] font-semibold text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] tracking-tight px-6 sm:px-10"
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SustainabilityTicker;
