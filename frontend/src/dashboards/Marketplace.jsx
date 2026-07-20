/**
 * File: frontend/src/dashboards/Marketplace.jsx
 * Purpose: Layout wrapper or sub-component specific to user/admin dashboards.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import FilterDrawer from './FilterDrawer';
import ProductGrid from './ProductGrid';
import ProductCard from './ProductCard';
import { X, Check, Star, Info, Droplet, Wind, Home, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { convertCurrency } from '../utils/currencyConverter';
import { API_URL } from '../utils/config';
import ImageWithFallback from '../components/common/ImageWithFallback';
import useSWR from 'swr';

const fetcher = url => axios.get(url).then(res => res.data.data);

export const Marketplace = () => {
  const { user, fetchProfile, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { 
    searchQuery, setSearchQuery, 
    sortBy, setSortBy, 
    filterDrawerOpen, setFilterDrawerOpen 
  } = useOutletContext();
  
  const { data: products = [], isLoading: loading } = useSWR(`${API_URL}/products`, fetcher, { 
    revalidateOnFocus: false,
    dedupingInterval: 60000 
  });
  const wishlist = user?.wishlist || [];

  const onWishlistToggle = async (product) => {
    toggleWishlist(product);
  };

  const onAddToCart = async (product) => {
    try {
      const token = sessionStorage.getItem('cocoveera_token');
      const res = await axios.post(`${API_URL}/users/cart`, { productId: product._id, quantity: 1, increment: true }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        await fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onBuyNow = async (product) => {
    await onAddToCart(product);
    navigate('/cart');
  };

  // Filters & Sorting state
  const selectedCollection = searchParams.get('category') || 'All';
  const setSelectedCollection = (cat) => {
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };
  const [priceRange, setPriceRange] = useState({ min: 0, max: 99999999 });
  const [stockStatus, setStockStatus] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  
  // Custom active tab inside Marketplace ("Featured", "Latest", etc.)
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState('Featured');

  // Selected product details modal state
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Computed state for filtered and sorted products
  const [displayedProducts, setDisplayedProducts] = useState([]);
  
  // Database categories to get images
  const { data: dbCategories = [] } = useSWR(`${API_URL}/categories`, fetcher, { 
    revalidateOnFocus: false,
    dedupingInterval: 600000 
  });

  useEffect(() => {
    let result = [...(products || [])];

    // 1. Search Query filter
    if ((searchQuery || '').trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        return nameMatch || descMatch || catMatch;
      });
    }

    // 2. Collection category filter
    if (selectedCollection !== 'All') {
      result = result.filter(p => {
        const cat = p.category || '';
        return cat === selectedCollection;
      });
    }

    // 3. Price Range filter
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // 4. Stock Availability filter
    if (stockStatus === 'in_stock') {
      result = result.filter(p => p.stock > 0);
    } else if (stockStatus === 'out_of_stock') {
      result = result.filter(p => p.stock <= 0);
    }

    // 5. Rating filter
    if (ratingFilter > 0) {
      result = result.filter(p => {
        const r = p.specifications?.ph ? 4.8 : 4.5; // mocked rating
        return r >= ratingFilter;
      });
    }

    // 6. Marketplace sub-tabs logic (Mocking differences based on tab choice)
    if (activeMarketplaceTab === 'Latest') {
      // Show newer items by reversing or slicing
      result = result.slice().reverse();
    } else if (activeMarketplaceTab === 'Best Seller') {
      result = result.filter(p => p.price > 310);
    } else if (activeMarketplaceTab === 'Trending') {
      result = result.filter(p => p.stock < 120);
    } else if (activeMarketplaceTab === 'New Arrival') {
      result = result.slice(0, 4);
    }

    // 7. Sorting
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Rating') {
      result.sort((a, b) => {
        const rA = a.specifications?.ph ? 4.8 : 4.5;
        const rB = b.specifications?.ph ? 4.8 : 4.5;
        return rB - rA;
      });
    }

    setDisplayedProducts(result);
  }, [products, searchQuery, selectedCollection, priceRange, stockStatus, ratingFilter, sortBy, activeMarketplaceTab]);

  const handleApplyPriceFilter = (range) => {
    setPriceRange(range);
  };

  const handleClearFilters = () => {
    searchParams.delete('category');
    setSearchParams(searchParams);
    setPriceRange({ min: 0, max: 99999999 });
    setStockStatus('all');
    setRatingFilter(0);
    setSearchQuery('');
    setSortBy('Featured');
    setActiveMarketplaceTab('Featured');
  };

  const getRelatedProducts = (prod) => {
    return products
      .filter(p => p._id !== prod._id && p.category === prod.category)
      .slice(0, 3);
  };

  const marketTabs = ['Featured', 'Latest', 'Best Seller', 'Trending', 'New Arrival'];

  const uniqueCategories = React.useMemo(() => {
    const cats = [...new Set((products || []).map(p => p.category))].filter(Boolean);

    const dbCatNames = (dbCategories || []).map(c => c.name);
    cats.sort((a, b) => {
      const indexA = dbCatNames.indexOf(a);
      const indexB = dbCatNames.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
    
    return cats;
  }, [products, dbCategories]);
  
  const categoryCards = uniqueCategories.map(cat => {
    const catProducts = (products || []).filter(p => p.category === cat);
    const dbCat = dbCategories.find(c => c.name === cat);
    return {
      name: cat,
      count: catProducts.length,
      image: dbCat?.image || catProducts[0]?.images?.[0] || 'https://placehold.co/600x600/eeeeee/999999?text=Image+Not+Available'
    };
  });

  return (
    <div className="space-y-8 text-stone-900 font-sans">
      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        selectedCollection={selectedCollection}
        setSelectedCollection={setSelectedCollection}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        stockStatus={stockStatus}
        setStockStatus={setStockStatus}
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        onApplyFilters={handleApplyPriceFilter}
        onClearFilters={handleClearFilters}
        products={products}
      />

      {/* Product Catalog Grid Area or Category Grid Area */}
      {selectedCollection === 'All' && !searchQuery ? (
        <div className="space-y-6">
          <h3 className="font-poppins font-extrabold text-xl text-stone-900">Browse by Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {loading && categoryCards.length === 0 ? (
              [...Array(4)].map((_, idx) => (
                <div 
                  key={idx}
                  className="bg-white rounded-[24px] border border-stone-200 overflow-hidden flex flex-col animate-pulse"
                >
                  <div className="h-48 sm:h-56 w-full bg-stone-100/80"></div>
                  <div className="p-4 sm:p-6 bg-white flex items-center justify-between">
                    <div className="flex-1 pr-3">
                      <div className="h-5 bg-stone-200 rounded-md w-2/3 mb-2"></div>
                      <div className="h-3 bg-stone-100 rounded-md w-1/2"></div>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-stone-100"></div>
                  </div>
                </div>
              ))
            ) : (
              categoryCards.map((cat, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedCollection(cat.name)}
                  className="group cursor-pointer bg-white rounded-[24px] border border-stone-200 overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-[#2E7D32]/50 transition-all duration-300 flex flex-col active:scale-[0.99]"
                >
                  {/* Full bleed image area */}
                  <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-stone-100 flex items-center justify-center p-3">
                    <div className="h-full aspect-square rounded-[1.25rem] sm:rounded-[1.5rem] overflow-hidden flex items-center justify-center">
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-full h-full object-contain mix-blend-multiply brightness-[1.05] contrast-[1.05] group-hover:scale-108 transition-transform duration-500 ease-out"
                      />
                    </div>
                    {/* Subtle dark overlay for premium feel */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/5 to-transparent opacity-40 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none"></div>
                    
                    {/* Item count badge floating top-left */}
                    <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4">
                      <span className="bg-white/95 backdrop-blur-md text-stone-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {cat.count} Item{cat.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-5 bg-white flex items-center justify-between min-w-0">
                    <div className="pr-3 flex-1 min-w-0">
                      <h4 className="font-poppins font-extrabold text-stone-900 text-base sm:text-lg group-hover:text-[#2E7D32] transition-colors leading-tight truncate">{cat.name}</h4>
                      <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5 truncate">Explore collection</p>
                    </div>
                    {/* Action button */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 group-hover:bg-[#2E7D32] group-hover:border-[#2E7D32] group-hover:text-white transition-all duration-300 transform group-hover:translate-x-0.5 shadow-sm">
                      <ChevronRight className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 pb-4">
            <div className="flex items-center gap-2 text-sm sm:text-base font-poppins font-extrabold min-w-0 flex-1">
              <button 
                onClick={() => setSelectedCollection('All')}
                className="flex items-center gap-1.5 text-stone-600 hover:text-[#2E7D32] transition-colors shrink-0"
              >
                <Home className="w-4 h-4 sm:w-[18px] sm:h-[18px] mb-0.5" />
                <span className="inline">Marketplace</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 shrink-0" />
              <span className="text-[#2E7D32] truncate">
                {selectedCollection === 'All' ? 'Search Results' : `${selectedCollection} Products`}
              </span>
            </div>
            
            <span className="text-xs sm:text-sm font-bold text-stone-700 bg-white/90 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-sm border border-stone-200 shrink-0">
              {displayedProducts.length} items
            </span>
          </div>
          
          <ProductGrid loading={loading}>
            {displayedProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                isWishlisted={wishlist.some(item => item._id === prod._id)}
                onWishlistToggle={onWishlistToggle}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onCardClick={(p) => navigate(`/product/${p.slug || p._id}`)}
              />
            ))}
          </ProductGrid>

          {/* Empty State */}
          {!loading && displayedProducts.length === 0 && (
            <div className="bg-white rounded-[24px] border border-stone-250 p-16 text-center space-y-4 max-w-lg mx-auto shadow-sm mt-8">
              <div className="w-16 h-16 bg-[#F7F9F7] text-stone-400 rounded-full flex items-center justify-center mx-auto border border-stone-100">
                <Info className="w-6 h-6" />
              </div>
              <h4 className="font-poppins font-extrabold text-stone-900 text-sm">No products found</h4>
            </div>
          )}
        </div>
      )}

      {/* 5. PREMIUM DETAILED MODAL VIEW */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-[28px] w-full max-w-4xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.15)] flex flex-col max-h-[88vh] text-stone-900 border border-stone-200/50"
            >
              {/* Sticky Top Header */}
              <div className="bg-[#2E7D32] text-white px-6 py-4.5 flex justify-between items-center">
                <div>
                  <span className="text-[#D4AF37] text-[8.5px] font-extrabold uppercase tracking-widest bg-white/10 py-0.5 px-2.5 rounded-md">
                    {selectedProduct.category || 'Grow Medium'}
                  </span>
                  <h3 className="font-poppins font-extrabold text-sm sm:text-base mt-1.5 leading-none">
                    {selectedProduct.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedProduct(null)} 
                  className="p-1 text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-full"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>

              {/* Scroll Content Area */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Left: Gallery */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="h-64 sm:h-72 rounded-[20px] overflow-hidden bg-[#F7F9F7] border border-stone-200/60 shadow-inner relative">
                      <ImageWithFallback 
                        src={selectedProduct.images?.[0]} 
                        alt={selectedProduct.name} 
                        className="w-full h-full object-contain mix-blend-multiply" 
                      />
                    </div>
                    {/* Gallery Thumbs */}
                    <div className="flex gap-2.5">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-1/3 h-16 rounded-[12px] overflow-hidden bg-stone-50 border cursor-pointer hover:border-[#2E7D32] transition-colors relative ${
                          i === 0 ? 'border-[#2E7D32]' : 'border-stone-200'
                        }`}>
                          <ImageWithFallback 
                            src={selectedProduct.images?.[0]} 
                            alt="thumbnail" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Specifications & Agronomy */}
                  <div className="md:col-span-7 space-y-5">
                    <div>
                      <span className="text-[10px] text-[#6B7280] font-extrabold uppercase tracking-wider block">Description</span>
                      <p className="text-xs text-stone-600 leading-relaxed font-semibold mt-1.5">
                        {selectedProduct.description || 'Professional, double-sieved washed coir substrate blocks optimized for industrial B2B greenhouses requiring high drainage index, buffered EC balance, and premium physical consistency.'}
                      </p>
                    </div>

                    {/* Spec sheet layout */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-[#6B7280] font-extrabold uppercase tracking-wider block">Verified Analytical Report</span>
                      <div className="grid grid-cols-2 gap-3 text-xs bg-[#F7F9F7] border border-stone-200/60 p-4.5 rounded-[18px] font-bold">
                        <div className="flex justify-between pr-2.5 border-r border-stone-200">
                          <span className="text-[#6B7280] font-medium">EC Runoff:</span>
                          <span className="text-stone-900">{selectedProduct.specifications?.ec || '< 0.5 mS/cm'}</span>
                        </div>
                        <div className="flex justify-between pl-2.5">
                          <span className="text-[#6B7280] font-medium">pH scale:</span>
                          <span className="text-stone-900">{selectedProduct.specifications?.ph || '5.5 - 6.5'}</span>
                        </div>
                        <div className="flex justify-between pr-2.5 border-r border-stone-200">
                          <span className="text-[#6B7280] font-medium">Moisture:</span>
                          <span className="text-stone-900">{selectedProduct.specifications?.moisture || '< 20%'}</span>
                        </div>
                        <div className="flex justify-between pl-2.5">
                          <span className="text-[#6B7280] font-medium">Expansion:</span>
                          <span className="text-stone-900">{selectedProduct.specifications?.expansionVolume || '15 L / kg'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Certifications and special notes */}
                    <div className="flex gap-4 text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200/50 p-4 rounded-[18px]">
                      <div className="flex items-center space-x-2">
                        <Droplet className="w-4 h-4 text-[#2E7D32]" />
                        <span>Buffered Freshwater Washed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Wind className="w-4 h-4 text-[#2E7D32]" />
                        <span>High Air Porosity Index</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related items */}
                {getRelatedProducts(selectedProduct).length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-stone-100">
                    <h4 className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">
                      Related Organic Products
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {getRelatedProducts(selectedProduct).map((item) => (
                        <div 
                          key={item._id} 
                          onClick={() => setSelectedProduct(item)}
                          className="border border-stone-200 rounded-[18px] p-3.5 cursor-pointer hover:shadow-md hover:border-[#2E7D32] transition-all flex gap-3 items-center bg-white"
                        >
                          <div className="w-12 h-12 rounded-[10px] overflow-hidden bg-stone-50 flex-shrink-0 relative">
                            <ImageWithFallback src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="leading-snug">
                            <h5 className="font-extrabold text-xs text-stone-900 line-clamp-1">{item.name}</h5>
                            <span className="text-[10.5px] text-[#2E7D32] font-bold block mt-0.5">{convertCurrency(item.price, user?.currency).formatted}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* STICKY BOTTOM CHECKOUT STRIP */}
              <div className="px-6 py-4.5 bg-stone-50 border-t border-stone-150 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-[9px] text-[#6B7280] font-bold block uppercase tracking-wider">FOB Seaport pricing</span>
                  <strong className="text-xl font-poppins font-extrabold text-[#2E7D32]">{convertCurrency(selectedProduct.price, user?.currency).formatted}<span className="text-xs text-stone-400 font-bold ml-1">/ ton</span></strong>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto flex-col sm:flex-row">
                  <button
                    onClick={() => {
                      onAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full sm:w-auto bg-white border border-stone-250 hover:border-[#2E7D32] text-stone-700 hover:text-[#2E7D32] font-poppins text-xs font-bold py-3 px-6 rounded-[14px] transition-colors shadow-sm"
                  >
                    Add Container
                  </button>
                  <button
                    onClick={() => {
                      onBuyNow(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full sm:w-auto bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-poppins text-xs font-bold py-3 px-6 rounded-[14px] transition-all shadow-md shadow-[#2E7D32]/10"
                  >
                    Buy 1 Container
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;
