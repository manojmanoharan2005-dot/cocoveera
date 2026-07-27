/**
 * File: frontend/src/components/3d/ContainerViewer3D.jsx
 * Purpose: Minimal, elegant live 3D container preview card for Product Details page.
 * Uses lightweight auto-rotating Three.js canvas with IntersectionObserver viewport pausing.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import containerPreviewImg from '../../assets/container_preview.png';
import { Maximize2, Package } from 'lucide-react';
import ContainerMini3DCanvas from './ContainerMini3DCanvas';

export const ContainerViewer3D = React.memo(({ containerType = '40HC', totalQuantity = 1, product, palletItems = [] }) => {
  const navigate = useNavigate();

  const palletsPerContainer = containerType === '20FT' ? 10 : 22;
  const isFullContainer = totalQuantity >= 1;
  const totalPallets = isFullContainer ? palletsPerContainer : Math.max(1, Math.round(totalQuantity * palletsPerContainer));
  const usagePct = totalQuantity === 0 ? 0 : (isFullContainer ? 100 : Math.round(totalQuantity * 100));

  const activeProduct = product || palletItems?.[0]?.product;
  const productSlug = activeProduct?.slug || activeProduct?._id || 'cocopeat-block';

  const handleOpen3D = (e) => {
    e.stopPropagation();
    const activeConfig = {
      containerType,
      totalQuantity,
      palletItems,
      product: activeProduct
    };
    try {
      sessionStorage.setItem('cocoveera_active_config', JSON.stringify(activeConfig));
    } catch (err) {}

    navigate(`/container-preview/${productSlug}`, { state: activeConfig });
  };

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

        {/* SINGLE PRIMARY VIEW 3D BUTTON */}
        <button 
          onClick={handleOpen3D}
          className="px-3.5 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-black font-poppins flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
          title="Open Fullscreen 3D Logistics Engine"
        >
          <span>View 3D</span>
          <Maximize2 className="w-3.5 h-3.5 text-emerald-300" />
        </button>
      </div>

      {/* LIGHTWEIGHT LIVE 3D PREVIEW BOX (OCCUPIES 90% AREA WITH PROPER PADDING) */}
      <div 
        onClick={handleOpen3D}
        className="w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-[#FAFAFA] via-[#F2F4F2] to-[#E5E8E5] border border-stone-200/60 flex items-center justify-center p-2 relative group cursor-pointer overflow-hidden shadow-inner"
      >
        <ContainerMini3DCanvas 
          containerType={containerType} 
          product={activeProduct} 
          totalQuantity={totalQuantity} 
          palletItems={palletItems} 
        />

        {/* Hover Action Badge */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-stone-900/80 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold font-poppins border border-stone-700/60 shadow-lg flex items-center gap-2 opacity-90 group-hover:opacity-100 group-hover:bg-[#2E7D32] transition-all z-10">
          <Package className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
          <span>Click for Fullscreen 3D Stacking</span>
        </div>
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
