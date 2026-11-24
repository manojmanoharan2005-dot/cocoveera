/**
 * File: frontend/src/dashboards/ProductGrid.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React from 'react';

export const ProductGrid = ({ loading, children }) => {
  // Render placeholder skeleton cards
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4 md:gap-5">
        {[...Array(8)].map((_, idx) => (
          <div 
            key={idx} 
            className="w-full h-[270px] xs:h-[300px] sm:h-[400px] bg-white rounded-2xl sm:rounded-[24px] border border-stone-200/60 p-2.5 xs:p-3 sm:p-5 flex flex-col justify-between animate-pulse"
          >
            {/* Image Skeleton */}
            <div className="w-full h-[120px] xs:h-[140px] sm:h-[200px] bg-stone-100 rounded-xl sm:rounded-[20px]" />
            
            {/* Details Skeleton */}
            <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4 flex-grow">
              <div className="h-2 sm:h-2.5 bg-stone-100 rounded w-1/3" />
              <div className="h-3 sm:h-4 bg-stone-100 rounded w-3/4" />
              <div className="h-2.5 sm:h-3 bg-stone-100 rounded w-full hidden sm:block" />
            </div>

            {/* Pricing & Buttons Skeleton */}
            <div className="space-y-2 pt-2 sm:pt-3 border-t border-stone-100/50 mt-auto">
              <div className="h-7 sm:h-10 bg-stone-100 rounded-lg sm:rounded-[12px] w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4 md:gap-5">
      {children}
    </div>
  );
};

export default ProductGrid;
