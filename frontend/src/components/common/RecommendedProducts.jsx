import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiClient, useAuth } from '../../context/AuthContext';
import { Heart, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import ImageWithFallback from './ImageWithFallback';

const RecommendedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, fetchProfile } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await apiClient.get('/products/recommended');
        let data = prodRes.data.success ? prodRes.data.data : [];
        // Fallback to general products API if recommended list is empty
        if (!data || data.length === 0) {
          const allRes = await apiClient.get('/products');
          data = allRes.data.success ? allRes.data.data : [];
        }
        setProducts(data || []);
      } catch (err) {
        console.error('Failed to fetch recommended products', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleWishlistToggle = (e, product) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleWishlist(product);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await apiClient.post('/users/cart', { productId: product._id, quantity: 1, increment: true });
      await fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-poppins font-black text-stone-900 flex items-center gap-2">
          <span className="text-[#2E7D32]">🌱</span>
          <span>Recommended Products</span>
        </h3>
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[20px] p-4 border border-stone-200 shadow-xs flex flex-col space-y-3 animate-pulse">
              <div className="h-44 bg-stone-100 rounded-[14px] w-full" />
              <div className="h-4 bg-stone-200 rounded-md w-3/4" />
              <div className="h-3 bg-stone-100 rounded-md w-1/2" />
              <div className="flex gap-2 pt-2">
                <div className="h-10 bg-stone-100 rounded-xl flex-grow" />
                <div className="w-10 h-10 bg-stone-200 rounded-xl shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State fallback if API returns 0 products */}
      {!loading && products.length === 0 && (
        <div className="w-full bg-white rounded-[20px] border border-stone-200 p-8 text-center flex flex-col items-center justify-center space-y-3">
          <Package className="w-10 h-10 text-stone-400" />
          <h4 className="text-base font-bold text-stone-800">No products available at the moment</h4>
          <p className="text-xs text-stone-500 max-w-sm">Explore our complete catalog in the marketplace to discover premium coir substrates.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-[#2E7D32] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#1B5E20] transition-all cursor-pointer"
          >
            Browse Marketplace
          </button>
        </div>
      )}

      {/* Responsive Product Cards Grid (Desktop 4 per row, Tablet 2 per row, Mobile horizontal scroll) */}
      {!loading && products.length > 0 && (
        <div className="flex lg:grid lg:grid-cols-4 sm:grid sm:grid-cols-2 gap-4 sm:gap-6 overflow-x-auto pb-4 lg:pb-0 snap-x snap-mandatory hide-scrollbar">
          {products.slice(0, 8).map((product) => {
            const isSaved = isWishlisted(product._id);
            const imageSrc = product.images?.[0] || 'https://placehold.co/400x400/eeeeee/999999?text=Cocoveera+Product';

            return (
              <motion.div
                key={product._id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/product/${product._id}`)}
                className="w-[260px] sm:w-auto shrink-0 snap-center bg-white rounded-[20px] border border-stone-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                {/* Product Image & Wishlist Button */}
                <div className="relative h-48 bg-[#F8FAF8] w-full p-4 flex items-center justify-center overflow-hidden">
                  <ImageWithFallback
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Heart Wishlist Icon */}
                  <button
                    type="button"
                    onClick={(e) => handleWishlistToggle(e, product)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-stone-200/80 flex items-center justify-center text-stone-400 hover:text-red-500 shadow-xs transition-all cursor-pointer"
                    title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-red-500' : ''}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-poppins font-extrabold text-stone-900 text-sm line-clamp-1 group-hover:text-[#2E7D32] transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs text-stone-500 font-medium line-clamp-2 mt-1 leading-relaxed">
                      {product.description || 'High quality compressed coir substrate for export cultivation.'}
                    </p>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="flex-grow py-2 px-3 bg-white border border-stone-200 hover:border-[#2E7D32] hover:bg-[#F0FAF0] text-stone-700 hover:text-[#2E7D32] text-xs font-extrabold rounded-[12px] transition-all text-center"
                    >
                      View Details
                    </button>
                    
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-9 h-9 shrink-0 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-[12px] flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </motion.div>
  );
};

export default RecommendedProducts;
