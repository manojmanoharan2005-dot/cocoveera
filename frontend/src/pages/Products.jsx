/**
 * File: frontend/src/pages/Products.jsx
 * Purpose: React page component representing the Products view.
 */
import React, { useState, useEffect } from 'react';
import { useAuth, apiClient } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, Info, X, Layers, Droplet, Wind, Compass, Sparkles, Heart, ShoppingBag } from 'lucide-react';
import PageHero from '../components/PageHero';
import ImageWithFallback from '../components/common/ImageWithFallback';

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const [categories, setCategories] = useState(['All']);

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/products');
        if (res.data.success) {
          // Re-map category keys if needed to match B2B names
          const mapped = res.data.data.map(p => {
            return p;
          });
          setProducts(mapped);
          setFilteredProducts(mapped);
          const uniqueCategories = [...new Set(mapped.map(p => p.category))].filter(Boolean);
          
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
            return Math.random() - 0.5;
          });

          setCategories(['All', ...uniqueCategories]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load B2B substrate database.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
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

  return (
    <div className="pb-16 min-h-screen relative bg-stone-50">
      {/* Removed white overlay to show background clearly */}
      <div className="relative z-10">
        <PageHero
          badge="B2B CATALOG"
          title="Organic Growing Media"
          titleAccent="& Substrates"
          subtitle="Standard-compliant raw materials sieved, washed, and compressed for bulk container freight export."
          breadcrumbs={[{ label: 'Products', path: '/products' }]}
        />

        {/* 1. SUBSTRATE BLENDS & TEXTURES PANEL */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="bg-accent border border-stone-200 rounded-3xl p-6 lg:p-10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest">
              SUBSTRATE GRADES & RATIOS
            </span>
            <h3 className="text-xl font-poppins font-extrabold text-stone-900 mt-1">
              Select Your Core Material Blend
            </h3>
            <p className="text-xs text-stone-500 mt-2 font-medium">
              We process five standard coco coir textures based on the ratio of sifted pith to crushed husk chips.
            </p>
          </div>

          {/* Selector Bar */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-8">
            {Object.keys(blendsData).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedBlend(key)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider font-poppins transition-all ${
                  selectedBlend === key
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Selected Blend Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 rounded-2xl border border-stone-200">
            <div className="lg:col-span-7 space-y-4">
              <h4 className="font-poppins font-extrabold text-stone-900 text-base">
                {blendsData[selectedBlend].name}
              </h4>
              <p className="text-stone-500 text-xs leading-relaxed font-medium">
                {blendsData[selectedBlend].desc}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-stone-700 bg-accent p-4 rounded-xl border border-stone-150">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-primary" />
                  <span>Water Holding: {blendsData[selectedBlend].retention}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-primary" />
                  <span>Air Porosity: {blendsData[selectedBlend].aeration}</span>
                </div>
              </div>

              <p className="text-xs text-stone-550 leading-relaxed font-medium">
                <strong>Best Applications:</strong> {blendsData[selectedBlend].bestFor}
              </p>
            </div>
            
            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-stone-200 pt-6 lg:pt-0 lg:pl-8 space-y-4">
              <span className="text-[10px] text-stone-400 font-bold uppercase block tracking-widest">Blend Ratio Matrix</span>
              <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                <span>Coco Pith / Peat</span>
                <span className="text-primary">{selectedBlend === 'natural' ? '100%' : selectedBlend === 'mix' ? '75%' : selectedBlend === 'pro' ? '50%' : selectedBlend === 'premium' ? '30%' : '0%'}</span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden flex">
                <div 
                  className="bg-primary h-full transition-all duration-500" 
                  style={{ width: selectedBlend === 'natural' ? '100%' : selectedBlend === 'mix' ? '75%' : selectedBlend === 'pro' ? '50%' : selectedBlend === 'premium' ? '30%' : '0%' }}
                ></div>
                <div 
                  className="bg-secondary h-full transition-all duration-500" 
                  style={{ width: selectedBlend === 'natural' ? '0%' : selectedBlend === 'mix' ? '25%' : selectedBlend === 'pro' ? '50%' : selectedBlend === 'premium' ? '70%' : '100%' }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                <span>Crushed Husk Chips</span>
                <span className="text-secondary">{selectedBlend === 'natural' ? '0%' : selectedBlend === 'mix' ? '25%' : selectedBlend === 'pro' ? '50%' : selectedBlend === 'premium' ? '70%' : '100%'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                if (cat === 'All') {
                  navigate('/products', { replace: true });
                } else {
                  navigate(`/products?category=${encodeURIComponent(cat)}`, { replace: true });
                }
              }}
              className={`px-5 py-2 rounded-lg font-poppins text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-white border border-stone-205 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/50 backdrop-blur-sm rounded-2xl border border-stone-100 overflow-hidden shadow-soft flex flex-col md:flex-row h-[350px] md:h-64">
                <div className="md:w-5/12 h-64 md:h-full bg-stone-200/50 animate-pulse"></div>
                <div className="md:w-7/12 p-6 lg:p-8 flex flex-col justify-between w-full">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="h-4 bg-stone-200/50 rounded w-16 animate-pulse"></div>
                      <div className="h-4 bg-stone-200/50 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="h-6 bg-stone-200/50 rounded w-3/4 animate-pulse"></div>
                    <div className="space-y-2 mt-4">
                      <div className="h-3 bg-stone-200/50 rounded w-full animate-pulse"></div>
                      <div className="h-3 bg-stone-200/50 rounded w-5/6 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-stone-200/50 rounded w-full mt-6 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Catalog Grid */}
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {filteredProducts.map((prod) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                key={prod._id}
                className="bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden border border-white/60 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 grid grid-cols-1 md:grid-cols-12 group"
              >
              <div
                className="md:col-span-5 relative h-64 md:h-full bg-stone-100/50 cursor-pointer overflow-hidden relative"
                onClick={() => navigate(`/account/product/${prod._id}`)}
              >
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500 z-10 mix-blend-overlay"></div>
                <ImageWithFallback
                  src={prod.images && prod.images.length > 0 ? prod.images[0] : null}
                  alt={prod.name}
                  className="w-full h-full object-cover mix-blend-multiply transition-transform group-hover:scale-110 duration-700"
                />
              </div>

              <div className="md:col-span-7 p-6 lg:p-8 flex flex-col justify-between relative z-20">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-secondary/15 border border-secondary/20 text-secondary font-poppins font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {prod.category}
                    </span>
                    <span className="text-stone-400 font-poppins text-xs font-semibold">
                      Pack: {prod.packageSize}
                    </span>
                  </div>
                  <h3
                    className="font-poppins font-extrabold text-stone-900 text-lg mt-3 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/account/product/${prod._id}`)}
                  >
                    {prod.name}
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed mt-2 font-medium">
                    {prod.description}
                  </p>

                  {/* Specifications Table */}
                  <div className="grid grid-cols-2 gap-2 mt-4 bg-accent p-3.5 rounded-xl border border-stone-150 text-[10px] text-stone-600 font-bold uppercase tracking-wider">
                    <div className="flex justify-between pr-2 border-r border-stone-200">
                      <span>EC Value:</span>
                      <strong className="text-stone-850">{prod.specifications.ec}</strong>
                    </div>
                    <div className="flex justify-between pl-2">
                      <span>pH Level:</span>
                      <strong className="text-stone-850">{prod.specifications.ph}</strong>
                    </div>
                    <div className="flex justify-between pr-2 border-r border-stone-200">
                      <span>Moisture:</span>
                      <strong className="text-stone-850">{prod.specifications.moisture}</strong>
                    </div>
                    <div className="flex justify-between pl-2">
                      <span>Expansion:</span>
                      <strong className="text-stone-850">{prod.specifications.expansionVolume}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-105 mt-6 pt-4 flex-wrap gap-3">
                  <div className="flex-grow">
                    {/* Price hidden for B2B catalog */}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAddToCart(prod)}
                      className="bg-white border border-primary text-primary hover:bg-primary hover:text-white font-poppins text-xs font-bold px-3 py-2 rounded-lg transition-all flex items-center space-x-1"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 3. APPLICATION GUIDE MATRIX */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-10 shadow-soft overflow-x-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-primary font-poppins text-xs font-bold uppercase tracking-widest">
              AGRONOMIC USABILITY GUIDE
            </span>
            <h3 className="text-xl font-poppins font-extrabold text-stone-900 mt-1">
              Substrate Application Matrix
            </h3>
          </div>

          <table className="w-full text-left text-xs font-medium text-stone-600 min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-405 font-bold uppercase text-[10px] tracking-widest">
                <th className="py-3 px-4">Application Stage</th>
                <th className="py-3 px-4">Suitable Blend</th>
                <th className="py-3 px-4">EC Value</th>
                <th className="py-3 px-4">pH Range</th>
                <th className="py-3 px-4">Crop Types</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-bold">
              {[
                { stage: 'Germination', blend: 'Natural Blend', ec: '< 0.4 mS/cm', ph: '5.5 - 6.0', crop: 'Seedlings, propagation plug trays' },
                { stage: 'Propagation', blend: 'Mix Blend', ec: '< 0.5 mS/cm', ph: '5.6 - 6.2', crop: 'Vegetable nursery starters, flowers' },
                { stage: 'Vegetation', blend: 'Pro Blend', ec: '< 0.6 mS/cm', ph: '5.8 - 6.4', crop: 'Hydroponic tomatoes, cucumbers, peppers' },
                { stage: 'Soft Fruits', blend: 'Premium Blend', ec: '< 0.8 mS/cm', ph: '5.2 - 5.8', crop: 'Blueberries, strawberries, raspberries' },
                { stage: 'Air Aeration', blend: 'Supreme Blend', ec: '< 1.0 mS/cm', ph: '5.5 - 6.8', crop: 'Orchids, potting soil conditioners' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-stone-50 transition-colors">
                  <td className="py-4 px-4 text-stone-900 font-poppins">{row.stage}</td>
                  <td className="py-4 px-4 text-primary">{row.blend}</td>
                  <td className="py-4 px-4">{row.ec}</td>
                  <td className="py-4 px-4">{row.ph}</td>
                  <td className="py-4 px-4 text-stone-500 font-medium">{row.crop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </div>

      {/* CUSTOM QUOTE DIALOG MODAL */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-stone-500/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-primary text-white p-6 flex justify-between items-center">
              <div>
                <span className="text-secondary-light text-[10px] font-bold uppercase tracking-widest bg-white/10 py-0.5 px-2 rounded">
                  BULK QUOTE FORM
                </span>
                <h3 className="text-base font-poppins font-bold mt-1">
                  Customize: {selectedProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scroll Area */}
            <form onSubmit={handleQuoteSubmit} className="p-6 overflow-y-auto space-y-5">
              {error && (
                <div className="bg-red-50 text-red-655 text-xs p-3 rounded-lg border border-red-150 font-semibold">
                  {error}
                </div>
              )}

              {submitSuccess ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-poppins font-bold text-stone-900 text-lg">Inquiry Submitted!</h4>
                  <p className="text-xs text-stone-500 font-medium">Redirecting to your dashboard to track proposals...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        Quantity Required
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full border border-stone-250 rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        Unit Type
                      </label>
                      <select
                        value={unitType}
                        onChange={(e) => setUnitType(e.target.value)}
                        className="w-full border border-stone-250 rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-primary"
                      >
                        <option value="Tons">Tons (Metric)</option>
                        <option value="Containers">40ft FCL Containers</option>
                        <option value="Pallets">Pallets</option>
                        <option value="Pieces">Pieces</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Blend Option */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Choose Substrate Grade
                    </label>
                    <select
                      value={selectedBlendOption}
                      onChange={(e) => setSelectedBlendOption(e.target.value)}
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-primary"
                    >
                      <option value="Natural">Natural Blend (100% Pith)</option>
                      <option value="Mix">Mix Blend (75/25)</option>
                      <option value="Pro">Pro Blend (50/50)</option>
                      <option value="Premium">Premium Blend (30/70)</option>
                      <option value="Supreme">Supreme Blend (100% Chips)</option>
                    </select>
                  </div>

                  <div>
                    <h4 className="text-xs font-poppins font-bold text-stone-900 border-b border-stone-100 pb-2 mb-3">
                      Chemical Specification Adjustments (pH, EC, Moisture)
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">
                          Target pH
                        </label>
                        <input
                          type="text"
                          value={customPh}
                          onChange={(e) => setCustomPh(e.target.value)}
                          className="w-full border border-stone-250 rounded-lg p-2 text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">
                          Target EC
                        </label>
                        <input
                          type="text"
                          value={customEc}
                          onChange={(e) => setCustomEc(e.target.value)}
                          className="w-full border border-stone-250 rounded-lg p-2 text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">
                          Moisture Max
                        </label>
                        <input
                          type="text"
                          value={customMoisture}
                          onChange={(e) => setCustomMoisture(e.target.value)}
                          className="w-full border border-stone-250 rounded-lg p-2 text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-poppins font-bold text-stone-900 border-b border-stone-100 pb-2 mb-3">
                      Delivery Destination Coordinates
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">
                          Address Line (e.g. Port Terminal or Warehouse)
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.addressLine}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
                          className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">
                            City
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">
                            Country
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.country}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                            className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-1 uppercase">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.postalCode}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                            className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Packaging / Additive Requests or Notes
                    </label>
                    <textarea
                      rows="2.5"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="E.g., custom label wraps, mix 70% pith & 30% husk chips..."
                      className="w-full border border-stone-250 rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary"
                    ></textarea>
                  </div>

                  <div className="flex space-x-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-1/3 border border-stone-200 text-stone-600 py-3 rounded-lg text-xs font-bold hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-2/3 bg-primary hover:bg-primary-dark text-white font-poppins text-xs font-bold py-3 rounded-lg transition-all shadow-soft flex items-center justify-center space-x-1.5"
                    >
                      {submitLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Quote Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
