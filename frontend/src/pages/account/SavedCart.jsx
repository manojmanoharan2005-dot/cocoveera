/**
 * File: frontend/src/pages/account/SavedCart.jsx
 * Purpose: React page component representing the SavedCart view.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Heart, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import RecommendedProducts from '../../components/common/RecommendedProducts';

const SavedCart = () => {
  const navigate = useNavigate();
  const { user, fetchProfile, toggleWishlist, clearWishlist } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync with global user wishlist state
  useEffect(() => {
    if (user && user.wishlist) {
      const mappedItems = user.wishlist.map(p => {
        // Handle case where p might be just a string ID
        const isString = typeof p === 'string';
        return {
          id: isString ? p : (p._id || p.id),
          name: isString ? 'Saved Product' : (p.name || 'Saved Product'),
          price: isString ? 0 : (p.price || 0),
          image: isString ? 'https://placehold.co/400x400/eeeeee/999999?text=Image+Not+Available' : (p.images?.[0] || 'https://placehold.co/400x400/eeeeee/999999?text=Image+Not+Available'),
          addedDate: new Date().toISOString()
        };
      }).filter(i => i.id);
      setItems(mappedItems);
      setLoading(false);
    } else if (user) {
      // User is loaded but no wishlist data is present yet
      const fetchWishlist = async () => {
        try {
          const res = await apiClient.get('/users/profile');
          if (res.data.success) {
            const fetchedWishlist = res.data.data.wishlist || [];
            const mappedItems = fetchedWishlist.map(p => {
              const isString = typeof p === 'string';
              return {
                id: isString ? p : (p._id || p.id),
                name: isString ? 'Saved Product' : (p.name || 'Saved Product'),
                price: isString ? 0 : (p.price || 0),
                image: isString ? 'https://placehold.co/400x400/eeeeee/999999?text=Image+Not+Available' : (p.images?.[0] || 'https://placehold.co/400x400/eeeeee/999999?text=Image+Not+Available'),
                addedDate: new Date().toISOString()
              };
            }).filter(i => i.id);
            setItems(mappedItems);
          }
        } catch (err) {
          console.error('Failed to fetch wishlist', err);
        } finally {
          setLoading(false);
        }
      };
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const removeItem = async (id) => {
    toggleWishlist(id);
  };

  const clearAll = async () => {
    const currentIds = items.map(i => i.id);
    clearWishlist(currentIds);
  };

  const moveToCart = async (id) => {
    toggleWishlist(id); // Optimistically remove from wishlist
    try {
      // Add to cart
      await apiClient.post('/users/cart', { productId: id, quantity: 1, increment: true });
      fetchProfile(); // Sync cart in background
    } catch (err) {
      console.error(err);
      fetchProfile();
    }
  };

  if (loading) return <div className="p-12 text-center text-stone-500 font-bold">Loading saved items...</div>;

  if (items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="w-full text-center py-24 bg-white rounded-[24px] border border-stone-200 shadow-sm">
          <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-stone-100">
            <Heart className="w-10 h-10 text-[#2E7D32] fill-stone-50" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 mb-2">No Saved Items</h2>
          <p className="text-stone-500 font-semibold mb-8">Items you save for later will appear here.</p>
          <button onClick={() => navigate('/dashboard')} className="px-8 py-3.5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all hover:-translate-y-0.5">
            Browse Marketplace
          </button>
        </div>

        <RecommendedProducts />
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-6">
      
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Saved For Later</h1>
          <p className="text-stone-500 font-semibold text-sm">Products you're considering for future shipments ({items.length} items).</p>
        </div>
        {items.length > 1 && (
          <button 
            onClick={clearAll} 
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            <Trash className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              layout
              key={item.id} 
              className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col"
            >
              <div className="relative h-48 bg-stone-100 w-full overflow-hidden flex items-center justify-center p-4">
                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-white shadow-sm transition-all"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="font-extrabold text-stone-900 text-base mb-1 line-clamp-2">{item.name}</h3>
                <p className="text-[#2E7D32] font-black text-lg mb-4">{convertCurrency(item.price, user?.currency).formatted} <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">/ Pallet</span></p>
                
                <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-bold">Added {new Date(item.addedDate).toLocaleDateString()}</span>
                  <button 
                    onClick={() => moveToCart(item.id)}
                    className="px-4 py-2 bg-[#F0FAF0] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-16">
        <RecommendedProducts />
      </div>

    </div>
  );
};

export default SavedCart;
