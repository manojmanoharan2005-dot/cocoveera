/**
 * File: frontend/src/pages/account/ProductView.jsx
 * Purpose: React page component representing the ProductView view.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Star, ShoppingBag, Check, 
  Droplet, Wind, ShieldCheck, FileText, ChevronRight,
  Plus, Minus, Info, AlertCircle, Sparkles, Package, CheckCircle2, Home, Beaker
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import { ContainerViewer3D } from '../../components/3d/ContainerViewer3D';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import SEO from '../../components/SEO';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();

  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(0.25);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');
  const [containerType, setContainerType] = useState('20FT');
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [extraItems, setExtraItems] = useState([]);

  // Debounced viewer state to prevent UI freezing (hanging) when quantity changes rapidly
  const [viewerQuantity, setViewerQuantity] = useState(0.25);
  const [viewerPallets, setViewerPallets] = useState([]);

  // Testing Feature States
  const [isTestingModalOpen, setIsTestingModalOpen] = useState(false);
  const [testingPackages, setTestingPackages] = useState([]);
  const [selectedTestingPackage, setSelectedTestingPackage] = useState(null);
  const [testingLoading, setTestingLoading] = useState(false);

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

    const fetchTestingPackages = async () => {
      try {
        const res = await apiClient.get('/testing/packages');
        if (res.data.success) {
          setTestingPackages(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch testing packages:', err);
      }
    };

    fetchProductDetails();
    fetchTestingPackages();
  }, [id, user]);

  // Update 3D viewer state with a debounce so the UI (buttons/percentage bar) won't lag
  useEffect(() => {
    if (!product) return;
    const currentTotalQty = quantity + extraItems.reduce((acc, item) => acc + item.quantity, 0);
    const currentPalletItems = [{ product, quantity }, ...extraItems];
    
    const t = setTimeout(() => {
      setViewerQuantity(currentTotalQty);
      setViewerPallets(currentPalletItems);
    }, 250);
    return () => clearTimeout(t);
  }, [quantity, extraItems, product]);

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
      localStorage.setItem('preferredContainer', containerType === '40FT' ? '40FT Container' : '20FT Container');
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
      localStorage.setItem('preferredContainer', containerType === '40FT' ? '40FT Container' : '20FT Container');
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

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleTestingPayment = async () => {
    if (!selectedTestingPackage) return;
    setTestingLoading(true);

    try {
      // Create testing order
      const res = await apiClient.post('/testing/orders', {
        productId: product._id,
        packageId: selectedTestingPackage._id,
        gateway: 'razorpay'
      });

      if (!res.data.success) throw new Error('Failed to initiate payment');

      const { id, amount, currency, testingOrderId, gateway } = res.data;

      if (gateway === 'mock' || id.startsWith('mock_')) {
        await apiClient.post('/testing/orders/confirm', {
          testingOrderId,
          paymentId: id,
          gateway,
          status: 'success'
        });
        setIsTestingModalOpen(false);
        navigate('/account/testing-reports');
        return;
      }

      const resLoad = await loadRazorpay();
      if (!resLoad) {
        alert('Razorpay SDK failed to load. Are you online?');
        setTestingLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock',
        amount: amount.toString(),
        currency: currency,
        name: 'Cocoveera Quality Testing',
        description: `Testing Fee for ${product.name}`,
        order_id: id,
        handler: async function (response) {
          try {
            await apiClient.post('/testing/orders/confirm', {
              testingOrderId,
              paymentId: response.razorpay_payment_id,
              gateway: 'razorpay',
              status: 'success'
            });
            setIsTestingModalOpen(false);
            navigate('/account/testing-reports');
          } catch (err) {
            console.error(err);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#2E7D32',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert('Payment Failed');
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      alert('Error initiating payment');
    } finally {
      setTestingLoading(false);
    }
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
      <div className="max-w-2xl py-12 px-6 text-center space-y-4">
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
  const totalQuantity = quantity + extraItems.reduce((acc, item) => acc + item.quantity, 0);
  const isWholeContainer = Number.isInteger(totalQuantity) && totalQuantity >= 1;
  const capacityPercentage = isWholeContainer ? 100 : ((totalQuantity % 1) * 100);
  const remainingForNextFull = isWholeContainer ? 0 : (1 - (totalQuantity % 1));
  const isOverCapacity = false; // No longer applicable as they can order multiple containers
  const palletItems = [{ product, quantity }, ...extraItems];

  const getPiecesForContainer = (cType, palletCount = 300) => {
    if (!cType) return 10 * palletCount;
    if (cType.includes('40FT')) return 22 * palletCount;
    return 10 * palletCount;
  };

  const mainPieces = quantity * getPiecesForContainer(containerType, product?.palletCount);
  let totalPieces = mainPieces;

  const extraSubtotal = extraItems.reduce((acc, item) => {
    const extraPieces = item.quantity * getPiecesForContainer(containerType, item.product?.palletCount);
    totalPieces += extraPieces;
    return acc + (item.product?.price * extraPieces);
  }, 0);

  const subtotalValue = (product.price * mainPieces) + extraSubtotal;
  const subtotalData = convertCurrency(subtotalValue, user?.currency || 'INR');

  const imagesList = product.images?.length > 0 ? product.images : [
    'https://placehold.co/600x600/eeeeee/999999?text=Image+Not+Available'
  ];

  return (
    <div className="max-w-6xl space-y-8 pb-28 lg:pb-16">
      <SEO 
        title={product.name}
        description={product.description?.substring(0, 160) || `Buy premium ${product.name} at Cocoveera.`}
        url={`/account/productview/${product._id}`}
        image={product.images?.[0]?.url || product.image}
      />
      
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
        <div className="flex items-center gap-2 text-sm sm:text-base font-poppins font-extrabold min-w-0 flex-1">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-stone-600 hover:text-[#2E7D32] transition-colors shrink-0">
            <Home className="w-4 h-4 sm:w-[18px] sm:h-[18px] mb-0.5" />
            <span className="inline">Marketplace</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 shrink-0" />
          <span 
            onClick={() => navigate(`/dashboard?category=${encodeURIComponent(product.category)}`)}
            className="text-stone-600 hover:text-[#2E7D32] transition-colors cursor-pointer shrink-0 truncate max-w-[120px] sm:max-w-[200px]"
          >
            {product.category}
          </span>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 shrink-0" />
          <span className="text-[#2E7D32] truncate">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main product layout */}
      <div className="bg-white rounded-[28px] border border-stone-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)] p-6 sm:p-8 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Image Gallery */}
          <div className="lg:col-span-5 space-y-4">
            {/* Desktop 3D Viewer */}
            {showConfigurator && (
              <div className="hidden lg:flex bg-white rounded-[24px] border border-stone-200/50 shadow-sm overflow-hidden flex-col h-[400px]">
                <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                  <h3 className="font-poppins font-black text-xs text-stone-900 uppercase tracking-wide">
                    Live 3D Preview
                  </h3>
                  <div className="px-2 py-1 bg-white rounded-lg border border-stone-200 shadow-sm flex items-center gap-2">
                    <span className="text-[9px] font-bold text-stone-400 uppercase">Usage</span>
                    <span className={`text-xs font-black ${isOverCapacity ? 'text-red-500' : 'text-[#2E7D32]'}`}>
                      {capacityPercentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="relative flex-1 w-full bg-[#F7F9F7]">
                  <ContainerViewer3D containerType={containerType} totalQuantity={viewerQuantity} autoRotate={true} palletItems={viewerPallets} />
                </div>
              </div>
            )}

            <div className={`h-72 sm:h-96 rounded-[24px] overflow-hidden bg-[#F7F9F7] border border-stone-200/50 shadow-sm relative group`}>
              <ImageWithFallback 
                src={imagesList[activeImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105" 
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
                    className={`relative w-20 h-20 rounded-[16px] overflow-hidden bg-stone-50 border cursor-pointer hover:border-[#2E7D32] transition-colors shrink-0 ${
                      i === activeImageIndex ? 'border-2 border-[#2E7D32]' : 'border-stone-200'
                    }`}
                  >
                    <ImageWithFallback 
                      src={img} 
                      alt={`thumbnail ${i}`} 
                      className="w-full h-full object-contain mix-blend-multiply" 
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Certifications and special notes */}
            <div className={`grid grid-cols-2 gap-3 text-xs font-bold text-stone-600 bg-stone-50 border border-stone-100 p-4 rounded-[20px] mt-6 ${showConfigurator ? 'hidden lg:grid' : ''}`}>
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
              <div id="container-configurator" className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden space-y-6 mb-6">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="text-xs font-black text-stone-900 uppercase tracking-widest font-poppins flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#2E7D32]" />
                    Container Configuration
                  </h3>
                  <div className="bg-[#2E7D32]/10 text-[#2E7D32] px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider">
                    Step 1
                  </div>
                </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Container Type Selection */}
                  <div className="space-y-2.5 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Select Size</span>
                    <div className="flex gap-2 sm:gap-3 h-full max-h-[64px]">
                      <button 
                        type="button"
                        onClick={() => setContainerType('20FT')}
                        className={`relative flex-1 py-3 sm:py-3.5 rounded-2xl transition-all duration-300 border-2 overflow-hidden group ${
                          containerType === '20FT' 
                            ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-md shadow-[#2E7D32]/10 scale-[1.02]' 
                            : 'border-stone-100 bg-stone-50 hover:border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {containerType === '20FT' && <div className="absolute top-0 right-0 w-8 h-8 bg-[#2E7D32] rounded-bl-2xl flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                        <span className={`block text-xs sm:text-sm font-black uppercase tracking-wider transition-colors ${containerType === '20FT' ? 'text-[#2E7D32]' : 'text-stone-600'}`}>20FT FCL</span>
                        <span className="block text-[9px] sm:text-[10px] font-semibold text-stone-500 mt-0.5">Standard</span>
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => setContainerType('40FT')}
                        className={`relative flex-1 py-3 sm:py-3.5 rounded-2xl transition-all duration-300 border-2 overflow-hidden group ${
                          containerType === '40FT' 
                            ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-md shadow-[#2E7D32]/10 scale-[1.02]' 
                            : 'border-stone-100 bg-stone-50 hover:border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {containerType === '40FT' && <div className="absolute top-0 right-0 w-8 h-8 bg-[#2E7D32] rounded-bl-2xl flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                        <span className={`block text-xs sm:text-sm font-black uppercase tracking-wider transition-colors ${containerType === '40FT' ? 'text-[#2E7D32]' : 'text-stone-600'}`}>40FT FCL</span>
                        <span className="block text-[9px] sm:text-[10px] font-semibold text-stone-500 mt-0.5">High Vol</span>
                      </button>
                    </div>
                  </div>

                  {/* Adjust Quantity Control */}
                  <div className="space-y-2.5 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Fractional Quantity</span>
                    <div className="flex items-center justify-between bg-white border-2 border-stone-100 rounded-2xl p-1.5 sm:p-2 shadow-sm h-full max-h-[64px]">
                      <button 
                        type="button"
                        onClick={() => setQuantity(q => Math.max(0.25, q - 0.25))}
                        className="w-12 h-12 flex items-center justify-center text-stone-500 bg-stone-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 active:scale-95"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      
                      <div className="flex flex-col items-center justify-center px-4">
                        <span className="text-2xl font-poppins font-black text-stone-900 tracking-tight leading-none">
                          {quantity.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-1">Containers</span>
                      </div>

                      <button 
                        type="button"
                        onClick={() => setQuantity(q => q + 0.25)}
                        className="w-12 h-12 flex items-center justify-center text-stone-500 bg-stone-50 hover:bg-[#2E7D32]/10 hover:text-[#2E7D32] rounded-xl transition-all duration-200 active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Capacity Usage / Minimum Requirement Status */}
                <div className={`p-4 rounded-2xl border-2 transition-colors duration-500 ${!isWholeContainer ? 'bg-orange-50/50 border-orange-100' : 'bg-green-50/50 border-green-100'}`}>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5 ${!isWholeContainer ? 'text-orange-600' : 'text-[#2E7D32]'}`}>
                        {!isWholeContainer ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {!isWholeContainer ? 'Full Container Required' : 'Requirement Met'}
                      </p>
                      <p className="text-sm font-black text-stone-900 font-poppins">
                        Current Total: {totalQuantity.toFixed(2)} <span className="text-xs text-stone-500 font-bold">Containers</span>
                      </p>
                    </div>
                    <div className={`text-xl font-black font-poppins ${!isWholeContainer ? 'text-orange-500' : 'text-[#2E7D32]'}`}>
                      {capacityPercentage.toFixed(0)}%
                    </div>
                  </div>

                  <div className="relative w-full h-3 bg-stone-200/50 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
                        !isWholeContainer ? 'bg-orange-500' : 'bg-gradient-to-r from-[#43A047] to-[#2E7D32] shadow-[0_0_10px_rgba(46,125,50,0.5)]'
                      }`}
                      style={{ width: `${capacityPercentage}%` }}
                    />
                  </div>
                  {!isWholeContainer && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-orange-600 text-center">
                        Add {remainingForNextFull.toFixed(2)} more container to complete the next full container.
                      </p>
                      <p className="text-[9px] font-semibold text-orange-500 text-center mt-0.5 opacity-80">
                        Checkout is available only for full container quantities. Please complete the remaining container capacity.
                      </p>
                    </div>
                  )}
                </div>

              {/* 3D Container Preview (Mobile Only) */}
              <div className="lg:hidden relative w-full mt-4 border border-stone-200/50 rounded-2xl overflow-hidden shadow-sm">
                <ContainerViewer3D containerType={containerType} totalQuantity={viewerQuantity} autoRotate={true} palletItems={viewerPallets} />
              </div>

              {/* Mixed Load Section */}
              <div className="mt-4 border-t border-stone-100 pt-4">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Mix with other products</p>
                <div className="space-y-2 lg:max-h-[160px] lg:overflow-y-auto lg:pr-1">
                  {relatedProducts.map(relProduct => {
                    const existingExtra = extraItems.find(item => item.product._id === relProduct._id);
                    const relQuantity = existingExtra ? existingExtra.quantity : 0;
                    
                    return (
                      <div key={relProduct._id} className="flex items-center justify-between bg-stone-50 border border-stone-200/60 rounded-xl p-2">
                         <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-lg overflow-hidden relative">
                             <ImageWithFallback src={relProduct.images?.[0]} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                           </div>
                           <span className="text-[11px] font-bold text-stone-700 max-w-[120px] truncate">{relProduct.name}</span>
                         </div>
                         <div className="flex items-center bg-white border border-stone-250 rounded-lg p-0.5">
                           <button 
                             type="button"
                             onClick={() => {
                               setExtraItems(prev => {
                                 const existing = prev.find(p => p.product._id === relProduct._id);
                                 if (existing && existing.quantity > 0.25) {
                                   return prev.map(p => p.product._id === relProduct._id ? { ...p, quantity: p.quantity - 0.25 } : p);
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
                                   return prev.map(p => p.product._id === relProduct._id ? { ...p, quantity: p.quantity + 0.25 } : p);
                                 } else {
                                   return [...prev, { product: relProduct, quantity: 0.25 }];
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
              


              {/* INLINE CHECKOUT ACTIONS FOR CONFIGURATOR (Desktop Only) */}
              <div className="mt-4 border-t border-stone-100 pt-4 hidden lg:block">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black text-stone-900 uppercase tracking-wider">Total</span>
                  <span className="text-xl font-poppins font-black text-[#2E7D32]">
                    {subtotalData.formatted} {user?.currency?.toUpperCase() || 'INR'}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={actionLoading}
                    className={`flex-1 bg-white border-2 font-poppins text-xs font-black py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group border-[#2E7D32] hover:bg-stone-50 text-[#2E7D32]`}
                  >
                    {actionLoading ? 'ADDING...' : 'ADD TO CART'}
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    disabled={actionLoading || !isWholeContainer}
                    className={`flex-1 font-poppins text-xs font-black py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group ${
                      !isWholeContainer 
                        ? 'bg-stone-300 text-stone-500 opacity-50 blur-[1px] cursor-not-allowed'
                        : 'shadow-md bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-[#2E7D32]/10'
                    }`}
                  >
                    {actionLoading && isWholeContainer ? 'PROCESSING...' : 'CHECKOUT'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
            )}

            {/* ORDER SUMMARY CARD (Hidden when configurator is open) */}
            {!showConfigurator && (
              <div className="hidden lg:block bg-white rounded-[20px] p-6 border border-stone-200/80 shadow-sm relative overflow-hidden space-y-4">
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2.5 font-poppins">
                Order Summary
              </h3>
              
              <div className="space-y-3.5 text-xs font-bold text-stone-600">
                <div className="flex justify-between items-center">
                  <span>Total Containers</span>
                  <span className="text-stone-900 font-bold">{totalQuantity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Pieces</span>
                  <span className="text-stone-900 font-bold">{Math.round(totalPieces).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
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

              <div className="flex flex-col gap-2.5 mt-4">
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={actionLoading}
                    className={`flex-1 bg-white border-2 font-poppins text-[10px] font-black py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 group border-[#2E7D32] hover:bg-stone-50 text-[#2E7D32]`}
                  >
                    {actionLoading ? 'ADDING...' : 'ADD TO CART'}
                    <ShoppingBag className={`w-3.5 h-3.5 transition-transform group-hover:scale-110`} />
                  </button>

                  {(!showConfigurator || isWholeContainer) && (
                    <button
                      type="button"
                      onClick={() => showConfigurator ? handleProceedToCheckout() : setShowConfigurator(true)}
                      disabled={actionLoading || (showConfigurator && isOverCapacity)}
                      className={`flex-1 font-poppins text-[10px] font-black py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 group ${
                        showConfigurator && isOverCapacity 
                          ? 'bg-stone-300 text-stone-500 opacity-50 blur-[1px] cursor-not-allowed'
                          : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-[#2E7D32]/10'
                      }`}
                    >
                      {actionLoading ? 'WAIT...' : (showConfigurator ? 'CHECKOUT' : 'BUY NOW')}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showConfigurator && isOverCapacity ? '' : 'group-hover:translate-x-0.5'}`} />
                    </button>
                  )}
                </div>

                {!showConfigurator && (
                  <button
                    type="button"
                    onClick={() => setIsTestingModalOpen(true)}
                    className="w-full bg-[#2E7D32]/10 hover:bg-[#2E7D32]/20 text-[#2E7D32] font-poppins text-[10px] font-black py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    TEST NOW
                    <Beaker className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <p className="text-[9px] font-extrabold text-stone-400 text-center uppercase tracking-widest pt-1">
                Secure SSL Encrypted Checkout
              </p>
            </div>
            )}

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {relatedProducts.map((item) => {
              const itemPrice = convertCurrency(item.price, user?.currency || 'INR');
              return (
                <div 
                  key={item._id} 
                  onClick={() => {
                    navigate(`/account/product/${item._id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white border border-stone-200 hover:border-[#2E7D32] rounded-[22px] p-4 sm:p-5 cursor-pointer hover:shadow-md transition-all flex flex-col group overflow-hidden"
                >
                  <div className="flex flex-col flex-grow">
                    <div className="relative h-40 sm:h-48 rounded-[16px] overflow-hidden bg-[#F7F9F7] mb-4 border border-stone-100 flex-shrink-0">
                      <ImageWithFallback 
                        src={item.images?.[0]} 
                        alt={item.name} 
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" 
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-[#2E7D32] font-extrabold uppercase tracking-wider block mb-1.5">
                      {item.category}
                    </span>
                    <h3 className="font-poppins font-bold text-xs sm:text-sm text-stone-900 line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                  </div>
                  <div className="mt-4 sm:mt-5 flex items-center justify-between border-t border-stone-100 pt-3 sm:pt-4">
                    <span className="text-sm sm:text-base text-[#2E7D32] font-poppins font-extrabold">
                      {itemPrice.formatted}
                    </span>
                    <span className="text-[10px] sm:text-xs text-stone-400 font-bold group-hover:text-[#2E7D32] transition-colors">
                      View details
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white border-t border-stone-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-50 lg:hidden flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 items-center backdrop-blur-md bg-white/95">
        <div className="w-full sm:flex-1 flex sm:flex-col justify-between sm:justify-center items-center sm:items-start px-1 sm:px-0">
          <span className="text-stone-500 text-[9px] font-extrabold uppercase tracking-wider block sm:mb-0.5">Subtotal</span>
          <span className="text-sm font-poppins font-black text-[#2E7D32] leading-none">{subtotalData.formatted}</span>
        </div>
        <div className="flex gap-2 w-full sm:flex-[2]">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={actionLoading || isOverCapacity}
            className="flex-1 bg-white border-2 border-[#2E7D32] text-[#2E7D32] font-poppins text-[10px] font-black py-2.5 sm:py-3 rounded-xl flex items-center justify-center shadow-sm disabled:opacity-50 disabled:border-stone-300 disabled:text-stone-400"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span className="truncate">CART</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (showConfigurator) {
                handleProceedToCheckout();
              } else {
                setShowConfigurator(true);
                setTimeout(() => {
                  const el = document.getElementById('container-configurator');
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }, 100);
              }
            }}
            disabled={actionLoading || (showConfigurator && !isWholeContainer)}
            className={`flex-1 font-poppins text-[10px] font-black py-2.5 sm:py-3 rounded-xl flex items-center justify-center transition-colors ${
              showConfigurator && !isWholeContainer
                ? 'bg-stone-300 text-stone-500 opacity-50 blur-[1px] cursor-not-allowed'
                : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-md shadow-[#2E7D32]/20 disabled:opacity-50 disabled:bg-stone-300 disabled:shadow-none'
            }`}
          >
            <span className="truncate">{showConfigurator ? 'CHECKOUT' : 'BUY'}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* Testing Modal */}
      <AnimatePresence>
        {isTestingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-stone-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-poppins font-black text-lg text-stone-900">Professional Quality Testing</h3>
                  <p className="text-xs font-semibold text-stone-500">NABL / Technical Lab Verification</p>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="bg-stone-50 rounded-2xl p-4 mb-6 border border-stone-100 flex items-center gap-4">
                  <img src={product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover bg-white shadow-sm" />
                  <div>
                    <p className="text-sm font-bold text-stone-900">{product.name}</p>
                    <p className="text-[10px] font-semibold text-stone-500 mt-0.5">Category: {product.category}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest">Select Testing Package</h4>
                  {testingPackages.map((pkg) => (
                    <div 
                      key={pkg._id}
                      onClick={() => setSelectedTestingPackage(pkg)}
                      className={`cursor-pointer rounded-2xl border-2 transition-all p-4 ${
                        selectedTestingPackage?._id === pkg._id 
                          ? 'border-[#2E7D32] bg-[#2E7D32]/5' 
                          : 'border-stone-100 bg-white hover:border-stone-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedTestingPackage?._id === pkg._id ? 'border-[#2E7D32]' : 'border-stone-300'
                          }`}>
                            {selectedTestingPackage?._id === pkg._id && <div className="w-2 h-2 rounded-full bg-[#2E7D32]" />}
                          </div>
                          <span className="font-poppins font-bold text-sm text-stone-900">{pkg.name}</span>
                        </div>
                        <span className="font-poppins font-black text-[#2E7D32]">₹{pkg.price}</span>
                      </div>
                      {pkg.description && (
                        <p className="text-xs text-stone-500 font-semibold pl-6 mb-2 whitespace-pre-wrap">
                          {pkg.description}
                        </p>
                      )}
                      <div className="pl-6 flex items-center gap-1.5 text-[10px] font-bold text-stone-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Estimated Delivery: {pkg.deliveryDays} Days
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-stone-100 bg-stone-50">
                {selectedTestingPackage ? (
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-stone-600">
                      <span>Testing Fee</span>
                      <span>₹{selectedTestingPackage.price}</span>
                    </div>
                    <div className="flex justify-between text-sm font-poppins font-black text-stone-900">
                      <span>Total Amount</span>
                      <span>₹{selectedTestingPackage.price}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 text-center mb-4 font-semibold">Please select a package to proceed</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsTestingModalOpen(false);
                      setSelectedTestingPackage(null);
                    }}
                    className="flex-1 bg-white border-2 border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 font-poppins text-xs font-bold py-3.5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTestingPayment}
                    disabled={!selectedTestingPackage || testingLoading}
                    className="flex-[2] bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-xs font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {testingLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductView;
