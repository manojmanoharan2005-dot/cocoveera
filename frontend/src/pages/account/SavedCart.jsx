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

  // EMPTY STATE Requirement: Modern B2B E-Commerce Layout (Apple / Notion / Shopify Inspired)
  if (safeItems.length === 0) {
    const popularCategories = [
      {
        title: 'Cocopeat Blocks',
        desc: 'High quality compressed cocopeat blocks',
        icon: (
          <div className="w-12 h-12 rounded-2xl bg-[#7A4E1D]/10 flex items-center justify-center text-[#7A4E1D] group-hover:bg-[#7A4E1D] group-hover:text-white transition-colors duration-300">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            </svg>
          </div>
        ),
        category: 'Cocopeat Blocks'
      },
      {
        title: 'Grow Bags',
        desc: 'Durable grow bags for healthy cultivation',
        icon: (
          <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32] group-hover:bg-[#2E7D32] group-hover:text-white transition-colors duration-300">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.2 19.54 10.56 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
            </svg>
          </div>
        ),
        category: 'Grow Bags'
      },
      {
        title: 'Coco Cubes',
        desc: 'Buffered coco cubes for optimal growth',
        icon: (
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h6v-6zm0-8h-6v6h6V5zm-8 8H5v6h6v-6zm0-8H5v6h6V5z"/>
            </svg>
          </div>
        ),
        category: 'Coco Cubes'
      },
      {
        title: 'Coir Fibre',
        desc: 'Natural coir fibre for multiple applications',
        icon: (
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors duration-300">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
        ),
        category: 'Coir Fibre'
      }
    ];

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

        {/* Section 2: Popular Categories */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-poppins font-black text-stone-900 flex items-center gap-2">
              <span className="text-[#2E7D32]">🌱</span>
              <span>Popular Categories</span>
            </h3>
            <button 
              onClick={() => navigate('/dashboard?view=categories')}
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularCategories.map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/dashboard?category=${encodeURIComponent(cat.category)}`)}
                className="group cursor-pointer bg-white rounded-[20px] p-5 border border-stone-200 hover:border-[#2E7D32]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  {cat.icon}
                  <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 group-hover:bg-[#2E7D32] group-hover:border-[#2E7D32] group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h4 className="font-poppins font-extrabold text-stone-900 text-base group-hover:text-[#2E7D32] transition-colors">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-stone-500 font-medium mt-1 line-clamp-2">
                    {cat.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 3: Recently Viewed Products */}
        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-poppins font-black text-stone-900 flex items-center gap-2">
              <span className="text-[#7A4E1D]">👁️</span>
              <span>Recently Viewed Products</span>
            </h3>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Skeleton placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="bg-white rounded-[20px] p-4 border border-stone-200/80 shadow-xs flex flex-col space-y-3 relative group"
              >
                <div className="h-40 bg-stone-100/90 rounded-[14px] w-full animate-pulse flex items-center justify-center text-stone-300">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-stone-200 rounded-md w-3/4 animate-pulse" />
                  <div className="h-3 bg-stone-100 rounded-md w-1/2 animate-pulse" />
                </div>
                <div className="absolute top-6 right-6 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center text-stone-300">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
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
