/**
 * File: frontend/src/pages/account/SavedCart.jsx
 * Purpose: React page component representing the SavedCart view.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';

const SavedCart = () => {
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await apiClient.get('/users/profile');
        if (res.data.success) {
          const fetchedWishlist = res.data.data.wishlist || [];
          setItems(fetchedWishlist.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1592424006909-5a1ff1461ff4?auto=format&fit=crop&q=80&w=200',
            addedDate: new Date().toISOString() // Or store the date in the schema if needed
          })).filter(i => i.id));
        }
      } catch (err) {
        console.error('Failed to fetch wishlist', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const removeItem = async (id) => {
    setItems(items.filter(item => item.id !== id));
    try {
      await apiClient.post('/users/wishlist', { productId: id });
      await fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const moveToCart = async (id) => {
    removeItem(id);
    try {
      await apiClient.post('/users/cart', { productId: id, quantity: 1, increment: true });
      await fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 text-center text-stone-500 font-bold">Loading saved items...</div>;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 bg-white rounded-[24px] border border-stone-200 shadow-sm">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-stone-300" />
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900 mb-2">No Saved Items</h2>
        <p className="text-stone-500 font-semibold mb-8">Items you save for later will appear here.</p>
        <button onClick={() => navigate('/dashboard')} className="px-8 py-3.5 bg-[#2E7D32] text-white font-bold rounded-xl hover:bg-[#1B5E20] transition-colors">
          Browse Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Saved For Later</h1>
        <p className="text-stone-500 font-semibold text-sm">Products you're considering for future shipments ({items.length} items).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={item.id} 
            className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col"
          >
            <div className="relative h-48 bg-stone-100 w-full overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
      </div>

    </div>
  );
};

export default SavedCart;
