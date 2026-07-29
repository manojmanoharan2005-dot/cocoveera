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
        <div className="fixed inset-0 z-[120] flex items-end lg:items-center justify-center lg:justify-end">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/50 backdrop-blur-md cursor-pointer"
          />

          {/* Bottom Sheet on Mobile (<1024px) / Drawer on Desktop (>=1024px) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full lg:w-[85%] lg:max-w-md h-[80vh] lg:h-full bg-white rounded-t-[28px] lg:rounded-t-none shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Mobile Sheet Drag Indicator Pill */}
            <div className="lg:hidden w-full pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 bg-stone-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 lg:px-6 py-4 border-b border-stone-150 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <SlidersHorizontal className="w-5 h-5 text-[#2E7D32]" />
                <h3 className="font-poppins font-black text-stone-900 text-base tracking-tight">
                  Filter Catalog
                </h3>
              </div>
              <button 
                type="button"
                onClick={onClose} 
                className="p-2 text-stone-400 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-all cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Sheet Content */}
            <form onSubmit={handleApply} className="flex-grow overflow-y-auto p-5 lg:p-6 space-y-6 text-stone-900 text-xs font-semibold">
              {/* Category Collections Chips */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-[#2E7D32] uppercase tracking-wider block">
                  Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {collections.map((col) => {
                    const isSelected = selectedCollection === col;
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedCollection(col)}
                        className={`py-2.5 px-4 rounded-[12px] text-xs font-extrabold border transition-all ${
                          isSelected
                            ? 'bg-[#2E7D32] border-[#2E7D32] text-white shadow-sm'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Stock Status Selection */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-[#2E7D32] uppercase tracking-wider block">
                  Availability
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
                        className={`py-2.5 px-2 rounded-[12px] border text-center font-extrabold text-xs transition-all ${
                          isSelected
                            ? 'bg-[#2E7D32]/10 border-[#2E7D32] text-[#2E7D32]'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {status.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Quality Rating selector */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-[#2E7D32] uppercase tracking-wider block">
                  Quality Audit Rating
                </h4>
                <div className="flex flex-col space-y-2">
                  {[0, 4.8, 4.5].map((rate) => {
                    const isSelected = ratingFilter === rate;
                    return (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setRatingFilter(rate)}
                        className={`w-full flex items-center justify-between p-3 rounded-[12px] border transition-all ${
                          isSelected
                            ? 'bg-[#2E7D32]/5 border-[#2E7D32] text-[#2E7D32]'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Star className={`w-4 h-4 ${rate > 0 ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-stone-300'}`} />
                          <span className="font-extrabold">
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
            <div className="p-4 lg:p-6 border-t border-stone-200 flex gap-3 bg-white shrink-0">
              <button
                type="button"
                onClick={handleClear}
                className="w-1/3 border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold py-3.5 rounded-[14px] text-xs transition-colors shadow-xs cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                onClick={handleApply}
                className="w-2/3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-xs font-black py-3.5 rounded-[14px] transition-all shadow-md shadow-[#2E7D32]/20 cursor-pointer"
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

export default React.memo(FilterDrawer);
