/**
 * File: frontend/src/pages/account/Cart.jsx
 * Purpose: Persistent Database-Backed Shopping Cart Page for Container Configurations.
 * Fully Mobile-Responsive Redesign with Container Specifications, Utilization & Logistics.
 */
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trash2, ArrowRight, Package, ArrowLeft, CheckCircle2, 
  Pencil, ShoppingBag, Info, AlertCircle, FileText, ChevronRight,
  Boxes, Truck, Scale, BarChart2
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
  const { cart, cartCount, loading, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleEditConfiguration = (item) => {
    if (!item || !item.mainProduct) return;
    const targetSlug = item.mainProduct.slug || item.mainProduct._id;
    navigate(`/dashboard/product/${targetSlug}?cartItemId=${item._id}`);
  };

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty <= 0) {
      if (window.confirm('Remove this item from your cart?')) {
        await removeFromCart(itemId);
      }
      return;
    }
    await updateQuantity(itemId, newQty);
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this configuration from your cart?')) {
      await removeFromCart(itemId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart? All items will be removed.')) {
      await clearCart();
    }
  };

  // Helper to compute pieces per container
  const getPiecesForContainer = (cType = '20FT', palletCount = 300) => {
    if (cType.includes('40FT')) return 22 * palletCount;
    return 10 * palletCount;
  };

  const getPalletsForContainer = (cType = '20FT') => {
    return cType.includes('40FT') ? 22 : 10;
  };

  const getWeightMTForContainer = (cType = '20FT') => {
    return cType.includes('40FT') ? 26 : 14;
  };

  const getVolumeCBMForContainer = (cType = '20FT') => {
    return cType.includes('40FT') ? 65 : 28;
  };

  // Total logistics calculations across all cart container items
  let grandTotalContainers = 0;
  let grandTotalPieces = 0;
  let grandSubtotal = 0;
  let grandTotalWeightMT = 0;
  let grandTotalVolumeCBM = 0;

  (cart || []).forEach(item => {
    if (!item.mainProduct) return;
    const cType = item.containerType || '20FT';
    const mainPrice = item.mainProduct.price || 0;
    const palletCount = item.mainProduct.palletCount || 300;
    const containerPieces = getPiecesForContainer(cType, palletCount);

    // Completed containers calculations
    (item.completedContainers || []).forEach(c => {
      const load = c.totalLoad || 1.00;
      grandTotalContainers += load;
      grandTotalWeightMT += load * getWeightMTForContainer(c.containerType || cType);
      grandTotalVolumeCBM += load * getVolumeCBMForContainer(c.containerType || cType);
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
      const load = item.activeContainer.totalLoad;
      grandTotalContainers += load;
      grandTotalWeightMT += load * getWeightMTForContainer(item.activeContainer.containerType || cType);
      grandTotalVolumeCBM += load * getVolumeCBMForContainer(item.activeContainer.containerType || cType);
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
    if (!item.completedContainers || item.completedContainers.length === 0) {
      const q = Number(item.mainQuantity) || Number(item.totalContainers) || 1;
      grandTotalContainers += q;
      grandTotalWeightMT += q * getWeightMTForContainer(cType);
      grandTotalVolumeCBM += q * getVolumeCBMForContainer(cType);
      const pieces = q * containerPieces;
      grandTotalPieces += pieces;
      grandSubtotal += mainPrice * (pieces > 0 ? pieces : q);
    }
  });

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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl mx-auto space-y-8 pb-32"
      >
        <div className="w-full text-center py-12 xs:py-16 sm:py-20 bg-white rounded-2xl sm:rounded-[28px] border border-stone-200/80 shadow-xs p-5 sm:p-8">
          <div className="w-16 h-16 xs:w-20 xs:h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#86efac]/50 shadow-xs">
            <ShoppingBag className="w-8 h-8 xs:w-10 xs:h-10 text-[#2E7D32]" />
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-stone-900 font-poppins mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-stone-500 font-medium text-xs xs:text-sm max-w-md mx-auto mb-6">
            Build your export shipment by configuring custom 20FT &amp; 40FT container loads in our Marketplace.
          </p>
          <button 
            type="button"
            onClick={() => navigate('/dashboard')} 
            className="px-6 xs:px-8 py-3 xs:py-3.5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#113F15] text-white font-poppins text-xs font-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Browse Marketplace
          </button>
        </div>
        
        <RecommendedProducts />
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-32 sm:pb-36">
      {/* 1. Header & Clear Cart Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-stone-900 font-poppins tracking-tight">
              Container Shopping Cart
            </h1>
            <span className="text-[11px] font-extrabold text-[#2E7D32] bg-[#E8F5E9] border border-[#2E7D32]/20 px-2.5 py-0.5 rounded-full shrink-0">
              {cartCount} {cartCount === 1 ? 'Item' : 'Items'} ({cart.length} {cart.length === 1 ? 'Config' : 'Configs'})
            </span>
          </div>
          <p className="text-[11px] xs:text-xs text-stone-500 font-medium mt-1">
            Export-ready container load configurations with live logistics calculations
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-0">
          <button 
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex sm:hidden items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#2E7D32] py-1.5 px-3 rounded-xl border border-stone-200 bg-white shadow-2xs cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </button>

          <button 
            type="button"
            onClick={handleClearCart} 
            className="text-xs font-bold text-red-600 hover:bg-red-50 px-3.5 py-1.5 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer bg-white shadow-2xs active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* 2. Container Configuration Cards List */}
        <div className="lg:col-span-8 space-y-5 xs:space-y-6">
          {cart.map((item, idx) => {
            const mainProd = item.mainProduct;
            if (!mainProd) return null;

            const cType = item.containerType || '20FT';
            const completedList = item.completedContainers || [];
            const activeLoad = item.activeContainer?.totalLoad || 0;
            const itemTotalContainers = item.totalContainers || (completedList.length + activeLoad);
            const palletCount = mainProd.palletCount || 300;
            const containerPieces = getPiecesForContainer(cType, palletCount);
            const itemTotalPieces = Math.round(itemTotalContainers * containerPieces);
            const itemTotalPallets = Math.round(itemTotalContainers * getPalletsForContainer(cType));
            const itemEstWeightMT = itemTotalContainers * getWeightMTForContainer(cType);
            const itemEstVolumeCBM = Math.round(itemTotalContainers * getVolumeCBMForContainer(cType));
            const currentQty = Number(item.mainQuantity) || Number(item.totalContainers) || 1;

            let itemSubtotal = 0;
            if (completedList.length > 0 || activeLoad > 0) {
              completedList.forEach(c => {
                (c.items || []).forEach(prodItem => {
                  const p = prodItem.product;
                  if (p && typeof p === 'object') {
                    const pieces = (prodItem.quantity || 0) * getPiecesForContainer(c.containerType || cType, p.palletCount || 300);
                    itemSubtotal += (p.price || 0) * pieces;
                  }
                });
              });
              if (item.activeContainer && item.activeContainer.totalLoad > 0) {
                (item.activeContainer.items || []).forEach(prodItem => {
                  const p = prodItem.product;
                  if (p && typeof p === 'object') {
                    const pieces = (prodItem.quantity || 0) * getPiecesForContainer(item.activeContainer.containerType || cType, p.palletCount || 300);
                    itemSubtotal += (p.price || 0) * pieces;
                  }
                });
              }
            } else {
              const pieces = currentQty * containerPieces;
              itemSubtotal = (mainProd.price || 0) * (pieces > 0 ? pieces : currentQty);
            }

            return (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 p-3.5 xs:p-4.5 sm:p-6 shadow-xs hover:border-[#2E7D32]/40 transition-all space-y-4"
              >
                {/* 2A. Card Header: Configuration Label & Action Buttons */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-black text-xs shrink-0">
                      #{idx + 1}
                    </span>
                    <h4 className="text-xs xs:text-sm font-poppins font-black text-stone-900 truncate">
                      Configuration #{idx + 1} • <span className="text-[#2E7D32]">{cType} FCL</span>
                    </h4>
                  </div>

                  {/* Actions for Item: Edit & Delete (Never Overlapping) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditConfiguration(item)}
                      className="flex items-center gap-1 text-[11px] xs:text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] hover:bg-[#2E7D32] hover:text-white px-2.5 xs:px-3 py-1.5 rounded-xl border border-[#2E7D32]/30 transition-all shadow-2xs active:scale-95 cursor-pointer"
                      title="Edit this container configuration"
                    >
                      <Pencil className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
                      <span className="whitespace-nowrap">Edit Config</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item._id)}
                      className="w-8 h-8 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Remove configuration"
                      aria-label="Remove configuration"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2B. Product Information */}
                <div className="flex items-start gap-3 xs:gap-3.5 min-w-0">
                  <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-2xl bg-stone-50 border border-stone-200/80 p-2 shrink-0 overflow-hidden flex items-center justify-center">
                    <ImageWithFallback 
                      src={mainProd.images?.[0]} 
                      alt={mainProd.name} 
                      className="max-w-full max-h-full object-contain" 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] xs:text-[10px] font-extrabold uppercase tracking-wider text-[#2E7D32] bg-[#E8F5E9] border border-[#2E7D32]/20 px-2 py-0.5 rounded-md inline-block mb-1">
                      {mainProd.category || 'Substrates'}
                    </span>
                    <h3 className="font-poppins font-black text-stone-900 text-xs xs:text-sm sm:text-base leading-snug line-clamp-2">
                      {mainProd.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] xs:text-xs text-stone-500 font-medium">
                      <span>Size: <strong className="text-stone-800 font-bold">{cType}</strong></span>
                      <span>•</span>
                      <span>Units: <strong className="text-stone-800 font-bold">{itemTotalPieces.toLocaleString()} pcs</strong></span>
                      <span>•</span>
                      <span>Total: <strong className="text-[#2E7D32] font-black">{itemTotalContainers.toFixed(2)} Cont.</strong></span>
                    </div>
                  </div>
                </div>

                {/* 2C. Price, Quantity Stepper & Subtotal Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-3.5 bg-[#FAFBF9] border border-stone-200/70 rounded-2xl">
                  {/* Unit Price */}
                  <div>
                    <span className="text-[9px] xs:text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Unit Price
                    </span>
                    <span className="text-xs xs:text-sm font-poppins font-black text-stone-900">
                      {convertCurrency(mainProd.price || 0, user?.currency).formatted}
                      <span className="text-[10px] text-stone-400 font-medium ml-1">/ unit</span>
                    </span>
                  </div>

                  {/* Quantity Stepper (+ / -) */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] xs:text-[10px] font-bold text-stone-400 uppercase tracking-wider hidden xs:inline-block">
                      Quantity:
                    </span>
                    <div className="inline-flex items-center bg-white border border-stone-300/80 rounded-xl shadow-2xs overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item._id, currentQty - 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-red-600 hover:bg-stone-50 active:bg-stone-100 transition-colors font-bold text-base cursor-pointer select-none"
                        title="Decrease quantity"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-9 text-center font-poppins font-black text-xs xs:text-sm text-stone-900 select-none">
                        {currentQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item._id, currentQty + 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-[#2E7D32] hover:bg-stone-50 active:bg-stone-100 transition-colors font-bold text-base cursor-pointer select-none"
                        title="Increase quantity"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right">
                    <span className="text-[9px] xs:text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Subtotal
                    </span>
                    <span className="text-sm xs:text-base font-poppins font-black text-[#2E7D32]">
                      {convertCurrency(itemSubtotal, user?.currency).formatted}
                    </span>
                  </div>
                </div>

                {/* 2D. Container Specifications Grid (Weight, Volume, Pallets, Load) */}
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 pt-1">
                  <div className="bg-[#FAFBF9] rounded-xl p-2 xs:p-2.5 border border-stone-200/60 text-center">
                    <span className="text-[9px] xs:text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Container Size</span>
                    <span className="text-[11px] xs:text-xs font-black text-stone-800 font-poppins">{cType} FCL</span>
                  </div>
                  <div className="bg-[#FAFBF9] rounded-xl p-2 xs:p-2.5 border border-stone-200/60 text-center">
                    <span className="text-[9px] xs:text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Est. Pallets</span>
                    <span className="text-[11px] xs:text-xs font-black text-stone-800 font-poppins">{itemTotalPallets} Pallets</span>
                  </div>
                  <div className="bg-[#FAFBF9] rounded-xl p-2 xs:p-2.5 border border-stone-200/60 text-center">
                    <span className="text-[9px] xs:text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Est. Weight</span>
                    <span className="text-[11px] xs:text-xs font-black text-stone-800 font-poppins">~{itemEstWeightMT.toFixed(1)} MT</span>
                  </div>
                  <div className="bg-[#FAFBF9] rounded-xl p-2 xs:p-2.5 border border-stone-200/60 text-center">
                    <span className="text-[9px] xs:text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Est. Volume</span>
                    <span className="text-[11px] xs:text-xs font-black text-stone-800 font-poppins">~{itemEstVolumeCBM} CBM</span>
                  </div>
                </div>

                {/* 2D. COMPLETED CONTAINERS BREAKDOWN WITH PROGRESS BARS */}
                {completedList.length > 0 && (
                  <div className="space-y-2.5 pt-1 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] xs:text-[11px] font-black text-stone-600 uppercase tracking-wider font-poppins flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                        Completed Containers ({completedList.length})
                      </span>
                      <span className="text-[10px] font-bold text-[#15803d]">100% Full Load</span>
                    </div>

                    <div className="space-y-2">
                      {completedList.map((c, cIdx) => (
                        <div 
                          key={cIdx}
                          className="bg-[#f0fdf4] border border-[#86efac]/80 rounded-xl p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-poppins font-black text-stone-900 uppercase">
                              Container #{c.containerNumber} ({c.containerType || cType})
                            </span>
                            <span className="text-[9.5px] font-black text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-full border border-[#86efac]">
                              100% Filled (1.00 FCL)
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-1.5 bg-[#86efac]/40 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#22c55e] to-[#15803d] rounded-full w-full" />
                          </div>

                          {/* Items in container */}
                          <div className="pt-1 border-t border-[#86efac]/30 space-y-1">
                            {(c.items || []).map((prodItem, pIdx) => {
                              const prodObj = prodItem.product;
                              const prodName = typeof prodObj === 'object' ? prodObj.name : 'Product';
                              return (
                                <div key={pIdx} className="flex items-center justify-between text-[11px] text-stone-700 font-semibold">
                                  <span className="truncate max-w-[200px] xs:max-w-[260px]">{prodName}</span>
                                  <span className="text-[#15803d] font-poppins font-bold">{prodItem.quantity.toFixed(2)} Cont.</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2E. ACTIVE CONTAINER BREAKDOWN (if load > 0) */}
                {activeLoad > 0 && (
                  <div className="bg-[#FAFBF9] border border-stone-200/90 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-poppins font-black text-stone-900 uppercase">
                        Active Container #{completedList.length + 1}
                      </span>
                      <span className="text-[9.5px] font-black text-stone-700 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                        {Math.round(activeLoad * 100)}% Filled ({activeLoad.toFixed(2)} FCL)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#2E7D32] to-[#43A047] rounded-full" 
                        style={{ width: `${Math.min(100, Math.round(activeLoad * 100))}%` }}
                      />
                    </div>

                    <div className="pt-1 border-t border-stone-200/60 space-y-1">
                      {(item.activeContainer?.items || []).map((prodItem, pIdx) => {
                        const prodObj = prodItem.product;
                        const prodName = typeof prodObj === 'object' ? prodObj.name : 'Product';
                        return (
                          <div key={pIdx} className="flex items-center justify-between text-[11px] text-stone-700 font-semibold">
                            <span className="truncate max-w-[200px] xs:max-w-[260px]">{prodName}</span>
                            <span className="text-[#2E7D32] font-poppins font-bold">{prodItem.quantity.toFixed(2)} Cont.</span>
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

        {/* 3. Right Column: Order & Logistics Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 p-4.5 sm:p-6 space-y-5 sticky top-24 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-sm sm:text-base font-black font-poppins uppercase tracking-wider text-stone-900">
                Shipment Summary
              </h2>
              <span className="text-[10px] font-extrabold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                {grandTotalContainers.toFixed(2)} FCL Load
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-stone-600 font-semibold">
                <span>Total Items</span>
                <span className="text-[#2E7D32] font-black font-poppins">{cartCount}</span>
              </div>
              <div className="flex justify-between items-center text-stone-600 font-semibold">
                <span>Total Configurations</span>
                <span className="text-stone-900 font-black font-poppins">{cart.length}</span>
              </div>
              <div className="flex justify-between items-center text-stone-600 font-semibold">
                <span>Total Containers</span>
                <span className="text-[#2E7D32] font-black font-poppins text-sm">
                  {grandTotalContainers.toFixed(2)} FCL
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-600 font-semibold">
                <span>Estimated Total Units</span>
                <span className="text-stone-900 font-black font-poppins">
                  {Math.round(grandTotalPieces).toLocaleString()} pcs
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-600 font-semibold">
                <span>Estimated Total Weight</span>
                <span className="text-stone-900 font-black font-poppins">
                  ~{grandTotalWeightMT.toFixed(1)} MT
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-600 font-semibold">
                <span>Estimated Total Volume</span>
                <span className="text-stone-900 font-black font-poppins">
                  ~{grandTotalVolumeCBM} CBM
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block">Subtotal</span>
                <span className="text-xl sm:text-2xl font-black text-stone-900 font-poppins">
                  {grandSubtotalData.formatted}
                </span>
              </div>
              <span className="text-[10px] font-bold text-stone-400">Ex-Factory / FOB</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate('/request-quote')}
                className="w-full bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#113F15] text-white font-poppins text-xs font-black py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
              >
                <span>PROCEED TO RFQ QUOTATION</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-poppins text-xs font-extrabold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>DIRECT CHECKOUT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 sm:pt-6">
        <RecommendedProducts />
      </div>
    </div>
  );
};

export default Cart;
