/**
 * File: frontend/src/components/3d/ContainerViewer3D.jsx
 * Purpose: Minimal, elegant live 3D container preview card for Product Details page.
 * Uses lightweight auto-rotating Three.js canvas with IntersectionObserver viewport pausing.
 */
import React from 'react';
import ContainerMini3DCanvas from './ContainerMini3DCanvas';

export const ContainerViewer3D = React.memo(({ containerType = '40HC', totalQuantity = 1, product, palletItems = [] }) => {
  const palletsPerContainer = containerType === '20FT' ? 10 : 22;
  const isFullContainer = totalQuantity >= 1;
  const totalPallets = isFullContainer ? palletsPerContainer : Math.max(1, Math.round(totalQuantity * palletsPerContainer));
  const usagePct = totalQuantity === 0 ? 0 : (isFullContainer ? 100 : Math.round(totalQuantity * 100));

  const activeProduct = product || palletItems?.[0]?.product;

  return (
    <div className="w-full bg-white rounded-[24px] border border-stone-200/80 shadow-md overflow-hidden flex flex-col relative space-y-3 p-4 sm:p-5">
      
      {/* SINGLE CLEAN CARD HEADER */}
      <div className="flex justify-between items-center border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="font-poppins font-black text-xs sm:text-sm text-stone-900 uppercase tracking-wider leading-tight">
              Live Cargo Visualizer
            </h3>
            <span className="text-[10px] font-bold text-stone-400 block mt-0.5">
              {containerType} High Cube • {usagePct}% Capacity Filled
            </span>
          </div>
        </div>
      </div>

      {/* LIGHTWEIGHT LIVE 3D PREVIEW BOX (OCCUPIES 90% AREA WITH PROPER PADDING) */}
      <div 
        className="w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-[#FAFAFA] via-[#F2F4F2] to-[#E5E8E5] border border-stone-200/60 flex items-center justify-center p-2 relative overflow-hidden shadow-inner"
      >
        {/* 3D Model View (Disabled - change to true or uncomment to re-enable 3D rendering) */}
        {false ? (
          <ContainerMini3DCanvas 
            containerType={containerType} 
            product={activeProduct} 
            totalQuantity={totalQuantity} 
            palletItems={palletItems} 
          />
        ) : (
          <img 
            src="/container-configurations.jpg" 
            alt="Container Configurations" 
            className="w-full h-full object-contain"
            loading="lazy"
          />
        )}
      </div>

      {/* METRICS SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
        <div className="p-2 bg-stone-50 rounded-xl border border-stone-200/70">
          <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">Container Fill</span>
          <span className="text-xs font-black text-stone-900 font-poppins">{usagePct}%</span>
        </div>
        <div className="p-2 bg-stone-50 rounded-xl border border-stone-200/70">
          <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">Pallet Units</span>
          <span className="text-xs font-black text-[#2E7D32] font-poppins">{totalPallets}</span>
        </div>
        <div className="p-2 bg-stone-50 rounded-xl border border-stone-200/70">
          <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">Container Type</span>
          <span className="text-xs font-black text-stone-900 font-poppins">{containerType}</span>
        </div>
        <div className="p-2 bg-stone-50 rounded-xl border border-stone-200/70">
          <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">Status</span>
          <span className="text-xs font-black text-emerald-700 font-poppins">Ready</span>
        </div>
      </div>

    </div>
  );
});

export default ContainerViewer3D;
