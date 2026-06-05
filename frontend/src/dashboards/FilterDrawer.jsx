/**
 * File: frontend/src/dashboards/FilterDrawer.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Check, Star } from 'lucide-react';

export const FilterDrawer = ({
  isOpen,
  onClose,
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
  const [localPrice, setLocalPrice] = useState(priceRange);

  const uniqueCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const collections = ['All', ...uniqueCategories];

  const handleApply = (e) => {
    e.preventDefault();
    onApplyFilters(localPrice);
    onClose();
  };

  const handleClear = () => {
    setLocalPrice({ min: 0, max: 99999999 });
    onClearFilters();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
          />

          {/* Drawer Panel Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-[85%] max-w-md bg-white h-full shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col z-10"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-150 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <SlidersHorizontal className="w-4.5 h-4.5 text-[#2E7D32]" />
                <h3 className="font-poppins font-extrabold text-stone-900 text-sm tracking-wide">
                  Filter Catalog
                </h3>
              </div>
              <button 
                onClick={onClose} 
                className="p-1.5 text-stone-400 hover:text-stone-950 hover:bg-stone-50 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters Content Area */}
            <form onSubmit={handleApply} className="flex-grow overflow-y-auto p-6 space-y-6 text-stone-900 text-xs font-semibold">
              {/* Category Collections */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">
                  Collections / Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {collections.map((col) => {
                    const isSelected = selectedCollection === col;
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedCollection(col)}
                        className={`py-2 px-3.5 rounded-[12px] text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-[#2E7D32] border-[#2E7D32] text-white shadow-sm'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-[#F7F9F7]'
                        }`}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Price Range Fields */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">
                  Price Range (INR / metric ton)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] text-[#6B7280] font-bold block mb-1">Min Price</label>
                    <input
                      type="number"
                      value={localPrice.min}
                      onChange={(e) => setLocalPrice({ ...localPrice, min: Number(e.target.value) })}
                      className="w-full bg-[#F7F9F7] border border-stone-200 rounded-[12px] py-2 px-3 focus:outline-none focus:border-[#2E7D32] font-semibold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-[#6B7280] font-bold block mb-1">Max Price</label>
                    <input
                      type="number"
                      value={localPrice.max}
                      onChange={(e) => setLocalPrice({ ...localPrice, max: Number(e.target.value) })}
                      className="w-full bg-[#F7F9F7] border border-stone-200 rounded-[12px] py-2 px-3 focus:outline-none focus:border-[#2E7D32] font-semibold text-xs"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Stock Status Selection */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">
                  Stock Availability
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'All Items' },
                    { id: 'in_stock', label: 'In Stock' },
                    { id: 'out_of_stock', label: 'Out of Stock' }
                  ].map((status) => {
                    const isSelected = stockStatus === status.id;
                    return (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => setStockStatus(status.id)}
                        className={`py-2 px-2.5 rounded-[12px] border text-center font-bold text-xs transition-all ${
                          isSelected
                            ? 'bg-[#2E7D32]/10 border-[#2E7D32] text-[#2E7D32]'
                            : 'bg-white border-stone-200 text-stone-500 hover:bg-[#F7F9F7]'
                        }`}
                      >
                        {status.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Quality Rating stars selector */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">
                  Quality Audit Rating
                </h4>
                <div className="flex flex-col space-y-1.5">
                  {[0, 4.8, 4.5].map((rate) => {
                    const isSelected = ratingFilter === rate;
                    return (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setRatingFilter(rate)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-[12px] border transition-all ${
                          isSelected
                            ? 'bg-[#2E7D32]/5 border-[#2E7D32] text-[#2E7D32]'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-[#F7F9F7]'
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          <Star className={`w-3.5 h-3.5 ${rate > 0 ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-stone-300'}`} />
                          <span className="font-bold">
                            {rate === 0 ? 'All Ratings' : `${rate} Stars & Up`}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#2E7D32]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>

            {/* Bottom Actions Sticky bar */}
            <div className="p-6 border-t border-stone-150 flex gap-4 bg-stone-50">
              <button
                type="button"
                onClick={handleClear}
                className="w-1/3 border border-stone-200 hover:bg-white text-stone-600 font-bold py-3.5 rounded-[16px] text-xs transition-colors shadow-sm"
              >
                Clear All
              </button>
              <button
                onClick={handleApply}
                className="w-2/3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-xs font-bold py-3.5 rounded-[16px] transition-all shadow-md shadow-[#2E7D32]/10"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FilterDrawer;
