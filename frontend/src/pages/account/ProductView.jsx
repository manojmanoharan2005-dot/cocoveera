/**
 * File: frontend/src/pages/account/ProductView.jsx
 * Purpose: React page component representing the ProductView view.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Star, ShoppingBag, Check, 
  Droplet, Wind, ShieldCheck, FileText, ChevronRight,
  Plus, Minus, Info, AlertCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import { ContainerViewer3D } from '../../components/3d/ContainerViewer3D';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();

  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');
  const [containerType, setContainerType] = useState('20FT');
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [extraItems, setExtraItems] = useState([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prodRes, allProdRes] = await Promise.all([
          apiClient.get(`/products/${id}`),
          apiClient.get('/products')
        ]);

        if (prodRes.data.success) {
          const fetchedProduct = prodRes.data.data;
          setProduct(fetchedProduct);
          
          // Set wishlist status
          if (user?.wishlist) {
            setIsWishlisted(user.wishlist.some(item => item._id === fetchedProduct._id));
          }

          // Filter out current product for related products section
          if (allProdRes.data.success) {
            const sameCategory = allProdRes.data.data.filter(
              p => p._id !== fetchedProduct._id && p.category === fetchedProduct.category
            );
            const others = allProdRes.data.data.filter(
              p => p._id !== fetchedProduct._id && p.category !== fetchedProduct.category
            );
            // Prioritize same category, fill up to 3 products
            const related = [...sameCategory, ...others].slice(0, 3);
            setRelatedProducts(related);
          }
        } else {
          setError('Failed to load product details.');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Error connecting to server. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, user]);

  const handleWishlistToggle = async () => {
    if (!product) return;
    setIsWishlisted(prev => !prev);
    try {
      await apiClient.post('/users/wishlist', { productId: product._id });
      await fetchProfile();
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!product || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await apiClient.post('/users/cart', { 
        productId: product._id, 
        quantity, 
        increment: true 
      });
      if (res.data.success) {
        await fetchProfile();
        setAddedMessage(`Successfully added ${quantity} Container${quantity > 1 ? 's' : ''} to Cart!`);
        setTimeout(() => setAddedMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await apiClient.post('/users/cart', { 
        productId: product._id, 
        quantity, 
        increment: true 
      });
      if (res.data.success) {
        await fetchProfile();
        navigate('/account/cart');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!product) return;
    navigate('/account/checkout', { 
      state: { 
        product, 
        quantity, 
        containerType 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-stone-400 font-sans">
          Loading Product details...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="font-poppins font-extrabold text-stone-900 text-base">Unable to load product</h4>
        <p className="text-xs text-stone-500 font-semibold">{error || 'Product not found.'}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-xs font-bold py-3 px-6 rounded-[12px] transition-all"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  // Price calculations
  const priceData = convertCurrency(product.price, user?.currency || 'INR');
  const oldPrice = product.price ? Math.round(product.price * 1.25) : 0;
  const oldPriceData = convertCurrency(oldPrice, user?.currency || 'INR');
  const discount = 20;

  // Container & subtotal calculations
  const CONTAINER_CAPACITY = {
    '20FT': 10,
    '40FT': 22
  };
  const currentCapacity = CONTAINER_CAPACITY[containerType];
  const totalQuantity = quantity + extraItems.reduce((acc, item) => acc + item.quantity, 0);
  const capacityPercentage = Math.min((totalQuantity / currentCapacity) * 100, 100);
  const isOverCapacity = totalQuantity > currentCapacity;
  const palletItems = [{ product, quantity }, ...extraItems];

  const subtotalValue = product.price * quantity;
  const subtotalData = convertCurrency(subtotalValue, user?.currency || 'INR');

  const imagesList = product.images?.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {addedMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-800"
          >
            <div className="w-5 h-5 rounded-full bg-[#2E7D32] flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-xs font-poppins font-bold">{addedMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumbs and navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-stone-500 font-bold">
          <Link to="/dashboard" className="hover:text-[#2E7D32] transition-colors">Marketplace</Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-stone-400 font-medium truncate max-w-[200px] sm:max-w-[300px]">
            {product.name}
          </span>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 bg-white border border-stone-200 text-stone-700 hover:text-[#2E7D32] hover:border-[#2E7D32] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>
      </div>

      {/* Main product layout */}
      <div className="bg-white rounded-[28px] border border-stone-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)] p-6 sm:p-8 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Image Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="h-72 sm:h-96 rounded-[24px] overflow-hidden bg-[#F7F9F7] border border-stone-200/50 shadow-sm relative group">
              <img 
                src={imagesList[activeImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
              />
              <button 
                onClick={handleWishlistToggle}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-stone-600 hover:text-red-500 p-2.5 rounded-full transition-all shadow-md border border-stone-100 flex items-center justify-center"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
            
            {/* Gallery Thumbs */}
            {imagesList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-1">
                {imagesList.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-20 h-20 rounded-[16px] overflow-hidden bg-stone-50 border cursor-pointer hover:border-[#2E7D32] transition-colors shrink-0 ${
                      i === activeImageIndex ? 'border-2 border-[#2E7D32]' : 'border-stone-200'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`thumbnail ${i}`} 
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Certifications and special notes */}
            <div className="grid grid-cols-2 gap-3 text-xs font-bold text-stone-600 bg-stone-50 border border-stone-100 p-4 rounded-[20px] mt-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
                  <Droplet className="w-3.5 h-3.5" />
                </div>
                <span>Freshwater Washed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
                  <Wind className="w-3.5 h-3.5" />
                </div>
                <span>High Porosity</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details, Pricing, & Spec Sheet */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-[#2E7D32] text-[10px] font-extrabold uppercase tracking-widest bg-[#2E7D32]/10 py-1 px-3.5 rounded-full inline-block">
                {product.category}
              </span>
              <h1 className="font-poppins font-black text-2xl sm:text-3xl text-stone-900 mt-3 leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#EAB308] text-[#EAB308]" />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-800">4.8</span>
              <span className="text-stone-300">|</span>
              <span className="text-xs font-semibold text-stone-500">18 Verified Technical Audits</span>
            </div>

            {/* CONTAINER SELECTION CARD */}
            {showConfigurator && (
              <div className="bg-white rounded-[20px] p-6 border border-stone-200/80 shadow-sm relative overflow-hidden space-y-4 mb-6">
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2.5 font-poppins">
                  Container Selection
                </h3>
              
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setContainerType('20FT')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${
                    containerType === '20FT' 
                      ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md shadow-[#2E7D32]/10' 
                      : 'bg-white text-stone-600 border-stone-250 hover:border-[#2E7D32] hover:text-[#2E7D32]'
                  }`}
                >
                  20FT FCL
                </button>
                <button 
                  type="button"
                  onClick={() => setContainerType('40FT')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${
                    containerType === '40FT' 
                      ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md shadow-[#2E7D32]/10' 
                      : 'bg-white text-stone-600 border-stone-250 hover:border-[#2E7D32] hover:text-[#2E7D32]'
                  }`}
                >
                  40FT FCL
                </button>
              </div>

              {/* Adjust Pallets Control */}
              <div className="flex items-center justify-between bg-stone-50 border border-stone-200/60 rounded-xl p-3">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider select-none">Adjust Quantity:</span>
                <div className="flex items-center bg-white border border-stone-250 rounded-lg p-0.5">
                  <button 
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-900 rounded-md transition-colors font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-poppins font-black text-stone-900 select-none">
                    {quantity}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-900 rounded-md transition-colors font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Capacity usage bar */}
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Capacity Usage</p>
                <div className="flex justify-between items-baseline mb-2">
                  <p className="text-lg font-black text-stone-900 font-poppins">
                    {totalQuantity} <span className="text-xs text-stone-400 font-bold">/ {currentCapacity} Pallets</span>
                  </p>
                  <p className="text-base font-black text-[#2E7D32]">
                    {capacityPercentage.toFixed(0)}%
                  </p>
                </div>

                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverCapacity ? 'bg-red-500' : 'bg-gradient-to-r from-[#43A047] to-[#2E7D32]'
                    }`}
                    style={{ width: `${capacityPercentage}%` }}
                  />
                </div>
              </div>

              {/* Mixed Load Section */}
              <div className="mt-4 border-t border-stone-100 pt-4">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Mix with other products</p>
                <div className="space-y-2">
                  {relatedProducts.map(relProduct => {
                    const existingExtra = extraItems.find(item => item.product._id === relProduct._id);
                    const relQuantity = existingExtra ? existingExtra.quantity : 0;
                    
                    return (
                      <div key={relProduct._id} className="flex items-center justify-between bg-stone-50 border border-stone-200/60 rounded-xl p-2">
                         <div className="flex items-center gap-2">
                           <img src={relProduct.images?.[0] || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae'} className="w-8 h-8 rounded-lg object-cover" alt="" />
                           <span className="text-[11px] font-bold text-stone-700 max-w-[120px] truncate">{relProduct.name}</span>
                         </div>
                         <div className="flex items-center bg-white border border-stone-250 rounded-lg p-0.5">
                           <button 
                             type="button"
                             onClick={() => {
                               setExtraItems(prev => {
                                 const existing = prev.find(p => p.product._id === relProduct._id);
                                 if (existing && existing.quantity > 1) {
                                   return prev.map(p => p.product._id === relProduct._id ? { ...p, quantity: p.quantity - 1 } : p);
                                 } else {
                                   return prev.filter(p => p.product._id !== relProduct._id);
                                 }
                               });
                             }}
                             className="w-6 h-6 flex items-center justify-center text-stone-500 hover:bg-stone-100 rounded-md"
                           >
                             <Minus className="w-3 h-3" />
                           </button>
                           <span className="w-6 text-center text-[10px] font-black">{relQuantity}</span>
                           <button 
                             type="button"
                             onClick={() => {
                               setExtraItems(prev => {
                                 const existing = prev.find(p => p.product._id === relProduct._id);
                                 if (existing) {
                                   return prev.map(p => p.product._id === relProduct._id ? { ...p, quantity: p.quantity + 1 } : p);
                                 } else {
                                   return [...prev, { product: relProduct, quantity: 1 }];
                                 }
                               });
                             }}
                             className="w-6 h-6 flex items-center justify-center text-stone-500 hover:bg-stone-100 rounded-md"
                           >
                             <Plus className="w-3 h-3" />
                           </button>
                         </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {isOverCapacity && (
                <div className="flex gap-2 items-start bg-red-50 p-3 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-red-700 leading-tight">
                    Warning: Quantity exceeds container capacity!
                  </p>
                </div>
              )}
            </div>
            )}

            {/* ORDER SUMMARY CARD */}
            <div className="bg-white rounded-[20px] p-6 border border-stone-200/80 shadow-sm relative overflow-hidden space-y-4">
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2.5 font-poppins">
                Order Summary
              </h3>
              
              <div className="space-y-3.5 text-xs font-bold text-stone-600">
                <div className="flex justify-between items-center">
                  <span>Subtotal ({quantity} Pallets)</span>
                  <span className="text-stone-900 text-sm font-black font-poppins">{subtotalData.formatted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Shipping</span>
                  <span className="text-stone-400 italic font-semibold">Calculated at Checkout</span>
                </div>
              </div>
              
              <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
                <span className="text-xs font-black text-stone-900 uppercase tracking-wider">Total</span>
                <span className="text-xl font-poppins font-black text-[#2E7D32]">
                  {subtotalData.formatted} {user?.currency?.toUpperCase() || 'INR'}
                </span>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={actionLoading || isOverCapacity}
                  className={`w-full bg-white border-2 font-poppins text-xs font-black py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group ${
                    isOverCapacity ? 'border-stone-300 text-stone-400 opacity-50 blur-[1px] cursor-not-allowed' : 'border-[#2E7D32] hover:bg-stone-50 text-[#2E7D32]'
                  }`}
                >
                  {actionLoading ? 'ADDING...' : 'ADD TO CART'}
                  <ShoppingBag className={`w-4 h-4 transition-transform ${isOverCapacity ? '' : 'group-hover:scale-110'}`} />
                </button>

                {!showConfigurator && (
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('spec-sheet');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-poppins text-xs font-black py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    VIEW TESTING REPORT
                    <FileText className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => showConfigurator ? handleProceedToCheckout() : setShowConfigurator(true)}
                  disabled={actionLoading || (showConfigurator && isOverCapacity)}
                  className={`w-full font-poppins text-xs font-black py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group ${
                    showConfigurator && isOverCapacity 
                      ? 'bg-stone-300 text-stone-500 opacity-50 blur-[1px] cursor-not-allowed'
                      : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-[#2E7D32]/10'
                  }`}
                >
                  {actionLoading ? 'PROCESSING...' : (showConfigurator ? 'PROCEED TO CHECKOUT' : 'BUY NOW')}
                  <ChevronRight className={`w-4 h-4 transition-transform ${showConfigurator && isOverCapacity ? '' : 'group-hover:translate-x-0.5'}`} />
                </button>
              </div>
              
              <p className="text-[9px] font-extrabold text-stone-400 text-center uppercase tracking-widest pt-1">
                Secure SSL Encrypted Checkout
              </p>
            </div>

            {/* Spec Sheet Table */}
            <div id="spec-sheet" className="space-y-3 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2E7D32]" />
                <h3 className="font-poppins font-bold text-xs uppercase tracking-wider text-stone-800">
                  Verified Specification Report
                </h3>
              </div>
              <div className="bg-[#F7F9F7] border border-stone-200/50 rounded-2xl overflow-hidden shadow-inner">
                <table className="w-full text-xs text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-stone-200/40">
                      <td className="px-4 py-3 font-semibold text-stone-500 w-1/3">EC Runoff</td>
                      <td className="px-4 py-3 font-bold text-stone-900">{product.specifications?.ec || '< 0.5 mS/cm'}</td>
                    </tr>
                    <tr className="border-b border-stone-200/40 bg-stone-50/55">
                      <td className="px-4 py-3 font-semibold text-stone-500">pH Level</td>
                      <td className="px-4 py-3 font-bold text-stone-900">{product.specifications?.ph || '5.5 - 6.5'}</td>
                    </tr>
                    <tr className="border-b border-stone-200/40">
                      <td className="px-4 py-3 font-semibold text-stone-500">Moisture Content</td>
                      <td className="px-4 py-3 font-bold text-stone-900">{product.specifications?.moisture || '< 20%'}</td>
                    </tr>
                    <tr className="border-b border-stone-200/40 bg-stone-50/55">
                      <td className="px-4 py-3 font-semibold text-stone-500">Expansion Volume</td>
                      <td className="px-4 py-3 font-bold text-stone-900">{product.specifications?.expansionVolume || '15 Liters/kg'}</td>
                    </tr>
                    <tr className="border-b border-stone-200/40">
                      <td className="px-4 py-3 font-semibold text-stone-500">Compression Ratio</td>
                      <td className="px-4 py-3 font-bold text-stone-900">{product.specifications?.compressionRatio || '5:1'}</td>
                    </tr>
                    <tr className="border-b border-stone-200/40 bg-stone-50/55">
                      <td className="px-4 py-3 font-semibold text-stone-500">Fiber Length</td>
                      <td className="px-4 py-3 font-bold text-stone-900">{product.specifications?.fiberLength || 'Under 2cm'}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-4 py-3 font-semibold text-stone-500">Sand Content</td>
                      <td className="px-4 py-3 font-bold text-stone-900">{product.specifications?.sandContent || '< 2%'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Premium 3D Container Viewer Section */}
      {showConfigurator && (
        <div className="bg-white rounded-[28px] border border-stone-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
          <div className="p-6 sm:p-8 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-stone-50 to-white">
           <div>
             <h2 className="font-poppins font-black text-xl text-stone-900 uppercase tracking-wide">
               Container Capacity Configurator
             </h2>
             <p className="text-stone-500 font-semibold text-xs mt-1">
               Visualize your shipment before checkout
             </p>
           </div>
           
           <div className="flex gap-4 items-center bg-white border border-stone-200 rounded-xl p-2 shadow-sm">
             <div className="px-3">
               <span className="block text-[9px] text-stone-400 font-bold uppercase tracking-wider">Loaded</span>
               <span className="block text-sm font-black text-stone-900">{totalQuantity} / {currentCapacity}</span>
             </div>
             <div className="w-px h-8 bg-stone-100"></div>
             <div className="px-3">
               <span className="block text-[9px] text-stone-400 font-bold uppercase tracking-wider">Usage</span>
               <span className={`block text-sm font-black ${isOverCapacity ? 'text-red-500' : 'text-[#2E7D32]'}`}>
                 {capacityPercentage.toFixed(0)}%
               </span>
             </div>
           </div>
        </div>
        
        <div className="relative w-full">
          <ContainerViewer3D containerType={containerType} totalQuantity={totalQuantity} autoRotate={true} palletItems={palletItems} />
          
          {/* Glass Overlay UI matching request */}
          <div className="absolute top-6 left-6 pointer-events-none">
            <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-5 w-64">
              <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-200/50 pb-2">
                Live Usage
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Pallets</span>
                    <span className="text-sm font-black text-stone-900">{totalQuantity} / {currentCapacity}</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverCapacity ? 'bg-red-500' : capacityPercentage > 80 ? 'bg-orange-500' : 'bg-[#2E7D32]'
                      }`}
                      style={{ width: `${capacityPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Detailed Description, Benefits, and Applications */}
      <div className="bg-white rounded-[28px] border border-stone-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)] p-6 sm:p-8 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Description & Benefits */}
          <div className="space-y-5">
            <div>
              <h3 className="font-poppins font-extrabold text-sm text-stone-900 uppercase tracking-wide">
                Product Description
              </h3>
              <p className="text-xs font-semibold text-stone-600 leading-relaxed mt-2.5">
                {product.description}
              </p>
            </div>

            {product.benefits?.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="font-poppins font-extrabold text-sm text-stone-900 uppercase tracking-wide">
                  Agronomical Benefits
                </h3>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-600 font-semibold">
                      <div className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Package, Stock, & Applications */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-stone-200/50 rounded-xl p-4 bg-stone-50/50">
                <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">Packaging Size</span>
                <span className="text-xs font-poppins font-black text-stone-800 mt-1 block">
                  {product.packageSize}
                </span>
              </div>
              <div className="border border-stone-200/50 rounded-xl p-4 bg-stone-50/50">
                <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">Availability</span>
                <span className="text-xs font-poppins font-black text-stone-800 mt-1 block">
                  {product.stock > 0 ? `${product.stock} container loads` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {product.applications?.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="font-poppins font-extrabold text-sm text-stone-900 uppercase tracking-wide">
                  Recommended Applications
                </h3>
                <ul className="space-y-2">
                  {product.applications.map((app, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-600 font-semibold">
                      <div className="w-5 h-5 rounded-full bg-[#F5F5F5] text-stone-600 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-3 h-3" />
                      </div>
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="space-y-5">
          <h2 className="font-poppins font-black text-lg text-stone-900">
            You May Also Be Interested In
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((item) => {
              const itemPrice = convertCurrency(item.price, user?.currency || 'INR');
              return (
                <div 
                  key={item._id} 
                  onClick={() => {
                    navigate(`/account/product/${item._id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white border border-stone-200 hover:border-[#2E7D32] rounded-[22px] p-4.5 cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-full group"
                >
                  <div>
                    <div className="h-40 rounded-[16px] overflow-hidden bg-[#F7F9F7] mb-3.5 border border-stone-100 flex-shrink-0">
                      <img 
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                      />
                    </div>
                    <span className="text-[9px] text-[#2E7D32] font-extrabold uppercase tracking-wider block mb-1">
                      {item.category}
                    </span>
                    <h3 className="font-poppins font-bold text-xs text-stone-900 line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                    <span className="text-xs text-[#2E7D32] font-poppins font-extrabold">
                      {itemPrice.formatted}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold">
                      View details
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductView;
