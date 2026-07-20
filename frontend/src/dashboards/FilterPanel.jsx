/**
 * File: frontend/src/dashboards/FilterPanel.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React, { useState } from 'react';
import { Star, RefreshCw } from 'lucide-react';

export const FilterPanel = ({ 
  selectedCollection, 
  setSelectedCollection, 
  priceRange, 
  setPriceRange, 
  stockStatus, 
  setStockStatus, 
  ratingFilter, 
  setRatingFilter,
  onApplyFilters,
  onClearFilters,
  products = []
}) => {
  const dynamicCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const defaultCategories = [
    'Coir Pith Blocks',
    'Grow Bags',
    'Coir Discs',
    'Erosion Control',
    'Other Coir Products',
    'Hobby Gardening',
    'Custom Solutions'
  ];
  const uniqueCategories = dynamicCategories.length > 0 ? dynamicCategories : defaultCategories;
  const collections = ['All', ...uniqueCategories];

  // Temporary local states to avoid instant refilter lag on price typing
  const [minPrice, setMinPrice] = useState(priceRange.min);
  const [maxPrice, setMaxPrice] = useState(priceRange.max);

  const handleApply = (e) => {
    e.preventDefault();
    onApplyFilters({
      min: Number(minPrice) || 0,
      max: Number(maxPrice) || 5000
    });
  };

  const handleClear = () => {
    setMinPrice(0);
    setMaxPrice(5000);
    onClearFilters();
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-6 shadow-sm h-fit">
      {/* 1. Collections Filter */}
      <div>
        <h4 className="text-[10px] font-bold text-stone-900 uppercase tracking-wider mb-2.5">
          Collections
        </h4>
        <div className="flex flex-col space-y-1">
          {collections.map((col) => (
            <button
              key={col}
              type="button"
              onClick={() => setSelectedCollection(col)}
              className={`text-left text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                selectedCollection === col
                  ? 'bg-[#2E7D32]/10 text-[#2E7D32] font-bold'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>



      <hr className="border-stone-100" />

      {/* 3. Stock Availability Filter */}
      <div>
        <h4 className="text-[10px] font-bold text-stone-900 uppercase tracking-wider mb-2.5">
          Stock Status
        </h4>
        <div className="flex flex-col space-y-2 text-xs font-semibold text-stone-600">
          {[
            { value: 'all', label: 'All Stock' },
            { value: 'in_stock', label: 'In Stock' },
            { value: 'out_of_stock', label: 'Out of Stock' }
          ].map((st) => (
            <label key={st.value} className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="radio"
                name="stockStatus"
                checked={stockStatus === st.value}
                onChange={() => setStockStatus(st.value)}
                className="w-3.5 h-3.5 text-[#2E7D32] focus:ring-0 cursor-pointer accent-[#2E7D32]"
              />
              <span>{st.label}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-stone-100" />

      {/* 4. Rating Filter */}
      <div>
        <h4 className="text-[10px] font-bold text-stone-900 uppercase tracking-wider mb-2.5">
          Rating
        </h4>
        <div className="flex flex-col space-y-1.5 text-xs font-semibold">
          {[5, 4, 3, 2].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => setRatingFilter(stars)}
              className={`flex items-center space-x-2 py-1 px-2.5 rounded-lg text-left transition-colors ${
                ratingFilter === stars
                  ? 'bg-stone-50 text-[#2E7D32]'
                  : 'text-stone-600 hover:bg-stone-50/50'
              }`}
            >
              <div className="flex text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < stars ? 'fill-[#D4AF37]' : 'text-stone-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#6B7280]">{stars === 5 ? 'Only' : '& Up'}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setRatingFilter(0)}
            className={`text-xs py-1 px-2.5 rounded-lg text-left transition-colors ${
              ratingFilter === 0
                ? 'bg-stone-50 text-stone-850'
                : 'text-stone-500 hover:bg-stone-50/50'
            }`}
          >
            Show All Ratings
          </button>
        </div>
      </div>

      <hr className="border-stone-100" />

      {/* Clear Button */}
      <button
        onClick={handleClear}
        className="w-full border border-stone-250 hover:bg-stone-50 text-stone-600 font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Clear All Filters</span>
      </button>
    </div>
  );
};

export default FilterPanel;
