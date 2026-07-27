/**
 * File: frontend/src/dashboards/MarketplaceHero.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React from 'react';

export const MarketplaceHero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white p-8 sm:p-10 rounded-[32px] shadow-[0_12px_40px_rgba(27,94,32,0.1)] flex flex-col justify-center min-h-[160px]">
      {/* Absolute decorative gradient glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none translate-x-20 -translate-y-20" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none translate-y-20" />

      {/* Typography Headers */}
      <div className="space-y-2 relative z-10 max-w-2xl">
        <span className="text-[#D4AF37] text-[10px] font-extrabold uppercase tracking-[0.25em] bg-white/10 py-1 px-3.5 rounded-full inline-block">
          Export Quality Standard
        </span>
        <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl leading-tight">
          Premium Coir Marketplace
        </h2>
        <p className="text-stone-200 text-xs sm:text-sm font-semibold max-w-md">
          Explore certified professional coco peat blocks, grow media slabs, and specialized horticulture inputs.
        </p>
      </div>
    </div>
  );
};

export default MarketplaceHero;
