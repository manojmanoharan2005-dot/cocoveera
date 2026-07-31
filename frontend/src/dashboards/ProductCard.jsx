/**
 * File: frontend/src/dashboards/ProductCard.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { convertCurrency } from '../utils/currencyConverter';
import ImageWithFallback from '../components/common/ImageWithFallback';

import { useWishlist } from '../context/WishlistContext';

export const ProductCard = React.memo(({
  product,
  isWishlisted: propIsWishlisted,
  onWishlistToggle,
  onAddToCart,
  onBuyNow,
  onCardClick,
  hideWishlist
}) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { isWishlisted: contextIsWishlisted, toggleWishlist } = useWishlist();

  const isWishlisted = contextIsWishlisted(product);
  
  // Base price is assuming INR from DB (modify if DB stores differently)
  const basePrice = product.price || 0;
  const priceData = convertCurrency(basePrice, user?.currency || 'INR');

  const oldPrice = basePrice ? Math.round(basePrice * 1.25) : 450;
  const oldPriceData = convertCurrency(oldPrice, user?.currency || 'INR');
  const discount = 20;
  const rating = product.specifications?.ph ? 4.8 : 4.5;
  const reviewCount = product.specifications?.ec ? 18 : 12;

  const handleCardClick = (e) => {
    if (e.target.closest('.action-btn')) return;
    onCardClick(product);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(e);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product);
    } else {
      toggleWishlist(product);
    }
  };

  return (
    <motion.div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="w-full bg-white rounded-[24px] border border-stone-200/70 overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)] cursor-pointer flex flex-col relative group transition-shadow duration-300"
    >
      <div className="h-[220px] sm:h-[250px] w-full relative bg-white flex items-center justify-center p-5 sm:p-6 flex-shrink-0 overflow-hidden border-b border-stone-100">
        <div className="w-full h-full flex items-center justify-center relative">
          <ImageWithFallback
            src={product.images?.[0]}
            alt={product.name}
            className="max-w-full max-h-full w-auto h-auto object-contain object-center transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </div>

        {/* Category Badge */}
        {product.category && (
          <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-10">
            <span className="text-[9px] sm:text-[10px] bg-stone-900/80 backdrop-blur-xs text-white font-poppins font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              {product.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow bg-white">
        
        {/* Title and Wishlist Row */}
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1.5 min-w-0 w-full">
          <h3 className="font-poppins font-bold text-stone-800 text-[12px] sm:text-[13px] leading-snug line-clamp-2 break-words flex-grow">
            {product.name}
          </h3>
          {isAuthenticated && !hideWishlist && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleWishlistClick}
              className="action-btn flex-shrink-0 -mt-1 -mr-1 p-1.5 text-stone-400 hover:text-red-500 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full"
              aria-label="Wishlist"
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : ''}`}
              />
            </motion.button>
          )}
        </div>

        {/* Bottom Row */}
        <div className="flex items-baseline gap-2 mt-auto w-full min-w-0 pt-1">
          <div className="w-full bg-[#F7F9F7] text-[#2E7D32] group-hover:bg-[#E8F3E8] border border-[#2E7D32]/20 font-bold text-[11px] py-2 sm:py-2.5 min-h-[40px] rounded-[10px] transition-colors flex items-center justify-center gap-1">
            {isAuthenticated ? (
              <>
                Request Quote <ArrowRight className="w-3 h-3" />
              </>
            ) : (
              <>
                View Catalogue <ArrowRight className="w-3 h-3" />
              </>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
});

export default ProductCard;
