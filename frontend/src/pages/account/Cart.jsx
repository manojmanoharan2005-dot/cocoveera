/**
 * File: frontend/src/pages/account/Cart.jsx
 * Purpose: React page component representing the Cart view.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Heart, ArrowRight, Package, ArrowLeft, AlertCircle } from 'lucide-react';
import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import ImageWithFallback from '../../components/common/ImageWithFallback';

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
            weight: c.product?.weight || 0,
            volume: c.product?.volumeCBM || 0,
            image: c.product?.images?.[0] || 'https://placehold.co/400x400/eeeeee/999999?text=Image+Not+Available'
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

  const getPiecesForContainer = (cType, palletCount = 300) => {
    if (!cType) return 10 * palletCount;
    if (cType.includes('40FT')) return 22 * palletCount;
    return 10 * palletCount;
  };

  let totalPieces = 0;
  
  const subtotal = cartItems.reduce((acc, item) => {
    const pieces = item.quantity * getPiecesForContainer(item.containerType || '20FT FCL', item.palletCount);
    totalPieces += pieces;
    return acc + (item.price * pieces);
  }, 0);

  const estimatedWeight = cartItems.reduce((acc, item) => {
    const pieces = item.quantity * getPiecesForContainer(item.containerType || '20FT FCL', item.palletCount);
    const weight = item.weight || 0;
    return acc + (weight * pieces);
  }, 0);

  const estimatedVolume = cartItems.reduce((acc, item) => {
    const pieces = item.quantity * getPiecesForContainer(item.containerType || '20FT FCL', item.palletCount);
    const volume = item.volume || 0;
    return acc + (volume * pieces);
  }, 0);

  let recommendedContainer = '20FT Container';
  let maxWeight = 28000;
  let maxVolume = 33;

  if (estimatedWeight > 28000 || estimatedVolume > 33) {
    if (estimatedWeight <= 26000 && estimatedVolume <= 67) {
       recommendedContainer = '40FT Container';
       maxWeight = 26000;
       maxVolume = 67;
    } else {
       recommendedContainer = 'Multiple Containers Required';
    }
  }

  const weightUtilization = (estimatedWeight / maxWeight) * 100;
  const volumeUtilization = (estimatedVolume / maxVolume) * 100;
  const totalContainerQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isWholeContainer = Number.isInteger(totalContainerQuantity) && totalContainerQuantity >= 1;
  const capacityPercentage = isWholeContainer ? 100 : ((totalContainerQuantity % 1) * 100);
  const remainingForNextFull = isWholeContainer ? 0 : (1 - (totalContainerQuantity % 1));
  const isOverCapacity = false; // Container fractions mean users can order multiple containers freely



  const updateQuantity = async (id, newQty) => {
    if (newQty < 0.25) return;
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm relative overflow-hidden group">
              <div className="w-24 h-24 rounded-xl bg-stone-100 flex-shrink-0 relative overflow-hidden">
                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
              </div>
              
              <div className="flex-grow">
                <h3 className="font-extrabold text-stone-900 text-base mb-1 pr-12">{item.name}</h3>
                <p className="text-[#2E7D32] font-black text-sm mb-3">{convertCurrency(item.price, user?.currency).formatted} <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">/ Piece</span></p>
                
                <div className="flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 0.25)} className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-900 rounded-md transition-colors font-bold">-</button>
                    <span className="w-10 text-center text-sm font-black text-stone-900">{item.quantity.toFixed(2)}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 0.25)} className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-900 rounded-md transition-colors font-bold">+</button>
                  </div>
                  
                  {/* Total line price */}
                  <div className="text-sm font-black text-stone-900">
                    Total: {convertCurrency(item.price * item.quantity * getPiecesForContainer(item.containerType || '20FT FCL', item.palletCount), user?.currency).formatted}
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


        <div className="lg:col-span-1">
          <div className="bg-white rounded-[24px] border border-stone-200 p-6 sticky top-24 shadow-sm">
            <h2 className="text-xl font-extrabold text-stone-900 mb-6">Logistics Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500 font-semibold">Estimated Weight</span>
                <span className="text-stone-900 font-black">{estimatedWeight.toLocaleString()} KG</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500 font-semibold">Estimated Volume</span>
                <span className="text-stone-900 font-black">{estimatedVolume.toFixed(2)} CBM</span>
              </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-stone-600">
                    <span>Total Containers</span>
                    <span className="text-stone-900 font-bold">{totalContainerQuantity.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-stone-600">
                    <span>Total Pieces</span>
                    <span className="text-stone-900 font-bold">{Math.round(totalPieces).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-stone-600">
                    <span>Total Price</span>
                    <span className="text-stone-900 font-bold">{convertCurrency(subtotal, user?.currency).formatted}</span>
                  </div>
            </div>

            <div className={`p-4 rounded-xl mb-6 ${!isWholeContainer ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-start gap-3">
                <Package className={`w-5 h-5 mt-0.5 ${!isWholeContainer ? 'text-orange-500' : 'text-green-600'}`} />
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${!isWholeContainer ? 'text-orange-600' : 'text-green-700'}`}>
                    Container Status
                  </p>
                  <p className={`text-base font-black ${!isWholeContainer ? 'text-orange-700' : 'text-green-800'}`}>
                    {!isWholeContainer ? 'Full Container Required' : 'Ready for Checkout'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className={!isWholeContainer ? 'text-orange-700' : 'text-green-700'}>
                    {!isWholeContainer ? `Add ${remainingForNextFull.toFixed(2)} more to complete full container` : `Total Capacity: ${totalContainerQuantity.toFixed(2)}`}
                  </span>
                  <span className={!isWholeContainer ? 'text-orange-700' : 'text-green-700'}>
                    {capacityPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${!isWholeContainer ? 'bg-orange-200' : 'bg-green-200'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${!isWholeContainer ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${capacityPercentage}%` }}
                  />
                </div>
                {!isWholeContainer && (
                  <p className="text-[10px] font-semibold text-orange-600 mt-3 text-center opacity-90 leading-snug">
                    Checkout is available only for full container quantities. Please complete the remaining container capacity.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-stone-900 font-bold">Subtotal</span>
                <span className="text-2xl font-black text-stone-900">{convertCurrency(subtotal, user?.currency).formatted}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              disabled={!isWholeContainer}
              className={`w-full py-4 font-black rounded-xl transition-colors flex justify-center items-center gap-2 ${!isWholeContainer ? 'bg-stone-200 text-stone-500 opacity-60 cursor-not-allowed' : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white'}`}
            >
              {!isWholeContainer ? 'Full Container Required' : 'Proceed to Checkout'} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
