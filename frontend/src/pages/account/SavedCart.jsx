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

  // EMPTY STATE Requirement
  if (safeItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl mx-auto space-y-12"
      >
        <div className="w-full text-center py-20 px-6 bg-white rounded-[28px] border border-stone-200/80 shadow-sm flex flex-col items-center justify-center">
          {/* Large Wishlist Illustration */}
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100/80 relative">
            <Heart className="w-12 h-12 text-[#2E7D32] fill-emerald-100/60" strokeWidth={1.75} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-ping opacity-75" />
          </div>

          {/* Title & Subtitle */}
          <h2 className="text-2xl sm:text-3xl font-poppins font-black text-stone-900 mb-2.5">
            Your Wishlist is Empty
          </h2>
          <p className="text-stone-500 font-medium text-sm sm:text-base max-w-md mb-8 leading-relaxed">
            Save products to compare specifications and request quotations later.
          </p>

          {/* Primary Action Button */}
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-8 py-3.5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white font-poppins text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <RecommendedProducts />
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
                      onClick={() => navigate(`/product/${itemId}`, { state: { scrollToRfq: true } })}
                      className="w-full py-2.5 bg-[#F0FAF0] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
