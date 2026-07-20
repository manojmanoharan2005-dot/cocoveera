/**
 * File: frontend/src/dashboards/ProductGrid.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React from 'react';

export const ProductGrid = ({ loading, children }) => {
  // Render placeholder skeleton cards
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-8">
        {[...Array(8)].map((_, idx) => (
          <div 
            key={idx} 
            className="w-full h-[420px] bg-white rounded-[24px] border border-stone-200/60 p-5 flex flex-col justify-between animate-pulse"
          >
            {/* Image Skeleton */}
            <div className="w-full h-[200px] bg-stone-100 rounded-[20px]" />
            
            {/* Details Skeleton */}
            <div className="space-y-3 mt-4 flex-grow">
              <div className="h-2.5 bg-stone-100 rounded w-1/4" />
              <div className="h-4 bg-stone-100 rounded w-3/4" />
              <div className="h-3 bg-stone-100 rounded w-full" />
              <div className="h-3 bg-stone-100 rounded w-5/6" />
            </div>

            {/* Pricing & Buttons Skeleton */}
            <div className="space-y-3 pt-3 border-t border-stone-100/50 mt-auto">
              <div className="h-4 bg-stone-100 rounded w-1/3" />
              <div className="flex gap-2.5">
                <div className="h-10 bg-stone-100 rounded-[12px] w-1/2" />
                <div className="h-10 bg-stone-100 rounded-[12px] w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
      {children}
    </div>
  );
};

export default ProductGrid;
