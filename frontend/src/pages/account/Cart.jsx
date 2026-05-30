import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Heart, ArrowRight, Package, ArrowLeft, AlertCircle } from 'lucide-react';
import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';

const Cart = () => {
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [containerType, setContainerType] = useState('40FT');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await apiClient.get('/users/profile');
        if (res.data.success) {
          const fetchedCart = res.data.data.cart || [];
          setCartItems(fetchedCart.map(c => ({
            id: c.product?._id || 'unknown',
            name: c.product?.name || 'Unknown Product',
            price: c.product?.price || 0,
            quantity: c.quantity,
            palletsPerUnit: 1, // Currently 1 unit = 1 pallet in B2B context
            image: c.product?.images?.[0] || 'https://images.unsplash.com/photo-1592424006909-5a1ff1461ff4?auto=format&fit=crop&q=80&w=200'
          })).filter(i => i.id !== 'unknown'));
        }
      } catch (err) {
        console.error('Failed to fetch cart', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Capacity config
  const CONTAINER_CAPACITY = {
    '20FT': 10,
    '40FT': 22
  };

  const currentCapacity = CONTAINER_CAPACITY[containerType];
  const usedPallets = cartItems.reduce((acc, item) => acc + (item.quantity * item.palletsPerUnit), 0);
  const capacityPercentage = Math.min((usedPallets / currentCapacity) * 100, 100);
  const isOverCapacity = usedPallets > currentCapacity;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;
    setCartItems(items => items.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    try {
      await apiClient.post('/users/cart', { productId: id, quantity: newQty });
      await fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id) => {
    setCartItems(items => items.filter(i => i.id !== id));
    try {
      await apiClient.post('/users/cart', { productId: id, quantity: 0 });
      await fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      setCartItems([]);
      try {
        await apiClient.delete('/users/cart');
        await fetchProfile();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div className="p-12 text-center text-stone-500 font-bold">Loading your container...</div>;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 bg-white rounded-[24px] border border-stone-200 shadow-sm">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-stone-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900 mb-2">Your Container is Empty</h2>
        <p className="text-stone-500 font-semibold mb-8">Start adding products to build your export shipment.</p>
        <button onClick={() => navigate('/dashboard')} className="px-8 py-3.5 bg-[#2E7D32] text-white font-bold rounded-xl hover:bg-[#1B5E20] transition-colors">
          Browse Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Build Your Container</h1>
          <p className="text-stone-500 font-semibold text-sm">Review your products and monitor container capacity.</p>
        </div>
        <button onClick={clearCart} className="text-xs font-bold text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors">
          Clear Cart
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {/* Cart Items */}
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm relative overflow-hidden group">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl bg-stone-100" />
              
              <div className="flex-grow">
                <h3 className="font-extrabold text-stone-900 text-base mb-1 pr-12">{item.name}</h3>
                <p className="text-[#2E7D32] font-black text-sm mb-3">{convertCurrency(item.price, user?.currency).formatted} <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">/ Pallet</span></p>
                
                <div className="flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-900 rounded-md transition-colors font-bold">-</button>
                    <span className="w-10 text-center text-sm font-black text-stone-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-900 rounded-md transition-colors font-bold">+</button>
                  </div>
                  
                  {/* Total line price */}
                  <div className="text-sm font-black text-stone-900">
                    Total: {convertCurrency(item.price * item.quantity, user?.currency).formatted}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-stone-400 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-bold text-[#2E7D32] hover:text-[#1B5E20] transition-colors mt-4">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </button>
        </div>


      </div>
    </div>
  );
};

export default Cart;
