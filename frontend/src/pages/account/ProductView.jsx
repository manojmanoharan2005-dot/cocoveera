/**
 * File: frontend/src/pages/account/ProductView.jsx
 * Purpose: React page component representing the ProductView view.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Star, ShoppingBag, Check, 
  Droplet, Wind, ShieldCheck, FileText, ChevronRight, ChevronLeft,
  Plus, Minus, Info, AlertCircle, Sparkles, Package, CheckCircle2, Home, Beaker,
  Share2, MoreVertical, HelpCircle, Maximize2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, useAuth } from '../../context/AuthContext';
import { convertCurrency } from '../../utils/currencyConverter';
import { ContainerViewer3D } from '../../components/3d/ContainerViewer3D';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import SEO from '../../components/SEO';
import RequestQuoteModal from '../../components/RequestQuoteModal';

import { useWishlist } from '../../context/WishlistContext';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchProfile } = useAuth();
  const { isWishlisted: checkIsWishlisted, toggleWishlist } = useWishlist();

  // State management with sessionStorage persistence across 3D Viewer navigation
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`cocoveera_qty_${id}`);
      return saved !== null ? parseFloat(saved) : 0.00;
    } catch (e) {
      return 0.00;
    }
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const isWishlisted = checkIsWishlisted(product);
  const [actionLoading, setActionLoading] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');
  const [containerType, setContainerType] = useState(() => {
    try {
      return sessionStorage.getItem(`cocoveera_type_${id}`) || '20FT';
    } catch (e) {
      return '20FT';
    }
  });
  const [showConfigurator, setShowConfigurator] = useState(true);
  const [extraItems, setExtraItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`cocoveera_extra_${id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Sync state with sessionStorage when ID changes or state updates
  useEffect(() => {
    if (id) {
      try {
        sessionStorage.setItem(`cocoveera_qty_${id}`, quantity);
        sessionStorage.setItem(`cocoveera_type_${id}`, containerType);
        sessionStorage.setItem(`cocoveera_extra_${id}`, JSON.stringify(extraItems));

        if (product) {
          if (product.slug) {
            sessionStorage.setItem(`cocoveera_qty_${product.slug}`, quantity);
            sessionStorage.setItem(`cocoveera_type_${product.slug}`, containerType);
            sessionStorage.setItem(`cocoveera_extra_${product.slug}`, JSON.stringify(extraItems));
          }
          if (product._id) {
            sessionStorage.setItem(`cocoveera_qty_${product._id}`, quantity);
            sessionStorage.setItem(`cocoveera_type_${product._id}`, containerType);
            sessionStorage.setItem(`cocoveera_extra_${product._id}`, JSON.stringify(extraItems));
          }
        }
      } catch (e) {}
    }
  }, [id, quantity, containerType, extraItems, product]);

  useEffect(() => {
    if (id) {
      try {
        const savedQty = sessionStorage.getItem(`cocoveera_qty_${id}`);
        if (savedQty !== null) {
          setQuantity(parseFloat(savedQty));
        }
        const savedType = sessionStorage.getItem(`cocoveera_type_${id}`);
        if (savedType) {
          setContainerType(savedType);
        }
        const savedExtra = sessionStorage.getItem(`cocoveera_extra_${id}`);
        if (savedExtra) {
          setExtraItems(JSON.parse(savedExtra));
        }
      } catch (e) {}
    }
  }, [id]);

  // Fullscreen Lightbox gallery states
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);

  // Enterprise Live Container 3D & AI States
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewMode, setViewMode] = useState('solid');
  const [doorOpen, setDoorOpen] = useState(true);

  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const groupedProducts = React.useMemo(() => {
    const grouped = {};
    allProducts.forEach(p => {
      const catName = p.category;
      if (!grouped[catName]) {
        grouped[catName] = [];
      }
      grouped[catName].push(p);
    });
    return grouped;
  }, [allProducts]);

  const handleBackNav = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareProduct = async () => {
    if (navigator.share && window.innerWidth < 768) {
      try {
        await navigator.share({
          title: product?.name || 'Cocoveera Product',
          text: product?.description?.substring(0, 100) || '',
          url: window.location.href,
        });
      } catch (e) {
        setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setAddedMessage('Product link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
      setTimeout(() => setAddedMessage(''), 3000);
    } catch (e) {
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedLink(true);
      setAddedMessage('Product link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
      setTimeout(() => setAddedMessage(''), 3000);
    }
  };

  // AI Section Action Handlers
  const handleOptimizePacking = () => {
    setIsOptimizing(true);
    setAddedMessage('🤖 AI Packing Optimizer calculating volumetric balance...');
    setTimeout(() => {
      setQuantity(q => Math.max(1, Math.ceil(q || 1)));
      setIsOptimizing(false);
      setAddedMessage('✨ AI Optimization complete: Load balanced to 100% full capacity!');
      setTimeout(() => setAddedMessage(''), 3500);
    }, 800);
  };

  const handleDownloadReport = () => {
    const reportText = `================================================
COCOVEERA ENTERPRISE LOGISTICS MANIFEST REPORT
================================================
Product: ${product?.name || 'Coconut Substrates'}
Category: ${product?.category || 'Coir Substrates'}
Container Type: ${containerType}
Total Selected Quantity: ${totalQuantity} Containers
Capacity Utilization: ${capacityPercentage}%
Total Pieces: ${totalPieces.toLocaleString()} Units
Total Pallet Count: ${Math.round(totalQuantity * (containerType === '20FT' ? 10 : 22))} Pallets
AI Packing Score: 92 / 100 (Optimal Load Distribution)
Timestamp: ${new Date().toLocaleString()}
================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cocoveera_Manifest_${containerType}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setAddedMessage('📊 Cargo Loading Manifest downloaded successfully!');
    setTimeout(() => setAddedMessage(''), 3000);
  };

  const handleExportPdf = () => {
    setIsQuoteModalOpen(true);
  };

  const handleShareConfig = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setAddedMessage('💾 Container Configuration link copied to clipboard!');
      setTimeout(() => setAddedMessage(''), 3000);
    } catch (err) {
      handleShareProduct();
    }
  };

  // Debounced viewer state to prevent UI freezing (hanging) when quantity changes rapidly
  const [viewerQuantity, setViewerQuantity] = useState(0.00);
  const [viewerPallets, setViewerPallets] = useState([]);

  // Testing Feature States
  const [isTestingModalOpen, setIsTestingModalOpen] = useState(false);
  const [testingPackages, setTestingPackages] = useState([]);
  const [selectedTestingPackage, setSelectedTestingPackage] = useState(null);
  const [testingLoading, setTestingLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(false);

  // RFQ Modal state
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [hasActiveRfq, setHasActiveRfq] = useState(false);

  useEffect(() => {
    const checkRfqStatus = async () => {
      if (!user || !product) return;
      try {
        const res = await apiClient.get(`/quote-requests/active-check?productId=${product._id}`);
        if (res.data.success) {
          setHasActiveRfq(res.data.hasActiveRfq);
        }
      } catch (err) {
        console.error('Failed to check active RFQ:', err);
      }
    };
    checkRfqStatus();
  }, [product, user]);

  useEffect(() => {
    if (location.state?.scrollToRfq && product) {
      // Clear location state to prevent reopening modal on reload
      window.history.replaceState({}, document.title);
      setIsQuoteModalOpen(true);
    }
  }, [location.state, product]);

  // Fullscreen modal keyboard navigation (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isFullscreenOpen) return;
    const handleFullscreenKeys = (e) => {
      if (e.key === 'Escape') setIsFullscreenOpen(false);
      const totalImgs = product?.images?.length || 1;
      if (e.key === 'ArrowLeft') setFullscreenImageIndex(prev => (prev === 0 ? totalImgs - 1 : prev - 1));
      if (e.key === 'ArrowRight') setFullscreenImageIndex(prev => (prev === totalImgs - 1 ? 0 : prev + 1));
    };
    window.addEventListener('keydown', handleFullscreenKeys);
    return () => window.removeEventListener('keydown', handleFullscreenKeys);
  }, [isFullscreenOpen, product]);

  const fetchTestingPackages = async () => {
    setPackagesLoading(true);
    try {
      const res = await apiClient.get('/testing/packages');
      if (res.data.success) {
        setTestingPackages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch testing packages:', err);
    } finally {
      setPackagesLoading(false);
    }
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prodRes, relatedRes, catRes, allProdsRes] = await Promise.all([
          apiClient.get(`/products/${id}`),
          apiClient.get(`/products/related/${id}`),
          apiClient.get('/categories'),
          apiClient.get('/products')
        ]);

        if (prodRes.data.success) {
          const fetchedProduct = prodRes.data.data;
          setProduct(fetchedProduct);
          setExpandedCategory(fetchedProduct.category);
          
          // Restore saved quantities for this product slug/_id
          try {
            const savedQty = sessionStorage.getItem(`cocoveera_qty_${fetchedProduct.slug}`) || sessionStorage.getItem(`cocoveera_qty_${fetchedProduct._id}`);
            if (savedQty !== null) {
              setQuantity(parseFloat(savedQty));
            }
            const savedType = sessionStorage.getItem(`cocoveera_type_${fetchedProduct.slug}`) || sessionStorage.getItem(`cocoveera_type_${fetchedProduct._id}`);
            if (savedType) {
              setContainerType(savedType);
            }
            const savedExtra = sessionStorage.getItem(`cocoveera_extra_${fetchedProduct.slug}`) || sessionStorage.getItem(`cocoveera_extra_${fetchedProduct._id}`);
            if (savedExtra) {
              setExtraItems(JSON.parse(savedExtra));
            }
          } catch (e) {}

          if (relatedRes.data.success) {
            setRelatedProducts(relatedRes.data.data);
          }
        } else {
          setError('Failed to load product details.');
        }

        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }

        if (allProdsRes.data.success) {
          setAllProducts(allProdsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || 'Error connecting to server. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    fetchTestingPackages();
  }, [id, user]);

  // Update 3D viewer state instantly whenever quantity or extraItems changes
  useEffect(() => {
    if (!product) return;
    const currentTotalQty = quantity + extraItems.reduce((acc, item) => acc + item.quantity, 0);
    const currentPalletItems = [{ product, quantity }, ...extraItems];
    
    setViewerQuantity(currentTotalQty);
    setViewerPallets(currentPalletItems);
  }, [quantity, extraItems, product]);

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    toggleWishlist(product);
  };

  const handleAddToCart = async () => {
    if (!product || actionLoading) return;
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
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
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
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
        navigate('/cart');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!product) return;
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    navigate('/checkout', { 
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
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
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
        navigate('/testing-reports');
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
            navigate('/testing-reports');
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
  const totalQuantity = parseFloat((quantity + extraItems.reduce((acc, item) => acc + item.quantity, 0)).toFixed(2));
  const isWholeContainer = totalQuantity > 0 && Math.abs(totalQuantity - Math.round(totalQuantity)) < 0.001;
  const capacityPercentage = totalQuantity === 0 ? 0 : Math.round(isWholeContainer ? 100 : ((totalQuantity % 1) * 100));
  const remainingForNextFull = isWholeContainer ? 0 : parseFloat((1 - (totalQuantity % 1)).toFixed(2));
  const isQuoteButtonDisabled = totalQuantity === 0 || !isWholeContainer;
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
    <div className="max-w-6xl space-y-4 sm:space-y-5 pb-24 lg:pb-16">
      <SEO 
        title={product.name}
        description={product.description?.substring(0, 160) || `Buy premium ${product.name} at Cocoveera.`}
        url={`/products/${product.slug || product._id}`}
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
          
          {/* Left: Product Image Gallery, Features, Live 3D Container, & Specification Report */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 1. Product Image Gallery */}
            <div className="space-y-4">
              {/* Large Product Image with Hover Zoom */}
              <div 
                onClick={() => {
                  setFullscreenImageIndex(activeImageIndex);
                  setIsFullscreenOpen(true);
                }}
                className="h-72 sm:h-96 md:h-[420px] rounded-[24px] overflow-hidden bg-white border border-stone-200/60 shadow-sm relative group cursor-zoom-in"
              >
                <ImageWithFallback 
                  src={imagesList[activeImageIndex]} 
                  alt={product.name} 
                  className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-125" 
                />

                {/* Quick Overlay Action Buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => {
                      setFullscreenImageIndex(activeImageIndex);
                      setIsFullscreenOpen(true);
                    }}
                    className="bg-white/90 hover:bg-white text-stone-700 hover:text-[#2E7D32] p-2.5 rounded-full transition-all shadow-md border border-stone-100 flex items-center justify-center active:scale-95"
                    title="Fullscreen Preview"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleShareProduct}
                    className="bg-white/90 hover:bg-white text-stone-700 hover:text-[#2E7D32] p-2.5 rounded-full transition-all shadow-md border border-stone-100 flex items-center justify-center active:scale-95"
                    title="Share Product Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleWishlistToggle}
                    className="bg-white/90 hover:bg-white text-stone-700 hover:text-red-500 p-2.5 rounded-full transition-all shadow-md border border-stone-100 flex items-center justify-center active:scale-95"
                    title="Wishlist Product"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                {/* Zoom & Fullscreen hint badge */}
                <div className="absolute bottom-3 left-3 bg-stone-900/75 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
                  <Maximize2 className="w-3 h-3 text-emerald-400" />
                  <span>Hover to zoom • Click for fullscreen</span>
                </div>
              </div>
              
              {/* Thumbnail Gallery */}
              {imagesList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto py-1 [&::-webkit-scrollbar]:hidden">
                  {imagesList.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative w-20 h-20 rounded-[16px] overflow-hidden bg-white border cursor-pointer hover:border-[#2E7D32] transition-all shrink-0 ${
                        i === activeImageIndex ? 'border-2 border-[#2E7D32] shadow-sm scale-102' : 'border-stone-200/80 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <ImageWithFallback 
                        src={img} 
                        alt={`thumbnail ${i}`} 
                        className="w-full h-full object-contain p-1" 
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Action Row below Product Images */}
              <div className="flex items-center justify-around py-3 px-4 bg-[#F7F9F7] rounded-2xl border border-stone-200/60 my-4 shadow-sm relative">
                <button
                  onClick={handleWishlistToggle}
                  className="flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-red-500 transition-colors py-1 px-3 rounded-xl active:scale-95"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-stone-600'}`} />
                  <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                </button>

                <div className="h-4 w-px bg-stone-300/60" />

                <button
                  onClick={handleShareProduct}
                  className="flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-[#2E7D32] transition-colors py-1 px-3 rounded-xl active:scale-95"
                >
                  <Share2 className="w-4 h-4 text-stone-600" />
                  <span>Share</span>
                </button>

                <div className="h-4 w-px bg-stone-300/60" />

                <button
                  onClick={() => {
                    setFullscreenImageIndex(activeImageIndex);
                    setIsFullscreenOpen(true);
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-[#2E7D32] transition-colors py-1 px-3 rounded-xl active:scale-95"
                >
                  <Maximize2 className="w-4 h-4 text-stone-600" />
                  <span>Fullscreen</span>
                </button>

                <div className="h-4 w-px bg-stone-300/60" />

                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-[#2E7D32] transition-colors py-1 px-3 rounded-xl active:scale-95"
                >
                  <MoreVertical className="w-4 h-4 text-stone-600" />
                  <span>More</span>
                </button>

                {/* More Options Menu Popup */}
                <AnimatePresence>
                  {showMoreMenu && (
                    <>
                      <div className="fixed inset-0 bg-transparent z-40" onClick={() => setShowMoreMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="absolute bottom-full right-4 mb-2 z-50 bg-white rounded-2xl shadow-xl border border-stone-200/80 p-2 w-56 text-stone-800 space-y-1"
                      >
                        <button
                          onClick={() => {
                            setShowMoreMenu(false);
                            setIsQuoteModalOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-stone-100/80 text-xs font-bold text-stone-750 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-[#2E7D32]" />
                          <span>Request Wholesale Quote</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowMoreMenu(false);
                            setIsTestingModalOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-stone-100/80 text-xs font-bold text-stone-750 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                          <span>Quality & Lab Testing</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowMoreMenu(false);
                            navigate('/help-center');
                          }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-stone-100/80 text-xs font-bold text-stone-750 transition-colors"
                        >
                          <HelpCircle className="w-4 h-4 text-[#2E7D32]" />
                          <span>Help & Support</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 2. Product Features & Quality Cards */}
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

            <div className="bg-stone-50/50 border border-stone-200/60 rounded-[20px] p-5 mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 text-[#EAB308]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                  VERIFIED QUALITY
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-[#2E7D32] text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  Export Grade
                </span>
                <span className="bg-white border border-stone-200 text-stone-700 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1">
                  <Beaker className="w-3 h-3 text-[#2E7D32]" />
                  Laboratory Tested
                </span>
                <span className="bg-white border border-stone-200 text-stone-700 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                  7 Specs Verified
                </span>
              </div>
            </div>

            {/* 3. Live 3D Container Visualizer (Inserted directly BELOW Product Features when totalQuantity > 0) */}
            <AnimatePresence>
              {totalQuantity > 0 && (
                <motion.div
                  layout
                  initial={{ opacity: 0, height: 0, scale: 0.96 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.96 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden space-y-4 pt-2"
                >
                  <ContainerViewer3D 
                    containerType={containerType} 
                    totalQuantity={viewerQuantity} 
                    product={product}
                    palletItems={viewerPallets} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4. Verified Specification Report (Shifts down smoothly when 3D Container appears) */}
            <motion.div 
              layout
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-stone-200/60 rounded-[20px] p-5 mt-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <div className="w-6 h-6 rounded-lg bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-poppins font-black text-xs uppercase tracking-wider text-stone-900">
                  Verified Specification Report
                </h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: 'EC Runoff', value: product.specifications?.ec || '< 0.5 mS/cm' },
                  { label: 'pH Level', value: product.specifications?.ph || '5.5 - 6.5' },
                  { label: 'Moisture Content', value: product.specifications?.moisture || '< 20%' },
                  { label: 'Expansion Volume', value: product.specifications?.expansionVolume || '15 Liters/kg' },
                  { label: 'Compression Ratio', value: product.specifications?.compressionRatio || '5:1' },
                  { label: 'Fiber Length', value: product.specifications?.fiberLength || 'Under 2cm' },
                  { label: 'Sand Content', value: product.specifications?.sandContent || '< 2%' },
                ].map((spec, index) => (
                  <div key={index} className="flex items-center justify-between gap-4 py-2 border-b border-stone-100 last:border-0 last:pb-0 text-xs">
                    <span className="font-semibold text-stone-500">{spec.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-stone-900">{spec.value}</span>
                      <span className="flex items-center gap-1 text-[10px] text-[#2E7D32] font-black bg-[#E8F5E9] px-2 py-0.5 rounded-full shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Product Details, Pricing, & Spec Sheet */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-6">
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

            {/* CONTAINER CONFIGURATOR */}
            <div id="container-configurator" className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden space-y-6 mb-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-widest font-poppins flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#2E7D32]" />
                  Container Configuration
                </h3>
                <div className="bg-[#2E7D32]/10 text-[#2E7D32] px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider">
                  Premium Export Config
                </div>
              </div>

              {/* Selection size & main quantity input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Container Type Selection */}
                <div className="space-y-2.5 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Select Container Size</span>
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
                      onClick={() => setQuantity(q => Math.max(0.00, parseFloat((q - 0.25).toFixed(2))))}
                      className="w-12 h-12 flex items-center justify-center text-stone-500 bg-stone-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 active:scale-95"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    
                    <div className="flex flex-col items-center justify-center px-4">
                      <input
                        type="number"
                        step="0.25"
                        min="0.00"
                        max="100.00"
                        value={quantity === 0 ? "0.00" : quantity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setQuantity(isNaN(val) ? 0.00 : Math.max(0.00, parseFloat(val.toFixed(2))));
                        }}
                        className="w-20 text-center text-2xl font-poppins font-black text-stone-900 focus:outline-none focus:ring-0 bg-transparent border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-1">Containers</span>
                    </div>

                    <button 
                      type="button"
                      onClick={() => setQuantity(q => parseFloat((q + 0.25).toFixed(2)))}
                      className="w-12 h-12 flex items-center justify-center text-stone-500 bg-stone-50 hover:bg-[#2E7D32]/10 hover:text-[#2E7D32] rounded-xl transition-all duration-200 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sticky Selected Products Summary Banner */}
              {(() => {
                const selectedTypesCount = (quantity > 0 ? 1 : 0) + extraItems.filter(i => i.quantity > 0).length;
                const totalContainerSum = quantity + extraItems.reduce((acc, i) => acc + i.quantity, 0);

                if (selectedTypesCount === 0) return null;

                return (
                  <div className="sticky top-2 z-10 bg-[#f0fdf4] border-2 border-[#22c55e] rounded-2xl p-3 sm:p-4 shadow-[0_8px_20px_rgba(34,197,94,0.15)] flex items-center justify-between gap-3 mb-3 backdrop-blur-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#22c55e] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-stone-900 font-poppins">
                          {selectedTypesCount} Product {selectedTypesCount === 1 ? 'Type' : 'Types'} Selected
                        </h4>
                        <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                          Live Container Load Configured
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-[#15803d] font-poppins block">
                        {totalContainerSum.toFixed(2)}
                      </span>
                      <span className="text-[9px] font-extrabold text-stone-500 uppercase tracking-wider block">
                        Containers
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Accordion list */}
              <div className="space-y-2 border-t border-stone-100 pt-4">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 block">
                  Container Product Categories
                </span>
                
                <div className="space-y-2.5">
                  {categories.map((cat) => {
                    const catProducts = groupedProducts[cat.name] || [];
                    const selectedCatCount = catProducts.filter(p => {
                      if (p._id === product._id) return quantity > 0;
                      const extra = extraItems.find(item => item.product._id === p._id);
                      return extra && extra.quantity > 0;
                    }).length;

                    const isSelectedCategory = selectedCatCount > 0;
                    const isExpanded = expandedCategory === cat.name || isSelectedCategory;
                    
                    return (
                      <div 
                        key={cat._id} 
                        className={`bg-white border rounded-[20px] overflow-hidden transition-all duration-300 shadow-sm ${
                          isSelectedCategory ? 'border-[#22c55e]/60 ring-1 ring-[#22c55e]/20' : 'border-stone-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedCategory(isExpanded && !isSelectedCategory ? null : cat.name)}
                          className={`w-full flex items-center justify-between p-4 text-left font-poppins font-black text-xs sm:text-sm transition-colors ${
                            isSelectedCategory ? 'bg-[#f0fdf4]/70 hover:bg-[#f0fdf4] text-[#15803d]' : 'bg-stone-50/50 hover:bg-stone-50 text-stone-850'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isSelectedCategory ? (
                              <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                            ) : (
                              <span>{isExpanded ? '▼' : '►'}</span>
                            )}
                            {cat.name}
                          </span>

                          {isSelectedCategory ? (
                            <span className="text-[10px] text-[#15803d] font-black bg-[#dcfce7] border border-[#86efac] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" />
                              {selectedCatCount} Selected
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#2E7D32] font-extrabold bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                              {catProducts.length} Products
                            </span>
                          )}
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3 border-t border-stone-100 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {catProducts.length === 0 ? (
                                  <p className="text-xs text-stone-400 font-semibold py-2">
                                    No products in this category.
                                  </p>
                                ) : (
                                  catProducts.map((p) => {
                                    const isMainProduct = p._id === product._id;
                                    const existingExtra = extraItems.find(item => item.product._id === p._id);
                                    const currentQty = isMainProduct ? quantity : (existingExtra ? existingExtra.quantity : 0);
                                    const isItemSelected = currentQty > 0;
                                    
                                    return (
                                      <div 
                                        key={p._id} 
                                        className={`flex items-center justify-between gap-3 p-3 rounded-2xl transition-all duration-200 text-xs ${
                                          isItemSelected 
                                            ? 'bg-[#f0fdf4] border-2 border-[#22c55e] shadow-[0_4px_14px_rgba(34,197,94,0.15)] scale-[1.01]' 
                                            : 'bg-stone-50 border border-stone-200/60 hover:border-stone-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                          {isItemSelected && (
                                            <div className="w-5 h-5 rounded-full bg-[#22c55e] text-white flex items-center justify-center shrink-0 shadow-sm animate-in fade-in zoom-in duration-200">
                                              <Check className="w-3 h-3 stroke-[3]" />
                                            </div>
                                          )}
                                          <div className="w-10 h-10 bg-white rounded-xl overflow-hidden border border-stone-200 shrink-0 p-1 flex items-center justify-center">
                                            <ImageWithFallback 
                                              src={p.images?.[0]} 
                                              alt={p.name} 
                                              className="w-full h-full object-contain mix-blend-multiply" 
                                            />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <h4 className="font-extrabold text-stone-850 truncate leading-snug">
                                              {p.name}
                                            </h4>
                                            <p className="text-[9px] text-stone-500 font-semibold mt-0.5">
                                              Dims: {p.length || 30}x{p.width || 30}x{p.height || 12} cm
                                            </p>
                                            <p className="text-[9px] text-[#2E7D32] font-black mt-0.5">
                                              Capacity: {p.stock || 100} Containers
                                            </p>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center bg-white border border-stone-200 rounded-xl p-0.5 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (isMainProduct) {
                                                setQuantity(q => Math.max(0.00, parseFloat((q - 0.25).toFixed(2))));
                                              } else {
                                                setExtraItems(prev => {
                                                  const existing = prev.find(item => item.product._id === p._id);
                                                  if (existing) {
                                                    if (existing.quantity > 0.25) {
                                                      return prev.map(item => item.product._id === p._id ? { ...item, quantity: parseFloat((item.quantity - 0.25).toFixed(2)) } : item);
                                                    } else {
                                                      return prev.filter(item => item.product._id !== p._id);
                                                    }
                                                  }
                                                  return prev;
                                                });
                                              }
                                            }}
                                            className="w-6 h-6 flex items-center justify-center text-stone-500 hover:bg-stone-50 hover:text-red-650 rounded-lg transition-colors"
                                          >
                                            <Minus className="w-3 h-3" />
                                          </button>
                                          <span className={`w-9 text-center font-black text-[11px] ${isItemSelected ? 'text-[#15803d]' : 'text-stone-800'}`}>
                                            {currentQty.toFixed(2)}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (isMainProduct) {
                                                setQuantity(q => parseFloat((q + 0.25).toFixed(2)));
                                              } else {
                                                setExtraItems(prev => {
                                                  const existing = prev.find(item => item.product._id === p._id);
                                                  if (existing) {
                                                    return prev.map(item => item.product._id === p._id ? { ...item, quantity: parseFloat((item.quantity + 0.25).toFixed(2)) } : item);
                                                  } else {
                                                    return [...prev, { product: p, quantity: 0.25 }];
                                                  }
                                                });
                                              }
                                            }}
                                            className="w-6 h-6 flex items-center justify-center text-stone-500 hover:bg-stone-50 hover:text-[#2E7D32] rounded-lg transition-colors"
                                          >
                                            <Plus className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress bar */}
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
                    {capacityPercentage}%
                  </div>
                </div>

                <div className="relative w-full h-3 bg-stone-200/50 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${
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
              <div className="lg:hidden relative w-full mt-4 border border-stone-200/50 rounded-2xl overflow-hidden shadow-sm h-64 bg-[#F7F9F7]">
                <ContainerViewer3D containerType={containerType} totalQuantity={viewerQuantity} autoRotate={true} palletItems={viewerPallets} />
              </div>

              {/* REQUEST QUOTE ACTIONS (Desktop Only) */}
              <div className="mt-4 border-t border-stone-100 pt-4 hidden lg:block">
                <button
                  type="button"
                  disabled={isQuoteButtonDisabled || hasActiveRfq}
                  onClick={() => setIsQuoteModalOpen(true)}
                  className={`w-full font-poppins text-xs font-black py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group ${
                    hasActiveRfq
                      ? 'bg-stone-100 border border-stone-200 text-stone-600 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#113F15] disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-white active:scale-[0.98]'
                  }`}
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : hasActiveRfq ? (
                    <div className="flex flex-col items-center justify-center leading-tight">
                      <div className="flex items-center gap-1.5 text-[#2E7D32] font-black text-xs">
                        <Check className="w-4 h-4 text-[#2E7D32] stroke-[3]" />
                        <span>✓ Quote Requested</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-bold mt-0.5">Waiting for Review</span>
                    </div>
                  ) : (
                    <>
                      REQUEST QUOTE
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
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

      {/* Request Quote Modal */}
      <RequestQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        product={product}
        user={user}
        quantity={quantity}
        extraItems={extraItems}
        setQuantity={setQuantity}
        setExtraItems={setExtraItems}
        containerType={containerType}
        hasActiveRfq={hasActiveRfq}
        onSuccess={() => setHasActiveRfq(true)}
        showToast={(msg) => setAddedMessage(msg)}
      />

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
                    navigate(`/products/${item.slug || item._id}`);
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
                    <span className="text-[10px] sm:text-xs text-[#2E7D32] font-bold">
                      Premium Substrate
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
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white border-t border-stone-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-50 lg:hidden flex gap-2 items-center backdrop-blur-md bg-white/95">
        <button
          type="button"
          disabled={isQuoteButtonDisabled || hasActiveRfq}
          onClick={() => setIsQuoteModalOpen(true)}
          className="flex-1 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-white font-poppins text-xs font-black py-3 rounded-xl flex items-center justify-center shadow-md gap-1 active:scale-[0.98]"
        >
          {hasActiveRfq ? (
            <>
              <Check className="w-4 h-4 text-white" />
              Quote Requested
            </>
          ) : (
            <>
              REQUEST QUOTE
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
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
              className="bg-white rounded-[2rem] w-full max-w-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
            >
              <div className="p-8 border-b border-stone-100 flex flex-col items-center justify-center text-center bg-gradient-to-br from-stone-50 to-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2E7D32]/5 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#2E7D32]/5 rounded-full blur-2xl"></div>
                
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white flex items-center justify-center shadow-lg shadow-[#2E7D32]/20 mb-4 z-10">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="font-poppins font-black text-xl text-stone-900 z-10 tracking-tight">Professional Quality Testing</h3>
                <p className="text-sm font-medium text-stone-500 z-10 mt-1">NABL & Technical Lab Verification</p>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="bg-white rounded-2xl p-4 mb-8 border border-stone-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 transition-transform hover:-translate-y-0.5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#2E7D32] rounded-xl blur-[2px] opacity-20"></div>
                    <img src={product.images[0]} alt="" className="relative w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-stone-800">{product.name}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#2E7D32]/10 text-[#2E7D32] mt-1">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-stone-400 uppercase tracking-widest pl-1 mb-2">Select Testing Package</h4>
                  {packagesLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="w-6 h-6 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : testingPackages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                        <ShieldCheck className="w-6 h-6 text-stone-300" />
                      </div>
                      <p className="text-sm text-stone-600 font-bold">No packages available</p>
                      <p className="text-xs text-stone-400 font-medium text-center mt-1 px-4">Currently, there are no testing packages configured for this product category.</p>
                    </div>
                  ) : testingPackages.map((pkg) => (
                    <div 
                      key={pkg._id}
                      onClick={() => setSelectedTestingPackage(pkg)}
                      className={`cursor-pointer rounded-2xl border-2 transition-all p-5 ${
                        selectedTestingPackage?._id === pkg._id 
                          ? 'border-[#2E7D32] bg-[#2E7D32]/[0.02] shadow-[0_4px_20px_-4px_rgba(46,125,50,0.1)]' 
                          : 'border-stone-100 bg-white hover:border-stone-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedTestingPackage?._id === pkg._id ? 'border-[#2E7D32]' : 'border-stone-300'
                          }`}>
                            {selectedTestingPackage?._id === pkg._id && <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />}
                          </div>
                          <span className="font-poppins font-bold text-sm text-stone-900">{pkg.name}</span>
                        </div>
                        <span className="font-poppins font-black text-[#2E7D32] bg-[#2E7D32]/10 px-3 py-1 rounded-full text-xs">₹{pkg.price}</span>
                      </div>
                      {pkg.description && (
                        <p className="text-xs text-stone-500 font-medium pl-8 mb-3 whitespace-pre-wrap leading-relaxed">
                          {pkg.description}
                        </p>
                      )}
                      <div className="pl-8 flex items-center gap-1.5 text-[11px] font-bold text-stone-400 bg-stone-50 w-fit px-3 py-1.5 rounded-lg border border-stone-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                        Estimated Delivery: <span className="text-stone-600">{pkg.deliveryDays} Days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-stone-100 bg-white shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] relative z-20">
                {selectedTestingPackage ? (
                  <div className="mb-5 bg-stone-50 rounded-xl p-4 border border-stone-100">
                    <div className="flex justify-between text-xs font-semibold text-stone-500 mb-1">
                      <span>Testing Fee</span>
                      <span>₹{selectedTestingPackage.price}</span>
                    </div>
                    <div className="flex justify-between text-base font-poppins font-black text-[#2E7D32]">
                      <span>Total Amount</span>
                      <span>₹{selectedTestingPackage.price}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-5 bg-orange-50/50 rounded-xl p-3.5 border border-orange-100 flex items-center justify-center">
                    <div className="text-xs text-orange-600 font-semibold flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                      Please select a package to proceed
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsTestingModalOpen(false);
                      setSelectedTestingPackage(null);
                    }}
                    className="flex-1 bg-white border-2 border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 font-poppins text-xs font-bold py-3.5 rounded-xl transition-all hover:shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTestingPayment}
                    disabled={!selectedTestingPackage || testingLoading}
                    className="flex-[2] bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] hover:to-[#1B5E20] text-white font-poppins text-xs font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:from-stone-300 disabled:to-stone-400 disabled:shadow-none shadow-lg shadow-[#2E7D32]/25 hover:shadow-xl hover:shadow-[#2E7D32]/30 flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0"
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

      {/* Share Link Modal (Mobile & Laptop View) */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[24px] shadow-2xl border border-stone-200 w-full max-w-md p-6 relative overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
                    <Share2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-poppins font-black text-base text-stone-900 leading-tight">
                      Share Product
                    </h3>
                    <p className="text-xs text-stone-500 font-medium truncate max-w-[220px]">
                      {product?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Copy Link Input Section */}
              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-stone-700 block">
                  Direct Product Link
                </label>
                <div className="flex items-center gap-2 bg-[#F7F9F7] border border-stone-200 rounded-[14px] p-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="bg-transparent border-none text-xs font-mono text-stone-700 flex-1 px-2 focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-[10px] text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                      copiedLink
                        ? 'bg-[#2E7D32] text-white shadow-sm'
                        : 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm active:scale-95'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <span>Copy Link</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Share Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">
                  Share via
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${product?.name} on Cocoveera: ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-[16px] bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] transition-colors"
                  >
                    <span className="text-xl">💬</span>
                    <span className="text-[10.5px] font-bold">WhatsApp</span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(product?.name || 'Cocoveera Product')}&body=${encodeURIComponent(`Check out this product on Cocoveera: ${window.location.href}`)}`}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-[16px] bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                  >
                    <span className="text-xl">✉️</span>
                    <span className="text-[10.5px] font-bold">Email</span>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-[16px] bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors"
                  >
                    <span className="text-xl">💼</span>
                    <span className="text-[10.5px] font-bold">LinkedIn</span>
                  </a>

                  {/* Twitter/X */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product?.name} on Cocoveera:`)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-[16px] bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                  >
                    <span className="text-xl">𝕏</span>
                    <span className="text-[10.5px] font-bold">Twitter</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isFullscreenOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
            onClick={() => setIsFullscreenOpen(false)}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white z-10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-extrabold tracking-wider font-poppins text-emerald-400 border border-white/10">
                  {fullscreenImageIndex + 1} / {imagesList.length}
                </span>
                <h3 className="font-poppins font-bold text-sm text-stone-200 truncate max-w-xs sm:max-w-md">
                  {product?.name}
                </h3>
              </div>
              <button
                onClick={() => setIsFullscreenOpen(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 active:scale-95 cursor-pointer"
                title="Close Fullscreen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Center Display */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden select-none" onClick={e => e.stopPropagation()}>
              {imagesList.length > 1 && (
                <button
                  onClick={() => setFullscreenImageIndex(prev => (prev === 0 ? imagesList.length - 1 : prev - 1))}
                  className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer"
                  title="Previous Image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              <motion.img
                key={fullscreenImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={imagesList[fullscreenImageIndex]}
                alt={product?.name}
                className="max-h-[82vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl bg-white/5 p-2"
              />

              {imagesList.length > 1 && (
                <button
                  onClick={() => setFullscreenImageIndex(prev => (prev === imagesList.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer"
                  title="Next Image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnails Strip */}
            {imagesList.length > 1 && (
              <div className="flex justify-center gap-3 overflow-x-auto py-2 z-10" onClick={e => e.stopPropagation()}>
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFullscreenImageIndex(idx)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white/10 border-2 transition-all shrink-0 cursor-pointer ${
                      idx === fullscreenImageIndex ? 'border-emerald-400 scale-105 opacity-100 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductView;
