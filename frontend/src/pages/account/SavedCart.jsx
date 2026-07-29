/**
 * File: frontend/src/pages/account/SavedCart.jsx
 * Purpose: React page component representing the Wishlist / Saved Products view.
 *          Robust, fault-tolerant rendering with zero customer-facing Error Boundary crashes.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Heart, Trash, ArrowRight, AlertTriangle, RefreshCw, ServerOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../../context/WishlistContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import RecommendedProducts from '../../components/common/RecommendedProducts';

const SavedCart = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, clearWishlist, loading, errorState, fetchWishlist } = useWishlist();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleRemove = (productId) => {
    try {
      if (productId) removeFromWishlist(productId);
    } catch (err) {
      console.error('Remove item error:', err);
    }
  };

  const handleConfirmClear = () => {
    try {
      clearWishlist();
    } catch (err) {
      console.error('Clear wishlist error:', err);
    } finally {
      setShowClearConfirm(false);
    }
  };

  // Safe Filter: Guarantee only valid objects or strings are processed for rendering
  const safeItems = React.useMemo(() => {
    if (!Array.isArray(wishlist)) return [];
    return wishlist.filter(item => {
      if (!item) return false;
      if (typeof item === 'string' && item.trim().length > 0) return true;
      if (typeof item === 'object') {
        const id = item._id || item.id;
        return Boolean(id);
      }
      return false;
    });
  }, [wishlist]);

  // Loading skeleton screen
  if (loading && safeItems.length === 0) {
    return (
      <div className="w-full space-y-6 animate-pulse p-4">
        <div className="h-8 bg-stone-200 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-stone-100 rounded-2xl border border-stone-200" />
          ))}
        </div>
      </div>
    );
  }

  // Network or temporary server error banner with friendly retry
  if (errorState && safeItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-12 py-10"
      >
        <div className="w-full text-center py-16 px-6 bg-white rounded-[28px] border border-stone-200/80 shadow-sm flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-5 text-amber-600 border border-amber-200/60">
            <ServerOff className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-poppins font-extrabold text-stone-900 mb-2">
            Wishlist Temporarily Unavailable
          </h2>
          <p className="text-stone-500 font-medium text-sm max-w-md mb-6">
            We couldn't connect to the server right now. Please check your internet connection and try again.
          </p>
          <button 
            onClick={() => fetchWishlist()} 
            className="px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
        <RecommendedProducts />
      </motion.div>
    );
  }

  // EMPTY STATE Requirement: Modern B2B E-Commerce Layout (Hero -> Recommended Products)
  if (safeItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full space-y-8 md:space-y-12 max-w-6xl mx-auto px-1 sm:px-4 pb-12"
      >
        {/* Top Header Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-poppins font-black text-stone-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <span>My Wishlist</span>
            </h1>
            <span className="bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-extrabold px-3 py-1 rounded-full border border-[#2E7D32]/20">
              0 Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-semibold flex items-center gap-1.5 pt-1">
            <span onClick={() => navigate('/dashboard')} className="hover:text-[#2E7D32] cursor-pointer transition-colors">Home</span>
            <span>&gt;</span>
            <span className="text-stone-800 font-bold">Wishlist</span>
          </p>
        </div>

        {/* Hero Section: 2-Column Desktop, Stacked Mobile */}
        <div className="w-full bg-gradient-to-br from-[#F4F9F4] via-[#F0FAF0] to-[#E8F5E9] rounded-[24px] sm:rounded-[32px] border border-[#2E7D32]/15 p-6 sm:p-10 md:p-12 shadow-sm overflow-hidden relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center relative z-10">
            {/* Left: 3D Illustration */}
            <div className="md:col-span-5 flex justify-center order-1 md:order-1">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-[#2E7D32]/10 rounded-full blur-2xl transform scale-90" />
                <img 
                  src="/wishlist_empty_illustration.png" 
                  alt="Empty Wishlist Export Package" 
                  className="w-full h-full object-contain relative z-10 drop-shadow-xl hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            </div>

            {/* Right: Message & Action Buttons */}
            <div className="md:col-span-7 space-y-4 sm:space-y-5 text-center md:text-left order-2 md:order-2">
              <span className="inline-block text-[#2E7D32] text-xs font-black uppercase tracking-wider bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#2E7D32]/20 shadow-xs">
                No products saved yet
              </span>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-poppins font-black text-stone-900 tracking-tight leading-tight">
                Your <span className="text-[#2E7D32]">Wishlist</span> is Empty
              </h2>

              <p className="text-stone-600 font-medium text-sm sm:text-base max-w-lg mx-auto md:mx-0 leading-relaxed">
                Save products to compare specifications, request quotations, and build your export order.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3.5 w-full">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-xs font-black uppercase tracking-wider rounded-[14px] shadow-md hover:shadow-lg hover:shadow-green-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Browse Products</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button 
                  onClick={() => navigate('/dashboard?view=categories')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-poppins text-xs font-black uppercase tracking-wider rounded-[14px] shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <svg className="w-4 h-4 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Explore Categories</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Recommended Products (Dynamically Fetched) */}
        <div className="pt-2">
          <RecommendedProducts />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-poppins font-extrabold text-stone-900 mb-1">
            My Wishlist
          </h1>
          <p className="text-stone-500 font-semibold text-xs sm:text-sm">
            Saved items for future export quotes ({safeItems.length} {safeItems.length === 1 ? 'item' : 'items'}).
          </p>
        </div>

        {safeItems.length > 0 && (
          <button 
            onClick={() => setShowClearConfirm(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-650 hover:bg-red-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer border border-red-100"
          >
            <Trash className="w-4 h-4" /> 
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {safeItems.map((item) => {
            const isString = typeof item === 'string';
            const itemId = isString ? item : (item._id || item.id || `item_${Math.random()}`);
            const itemName = isString ? 'Saved Coir Product' : (item.name || 'Saved Coir Product');
            const itemCategory = (!isString && item.category) ? item.category : 'Export Grade Substrate';
            const itemImage = isString 
              ? 'https://placehold.co/400x400/eeeeee/999999?text=Image+Not+Available' 
              : (Array.isArray(item.images) && item.images[0] ? item.images[0] : 'https://placehold.co/400x400/eeeeee/999999?text=Image+Not+Available');

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, filter: 'blur(4px)', transition: { duration: 0.25 } }}
                key={itemId} 
                className="bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col relative"
              >
                {/* Image Container */}
                <div className="relative h-48 bg-stone-50 w-full overflow-hidden flex items-center justify-center p-4">
                  <ImageWithFallback 
                    src={itemImage} 
                    alt={itemName} 
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                  />
                  <button 
                    onClick={() => handleRemove(itemId)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-white shadow-sm transition-all cursor-pointer min-w-[36px] min-h-[36px]"
                    title="Remove from Wishlist"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Details */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-poppins font-bold text-stone-900 text-sm mb-1 line-clamp-2">
                      {itemName}
                    </h3>
                    <p className="text-[#2E7D32] font-black text-[10px] uppercase tracking-wider mb-4">
                      {itemCategory}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button 
                      onClick={() => navigate(`/dashboard/request-quote?productId=${itemId}`)}
                      className="w-full py-2.5 bg-[#F0FAF0] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-[#2E7D32] hover:bg-[#E8F5E9] text-xs font-black uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Request Quote</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Clear All Confirmation Modal Requirement */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-stone-100 text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-base text-stone-900">
                Remove all items from Wishlist?
              </h3>
              <p className="text-stone-500 text-xs mt-1">
                This action will clear all products saved in your wishlist.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Remove All
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Recommended Section */}
      <div className="mt-16">
        <RecommendedProducts />
      </div>

    </div>
  );
};

export default SavedCart;
