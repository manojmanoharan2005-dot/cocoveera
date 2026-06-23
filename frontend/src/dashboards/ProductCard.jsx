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

export const ProductCard = ({
  product,
  isWishlisted,
  onWishlistToggle,
  onAddToCart,
  onBuyNow,
  onCardClick
}) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const { user } = useAuth();
  
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

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="w-full bg-white rounded-[24px] border border-stone-200/70 overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)] cursor-pointer flex flex-col relative group transition-shadow duration-300"
    >
      <div className="h-[200px] w-full overflow-hidden relative bg-stone-50 flex items-center justify-center p-2 flex-shrink-0">
        <div className="h-full aspect-square rounded-[1.5rem] overflow-hidden flex items-center justify-center">
          <ImageWithFallback
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply brightness-[1.05] contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-108"
            style={{ transform: 'scale(1)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

        {/* Category Badge */}
        <div className="absolute top-3.5 left-3.5">
          <span className="text-[10px] bg-[#1a1f24] text-white font-poppins font-bold px-3 py-1.5 rounded-[6px]">
            {product.category || 'Coir Product'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        
        {/* Title and Wishlist Row */}
        <div className="flex items-start justify-between gap-3 mb-1.5 min-w-0 w-full">
          <h3 className="font-poppins font-bold text-stone-800 text-[13px] leading-snug line-clamp-2 break-words flex-grow">
            {product.name}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWishlistToggle(product);
            }}
            className="action-btn flex-shrink-0 mt-0.5 text-stone-400 hover:text-red-500 transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
            />
          </button>
        </div>


        {/* Price Row */}
        <div className="flex items-baseline gap-2 mt-auto w-full min-w-0">
          <span className="text-base font-poppins font-black text-stone-900 truncate overflow-hidden text-ellipsis whitespace-nowrap block max-w-full">
            {priceData.formatted}
          </span>

        </div>

      </div>
    </motion.div>
  );
};

export default ProductCard;
