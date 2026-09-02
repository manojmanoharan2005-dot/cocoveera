/**
 * File: frontend/src/pages/account/Cart.jsx
 * Purpose: Persistent Database-Backed Shopping Cart Page for Container Configurations.
 */
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trash2, ArrowRight, Package, ArrowLeft, CheckCircle2, 
  Pencil, ShoppingBag, Info, AlertCircle, FileText, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { convertCurrency } from '../../utils/currencyConverter';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import RecommendedProducts from '../../components/common/RecommendedProducts';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading, removeFromCart, clearCart } = useCart();

  const handleEditConfiguration = (item) => {
    if (!item || !item.mainProduct) return;
    const targetSlug = item.mainProduct.slug || item.mainProduct._id;
    navigate(`/dashboard/product/${targetSlug}?cartItemId=${item._id}`);
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this container configuration from your cart?')) {
      await removeFromCart(itemId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
    }
  };

  // Helper to compute prices per container
  const getPiecesForContainer = (cType = '20FT', palletCount = 300) => {
    if (cType.includes('40FT')) return 22 * palletCount;
    return 10 * palletCount;
  };

  // Total logistics calculations across all cart container items
  let grandTotalContainers = 0;
  let grandTotalPieces = 0;
  let grandSubtotal = 0;

  (cart || []).forEach(item => {
    if (!item.mainProduct) return;
    const cType = item.containerType || '20FT';
    const mainPrice = item.mainProduct.price || 0;
    const palletCount = item.mainProduct.palletCount || 300;
    const containerPieces = getPiecesForContainer(cType, palletCount);

    // Completed containers calculations
    (item.completedContainers || []).forEach(c => {
      grandTotalContainers += (c.totalLoad || 1.00);
      (c.items || []).forEach(prodItem => {
        const prod = prodItem.product;
        if (prod && typeof prod === 'object') {
          const qty = prodItem.quantity || 0;
          const pieces = qty * getPiecesForContainer(c.containerType || cType, prod.palletCount || 300);
          grandTotalPieces += pieces;
          grandSubtotal += (prod.price || 0) * pieces;
        }
      });
    });

    // Active container calculations
    if (item.activeContainer && item.activeContainer.totalLoad > 0) {
      grandTotalContainers += item.activeContainer.totalLoad;
      (item.activeContainer.items || []).forEach(prodItem => {
        const prod = prodItem.product;
        if (prod && typeof prod === 'object') {
          const qty = prodItem.quantity || 0;
          const pieces = qty * getPiecesForContainer(item.activeContainer.containerType || cType, prod.palletCount || 300);
          grandTotalPieces += pieces;
          grandSubtotal += (prod.price || 0) * pieces;
        }
      });
    }

    // Fallback if mainQuantity provided directly
    if ((!item.completedContainers || item.completedContainers.length === 0) && item.mainQuantity > 0) {
      grandTotalContainers += item.mainQuantity;
      const pieces = item.mainQuantity * containerPieces;
      grandTotalPieces += pieces;
      grandSubtotal += mainPrice * pieces;
    }
  });

  const isWholeContainer = grandTotalContainers > 0 && Math.abs(grandTotalContainers - Math.round(grandTotalContainers)) < 0.001;
  const grandSubtotalData = convertCurrency(grandSubtotal, user?.currency || 'INR');

  if (loading && cart.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">
          Loading your persistent cart...
        </p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        <div className="w-full text-center py-20 bg-white rounded-[28px] border border-stone-200/80 shadow-sm p-6">
          <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#86efac]/50">
            <ShoppingBag className="w-10 h-10 text-[#2E7D32]" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 font-poppins mb-2">Your Cart is Empty</h2>
          <p className="text-stone-500 font-semibold text-xs max-w-md mx-auto mb-8">
            Build your export shipment by configuring custom container loads in our Marketplace.
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-8 py-3.5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#113F15] text-white font-poppins text-xs font-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Browse Marketplace
          </button>
        </div>
        
        <RecommendedProducts />
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-poppins">
            Container Shopping Cart
          </h1>
          <p className="text-stone-500 font-bold text-xs mt-1">
            Persistent database-backed container configurations ({cart.length} Saved {cart.length === 1 ? 'Configuration' : 'Configurations'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleClearCart} 
            className="text-xs font-extrabold text-red-600 hover:bg-red-50 px-3.5 py-2 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item Cards List */}
        <div className="lg:col-span-8 space-y-6">
          {cart.map((item) => {
            const mainProd = item.mainProduct;
            if (!mainProd) return null;

            const cType = item.containerType || '20FT';
            const completedList = item.completedContainers || [];
            const activeLoad = item.activeContainer?.totalLoad || 0;
            const itemTotalContainers = item.totalContainers || (completedList.length + activeLoad);

            return (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border-2 border-stone-200/80 p-5 sm:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-5 relative group transition-all hover:border-[#2E7D32]/40"
              >
                {/* Main Product Header Card */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-200/80 p-1.5 shrink-0 overflow-hidden flex items-center justify-center">
                      <ImageWithFallback 
                        src={mainProd.images?.[0]} 
                        alt={mainProd.name} 
                        className="w-full h-full object-contain mix-blend-multiply" 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full inline-block mb-1">
                        {mainProd.category || 'Substrates'}
                      </span>
                      <h3 className="font-poppins font-black text-stone-900 text-base leading-snug truncate">
                        {mainProd.name}
                      </h3>
                      <p className="text-xs font-bold text-stone-500 mt-0.5">
                        Container Size: <span className="text-stone-900 font-extrabold uppercase">{cType} FCL</span> • Total: <span className="text-[#2E7D32] font-black">{itemTotalContainers.toFixed(2)} Containers</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions for Item */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditConfiguration(item)}
                      className="flex items-center gap-1.5 text-xs font-extrabold text-[#2E7D32] bg-[#E8F5E9] hover:bg-[#2E7D32] hover:text-white px-3 py-2 rounded-xl border border-[#2E7D32]/30 transition-all shadow-xs active:scale-95 cursor-pointer"
                      title="Edit this container configuration"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Config</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item._id)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* COMPLETED CONTAINERS BREAKDOWN */}
                {completedList.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block font-poppins flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                      Completed Containers ({completedList.length})
                    </span>

                    <div className="grid grid-cols-1 gap-2.5">
                      {completedList.map((c, idx) => (
                        <div 
                          key={idx}
                          className="bg-[#f0fdf4] border border-[#86efac] rounded-2xl p-3.5 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-poppins font-black text-stone-900 uppercase">
                              Container #{c.containerNumber} ({c.containerType || cType})
                            </span>
                            <span className="text-[10px] font-black text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-full border border-[#86efac]">
                              100% Filled (1.00 FCL)
                            </span>
                          </div>

                          {/* Items in container */}
                          <div className="pt-1.5 border-t border-[#86efac]/40 space-y-1">
                            {(c.items || []).map((prodItem, pIdx) => {
                              const prodObj = prodItem.product;
                              const prodName = typeof prodObj === 'object' ? prodObj.name : 'Product';
                              return (
                                <div key={pIdx} className="flex items-center justify-between text-xs text-stone-700 font-bold">
                                  <span className="truncate max-w-[220px]">{prodName}</span>
                                  <span className="text-[#15803d] font-poppins">{prodItem.quantity.toFixed(2)} Container</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTIVE CONTAINER BREAKDOWN (if load > 0) */}
                {activeLoad > 0 && (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-poppins font-black text-stone-900 uppercase">
                        Active Container #{completedList.length + 1} Configuration
                      </span>
                      <span className="text-[10px] font-black text-stone-700 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                        {Math.round(activeLoad * 100)}% Filled ({activeLoad.toFixed(2)} FCL)
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-stone-200/60 space-y-1">
                      {(item.activeContainer?.items || []).map((prodItem, pIdx) => {
                        const prodObj = prodItem.product;
                        const prodName = typeof prodObj === 'object' ? prodObj.name : 'Product';
                        return (
                          <div key={pIdx} className="flex items-center justify-between text-xs text-stone-700 font-bold">
                            <span className="truncate max-w-[220px]">{prodName}</span>
                            <span className="text-[#2E7D32] font-poppins">{prodItem.quantity.toFixed(2)} Container</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          <button 
            type="button"
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-xs font-black text-[#2E7D32] hover:text-[#1B5E20] transition-colors py-2 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping in Marketplace</span>
          </button>
        </div>

        {/* Right Column: Order & Logistics Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 space-y-6 sticky top-24 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h2 className="text-base font-black font-poppins uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3">
              Shipment Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-stone-600 font-bold">
                <span>Total Configurations</span>
                <span className="text-stone-900 font-black font-poppins">{cart.length}</span>
              </div>
              <div className="flex justify-between items-center text-stone-600 font-bold">
                <span>Total Containers Load</span>
                <span className="text-[#2E7D32] font-black font-poppins text-sm">
                  {grandTotalContainers.toFixed(2)} FCL
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-600 font-bold">
                <span>Estimated Total Pieces</span>
                <span className="text-stone-900 font-black font-poppins">
                  {Math.round(grandTotalPieces).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block">Subtotal</span>
                <span className="text-xl font-black text-stone-900 font-poppins">
                  {grandSubtotalData.formatted}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/request-quote')}
                className="w-full bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#113F15] text-white font-poppins text-xs font-black py-4 px-5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
              >
                <span>PROCEED TO RFQ QUOTATION</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-poppins text-xs font-extrabold py-3.5 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>DIRECT CHECKOUT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <RecommendedProducts />
      </div>
    </div>
  );
};

export default Cart;
