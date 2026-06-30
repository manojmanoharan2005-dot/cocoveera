/**
 * File: frontend/src/pages/Products.jsx
 * Purpose: React page component representing the Products view.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, apiClient } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, Info, X, Layers, Droplet, Wind, Compass, Sparkles, Heart, ShoppingBag, Search, SlidersHorizontal, ChevronDown, ChevronRight, Home as HomeIcon, LayoutGrid, TestTube, ShoppingCart, User as UserIcon, Star } from 'lucide-react';
import PageHero from '../components/PageHero';
import ImageWithFallback from '../components/common/ImageWithFallback';
import SEO from '../components/SEO';
import useSWR from 'swr';

// ─── Helper: Optimize Cloudinary Image ──────────────────────────────────────
const optimizeImage = (url) => {
  if (!url) return '';
  // Inject transformation if it's a cloudinary URL and doesn't already have one
  if (url.includes('cloudinary.com') && !url.includes('/upload/f_auto,q_auto')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
  }
  return url;
};

// ─── Fetcher for SWR ────────────────────────────────────────────────────────
const fetcher = url => apiClient.get(url).then(res => res.data.data);

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: products = [], error, isLoading: loading } = useSWR(
    '/products',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 600000 }
  );

  // Blend selector state
  const [selectedBlend, setSelectedBlend] = useState('natural');

  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sync category from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('All');
    }
  }, [location.search]);
  
  // Quote Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBlendOption, setSelectedBlendOption] = useState('Natural');
  const [quantity, setQuantity] = useState(10);
  const [unitType, setUnitType] = useState('Tons');
  const [customPh, setCustomPh] = useState('5.5 - 6.5');
  const [customEc, setCustomEc] = useState('< 0.5 mS/cm');
  const [customMoisture, setCustomMoisture] = useState('< 20%');
  const [customNotes, setCustomNotes] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    addressLine: '',
    city: '',
    country: '',
    postalCode: '',
  });
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);


  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
    const getCategoryPriority = (name) => {
      if (!name) return 999;
      const lower = name.toLowerCase();
      if (lower.includes('cube')) return 1;
      if (lower.includes('fiber bale')) return 2;
      if (lower.includes('substrate bag')) return 3;
      if (lower.includes('mat') || lower.includes('blanket')) return 6;
      if (lower.includes('erosion control') || lower.includes('log') || lower.includes('net')) return 4;
      if (lower.includes('disc') || lower === 'disck') return 5;
      return 999;
    };
    uniqueCategories.sort((a, b) => {
      const priorityA = getCategoryPriority(a);
      const priorityB = getCategoryPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;
      return 0;
    });
    return ['All', ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      return products;
    }
    return products.filter(p => p.category === selectedCategory);
  }, [selectedCategory, products]);



  const openQuoteModal = (product) => {
    if (!user) {
      navigate('/login?redirect=products');
      return;
    }
    setSelectedProduct(product);
    setCustomPh(product.specifications.ph);
    setCustomEc(product.specifications.ec);
    setCustomMoisture(product.specifications.moisture);
    setIsModalOpen(true);
  };

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login?redirect=products');
      return;
    }
    
    let existingCart = [];
    try {
      const stored = localStorage.getItem('cocoveera_cart');
      if (stored) existingCart = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse cart:', e);
    }

    const existsIdx = existingCart.findIndex(item => item._id === product._id && item.containerType === '20FT');
    if (existsIdx > -1) {
      existingCart[existsIdx].quantity += 0.25;
    } else {
      existingCart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images || [],
        containerType: '20FT',
        quantity: 0.25
      });
    }

    localStorage.setItem('cocoveera_cart', JSON.stringify(existingCart));
    navigate('/dashboard', { state: { activeTab: 'Cart' } });
  };

  const handleAddToWishlist = (product) => {
    if (!user) {
      navigate('/login?redirect=products');
      return;
    }

    let existingWishlist = [];
    try {
      const stored = localStorage.getItem('cocoveera_wishlist');
      if (stored) existingWishlist = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse wishlist:', e);
    }

    const exists = existingWishlist.find(item => item._id === product._id);
    if (!exists) {
      existingWishlist.push({
        _id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        images: product.images || []
      });
      localStorage.setItem('cocoveera_wishlist', JSON.stringify(existingWishlist));
    }
    navigate('/dashboard', { state: { activeTab: 'Wishlist' } });
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    try {
      const payload = {
        productId: selectedProduct._id,
        quantity: Number(quantity),
        unitType,
        ph: customPh,
        ec: customEc,
        moisture: customMoisture,
        notes: `Selected Blend: ${selectedBlendOption}. ${customNotes}`,
        shippingAddress,
      };
      
      const res = await apiClient.post('/quotes', payload);
      if (res.data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
          navigate('/dashboard', { state: { activeTab: 'My Orders' } });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting B2B quote request');
    } finally {
      setSubmitLoading(false);
    }
  };

  const [quoteError, setQuoteError] = useState(null);

  const blendsData = {
    natural: {
      name: 'Natural Blend (100% Cocopeat)',
      ratio: '100% Coco Pith / 0% Chips',
      aeration: 'Low-Medium',
      retention: 'Very High',
      bestFor: 'Seedling germination, propagation plugs, leafy greens, and cut flowers.',
      desc: 'Double sieved to remove fine particles under 1mm. Delivers maximum water holding capacity for rapid germination.'
    },
    mix: {
      name: 'Mix Blend (75/25 Standard)',
      ratio: '75% Coco Pith / 25% Husk Chips',
      aeration: 'Medium',
      retention: 'High',
      bestFor: 'Standard greenhouse vegetables (peppers, eggplant) and small nurseries.',
      desc: 'Our most popular B2B blend. Balanced air porosity with excellent water distribution to prevent dry spots.'
    },
    pro: {
      name: 'Pro Blend (50/50 Balanced)',
      ratio: '50% Coco Pith / 50% Husk Chips',
      aeration: 'High',
      retention: 'Medium-High',
      bestFor: 'Hydroponic tomatoes, cucumbers, and medium-term vine crops.',
      desc: 'Optimized drainage allows daily irrigation cycles and rapid nutrient flushing without root suffocation.'
    },
    premium: {
      name: 'Premium Blend (30/70 High Drainage)',
      ratio: '30% Coco Pith / 70% Husk Chips',
      aeration: 'Very High',
      retention: 'Medium',
      bestFor: 'Soft fruits, blueberries, raspberries, and long-term woody plants.',
      desc: 'Designed for plants sensitive to water-logging. Prevents root rot in highly humid greenhouse climates.'
    },
    supreme: {
      name: 'Supreme Blend (100% Chips)',
      ratio: '0% Coco Pith / 100% Husk Chips',
      aeration: 'Maximum',
      retention: 'Low-Medium',
      bestFor: 'Orchids, bromeliads, and industrial soil aerating agents.',
      desc: 'Crushed and sieved husk chips. Delivers maximum air-filled porosity for plants requiring rapid drainage.'
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  
  const cartCount = useMemo(() => {
    try {
      const stored = localStorage.getItem('cocoveera_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.length;
      }
    } catch (e) {}
    return 0;
  }, []);

  return (
    <div className="bg-[#F8FAF8] min-h-screen font-sans pb-[110px]">
      <SEO 
        title="Products"
        description="Premium organic coconut substrates."
        url="/products"
      />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center text-white font-bold mr-2 shadow-sm">
              <span className="text-sm">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-green-800 font-extrabold text-lg leading-tight tracking-tight">cocoveera</span>
              <span className="text-[8px] text-gray-500 font-medium">Premium Coir Products</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-[#2E7D32] transition-colors" onClick={() => navigate('/dashboard', { state: { activeTab: 'Wishlist' } })}>
            <Heart className="w-6 h-6" />
          </button>
          <button className="text-gray-600 hover:text-[#2E7D32] transition-colors relative" onClick={() => navigate('/dashboard', { state: { activeTab: 'Cart' } })}>
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-[#2E7D32] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
          <div className="flex items-center space-x-1 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-7 h-7 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-xs font-bold">
              {user ? user.firstName?.[0]?.toUpperCase() : 'M'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      </header>

      {/* SEARCH & FILTER */}
      <div className="bg-white px-4 py-3 shadow-sm border-t border-gray-50 z-30 relative">
        <div className="flex space-x-3 mb-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border-none rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2E7D32]/30 transition-all"
              placeholder="Search coir products..."
            />
          </div>
          <button className="bg-[#2E7D32] text-white px-4 py-2.5 rounded-2xl flex items-center space-x-2 shadow-sm font-semibold text-sm hover:bg-green-800 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
        
        {/* Sort Dropdown */}
        <div className="flex">
          <button className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 bg-white shadow-sm">
            <span>Sort by: Featured</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center space-x-2 text-xs font-bold">
          <HomeIcon className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700">Marketplace</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#2E7D32]">{selectedCategory !== 'All' ? selectedCategory : 'All Categories'}</span>
        </div>
        <div className="bg-green-50 text-[#2E7D32] border border-green-100 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          {filteredProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length} items
        </div>
      </div>

      {/* PRODUCT LIST */}
      <div className="px-4 space-y-4">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-4 flex gap-4 shadow-sm border border-gray-50 h-32 animate-pulse">
                <div className="w-5/12 bg-gray-100 rounded-xl"></div>
                <div className="w-7/12 flex flex-col justify-center space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-100 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-100 rounded w-full mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <AnimatePresence>
          {!loading && filteredProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((prod) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              key={prod._id}
              className="bg-white rounded-[24px] p-4 flex flex-col shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.08)] transition-all cursor-pointer relative group"
              onClick={() => navigate(`/account/product/${prod._id}`)}
            >
              {/* Top Row */}
              <div className="flex justify-between items-start w-full mb-3 z-10 relative">
                <div className="bg-[#2A3427] text-white text-[10px] font-bold px-3 py-1 rounded-lg">
                  {prod.category || 'Coco Cubes'}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWishlist(prod);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-row items-center gap-4">
                {/* Image */}
                <div className="w-5/12 aspect-square relative bg-white rounded-xl flex-shrink-0 flex items-center justify-center p-1">
                  <div className="absolute top-0 left-0 bg-white/90 backdrop-blur-sm text-[9px] font-bold text-gray-700 px-2 py-0.5 rounded shadow-sm z-10 border border-gray-100">
                    {prod.packageSize || '10x10x7 cm'}
                  </div>
                  <ImageWithFallback
                    src={prod.images && prod.images.length > 0 ? optimizeImage(prod.images[0]) : null}
                    alt={prod.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Details */}
                <div className="w-7/12 flex flex-col h-full justify-center">
                  <h3 className="text-[14px] font-extrabold text-gray-900 leading-tight mb-1 group-hover:text-[#2E7D32] transition-colors">
                    {prod.name}
                  </h3>
                  <div className="text-lg font-extrabold text-[#2E7D32] mb-1.5">
                    £{prod.price || '9.4'}
                  </div>
                  
                  <div className="flex items-center space-x-1.5 mb-3 text-[11px] text-gray-500 font-semibold">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    <span className="text-gray-700">4.6</span>
                    <span>(128)</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 mx-1"></span>
                    <span>50+ sold</span>
                  </div>

                  <button 
                    className="w-full bg-[#F4F9F4] hover:bg-[#E8F3E8] text-[#2E7D32] text-[13px] font-bold py-2.5 px-4 rounded-[14px] flex items-center justify-between transition-colors group/btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/account/product/${prod._id}`);
                    }}
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] pb-safe pt-2 px-6 z-50 rounded-t-3xl h-[70px] flex items-center justify-between">
        <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-[#2E7D32] transition-colors" onClick={() => navigate('/')}>
          <HomeIcon className="w-6 h-6" />
          <span className="text-[9px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-[#2E7D32]" onClick={() => navigate('/products')}>
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[9px] font-bold">Products</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-[#2E7D32] transition-colors" onClick={() => navigate('/quality-testing')}>
          <TestTube className="w-6 h-6" />
          <span className="text-[9px] font-bold">Quality Test</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-[#2E7D32] transition-colors relative" onClick={() => navigate('/dashboard', { state: { activeTab: 'Cart' } })}>
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#2E7D32] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          )}
          <span className="text-[9px] font-bold">Cart</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-[#2E7D32] transition-colors" onClick={() => navigate('/dashboard')}>
          <UserIcon className="w-6 h-6" />
          <span className="text-[9px] font-bold">Account</span>
        </button>
      </div>
    </div>
  );
};

export default Products;
