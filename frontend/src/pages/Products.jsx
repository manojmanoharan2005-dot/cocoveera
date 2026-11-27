/**
 * File: frontend/src/pages/Products.jsx
 * Purpose: Cocoveera Products Listing Page.
 * Architecture:
 *   - Desktop (>= 768px / md:): 100% UNCHANGED, preserving the exact finalized desktop layout,
 *     typography, category pill wrap, 4-column product cards, and accreditation banner.
 *   - Mobile (< 768px / md:hidden): Completely redesigned modern mobile-first e-commerce experience
 *     with compact hero, horizontal scrollable category ribbon, full-width search bar,
 *     touch-friendly sort & filter drawer, 2-column responsive product cards with price & Add to Cart,
 *     and safe bottom padding.
 */

import React, { useState, useMemo } from 'react';
import { useAuth, apiClient } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  X, 
  SlidersHorizontal, 
  Check, 
  ShoppingCart, 
  Heart, 
  ChevronDown, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import useSWR from 'swr';
import ImageWithFallback from '../components/common/ImageWithFallback';
import { navigateToProduct } from '../utils/productNavigation';
import { convertCurrency } from '../utils/currencyConverter';

const fetcher = (url) => apiClient.get(url).then((res) => res.data.data);

// Canonical order for predictable, consistent category placement
const PREFERRED_CATEGORY_ORDER = [
  'Coco Cubes',
  'Coir Fiber Bales',
  'Substrate Bags',
  'Erosion Control Nets & Logs',
  'Blueberry Discs',
  'Erosion Control Blankets',
  'Briquettes',
  'Open Top Grow Bags',
  'Curled Coir Ropes',
  'Cocopeat Blocks',
  'Growbags',
  'Customisable Category'
];

const Products = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Instant Add to Cart feedback tracking (productId -> boolean)
  const [addedMap, setAddedMap] = useState({});

  // Parse category from URL query parameter ?category=...
  const selectedCategory = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('category') || '';
  }, [location.search]);

  // Fetch Products & Categories
  const { data: products = [], isLoading: loadingProducts } = useSWR(
    '/products',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 600000 }
  );

  const { data: categories = [] } = useSWR(
    '/categories',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 600000 }
  );

  // Build unique category options list in stable, predictable order
  const categoryOptions = useMemo(() => {
    const set = new Set();
    categories.forEach((c) => {
      if (c && c.name && !c.name.toLowerCase().includes('demo') && !c.name.toLowerCase().includes('test')) {
        set.add(c.name.trim());
      }
    });

    const list = Array.from(set);

    return list.sort((a, b) => {
      const idxA = PREFERRED_CATEGORY_ORDER.findIndex(
        (o) => o.toLowerCase() === a.toLowerCase()
      );
      const idxB = PREFERRED_CATEGORY_ORDER.findIndex(
        (o) => o.toLowerCase() === b.toLowerCase()
      );
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [categories]);

  // Desktop Filtering (Pure category matching as originally finalized)
  const desktopFilteredProducts = useMemo(() => {
    if (!selectedCategory || selectedCategory.toLowerCase() === 'all') {
      return products;
    }
    const target = selectedCategory.toLowerCase().trim();
    return products.filter((p) => {
      const cat = (p.category || '').toLowerCase().trim();
      const name = (p.name || '').toLowerCase().trim();
      return (
        cat === target ||
        cat.includes(target) ||
        target.includes(cat) ||
        name.includes(target)
      );
    });
  }, [products, selectedCategory]);

  // Mobile Filtering & Sorting (Category + Search + Filters + Sort)
  const mobileFilteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory && selectedCategory.toLowerCase() !== 'all') {
      const target = selectedCategory.toLowerCase().trim();
      result = result.filter((p) => {
        const cat = (p.category || '').toLowerCase().trim();
        const name = (p.name || '').toLowerCase().trim();
        return (
          cat === target ||
          cat.includes(target) ||
          target.includes(cat) ||
          name.includes(target)
        );
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const desc = (p.description || p.shortDescription || '').toLowerCase();
        return name.includes(q) || cat.includes(q) || desc.includes(q);
      });
    }

    // Price filter
    if (priceFilter !== 'all') {
      result = result.filter((p) => {
        const price = p.price || 450;
        if (priceFilter === 'under10') return price < 850;
        if (priceFilter === '10to25') return price >= 850 && price <= 2100;
        if (priceFilter === '25plus') return price > 2100;
        return true;
      });
    }

    // In Stock filter
    if (inStockOnly) {
      result = result.filter((p) => p.stockStatus !== 'out_of_stock' && p.stock !== 0);
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    }

    return result;
  }, [products, selectedCategory, searchQuery, priceFilter, inStockOnly, sortBy]);

  const handleCategorySelect = (catName) => {
    if (!catName || catName.toLowerCase() === selectedCategory.toLowerCase()) {
      navigate('/products');
    } else {
      navigate(`/products?category=${encodeURIComponent(catName)}`);
    }
  };

  const handleViewDetails = (product, e) => {
    navigateToProduct(product, navigate, user, e);
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    try {
      setAddedMap((prev) => ({ ...prev, [product._id]: true }));
      await addToCart(product, 1);
      setTimeout(() => {
        setAddedMap((prev) => ({ ...prev, [product._id]: false }));
      }, 1500);
    } catch (err) {
      setAddedMap((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  const resetMobileFilters = () => {
    setSearchQuery('');
    setPriceFilter('all');
    setInStockOnly(false);
    setSortBy('featured');
    navigate('/products');
  };

  const activeMobileFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (priceFilter !== 'all') count++;
    if (inStockOnly) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, priceFilter, inStockOnly, searchQuery]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans">
      <SEO
        title={selectedCategory ? `${selectedCategory} - Products - Cocoveera` : "Our Products - Cocoveera"}
        description="Premium organic coconut substrates for global agriculture and horticulture."
        url="/products"
      />

      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP VIEW (>= 768px / md:): 100% UNCHANGED ORIGINAL LAYOUT
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* HEADER HERO */}
        <div className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 font-poppins tracking-tight mb-2 sm:mb-3">
            Our Products
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
            Premium organic coconut substrates engineered for global agriculture and horticulture
          </p>

          {/* CATEGORY FILTER PILLS */}
          <div className="mt-6 sm:mt-8 min-h-[96px] sm:min-h-[104px] flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => handleCategorySelect('')}
              className={`h-9 sm:h-10 px-4 sm:px-5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 flex items-center justify-center whitespace-nowrap border cursor-pointer select-none ${
                !selectedCategory
                  ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm'
                  : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-100/80 border-stone-200'
              }`}
            >
              All Products ({products.length})
            </button>

            {categoryOptions.map((catName) => {
              const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();
              return (
                <button
                  key={`desktop-${catName}`}
                  type="button"
                  onClick={() => handleCategorySelect(catName)}
                  className={`h-9 sm:h-10 px-4 sm:px-5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 flex items-center justify-center whitespace-nowrap border cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm'
                      : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-100/80 border-stone-200'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>
        </div>

        {/* CATALOGUE PREVIEW GRID */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 min-h-[550px]">
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-row sm:flex-col items-center gap-4 sm:gap-0 animate-pulse h-[340px]"
                >
                  <div className="w-24 h-24 sm:w-full sm:h-48 bg-stone-100 rounded-xl sm:rounded-2xl flex-shrink-0"></div>
                  <div className="flex-1 w-full flex flex-col justify-center sm:items-center">
                    <div className="h-5 bg-stone-200 rounded-md w-3/4 sm:w-2/3 mb-3"></div>
                    <div className="h-9 bg-stone-100 rounded-xl w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : desktopFilteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8 max-w-md mx-auto my-8 shadow-sm">
              <div className="w-16 h-16 bg-[#2E7D32]/10 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                📦
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                No Products Found
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm mb-6">
                No products found under &ldquo;{selectedCategory}&rdquo;. View our complete product catalog below.
              </p>
              <button
                type="button"
                onClick={() => handleCategorySelect('')}
                className="bg-[#2E7D32] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md hover:bg-[#236327] transition-all cursor-pointer"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {desktopFilteredProducts.map((product) => (
                <div
                  key={`desktop-prod-${product._id}`}
                  className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all flex flex-col items-center justify-between group cursor-pointer h-full"
                  onClick={(e) => handleViewDetails(product, e)}
                >
                  <div className="w-full h-[150px] xs:h-[180px] sm:h-[220px] bg-white rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center p-3 sm:p-5 mb-3 sm:mb-4 flex-shrink-0 relative border border-stone-100">
                    <div className="w-full h-full flex items-center justify-center relative">
                      <ImageWithFallback
                        src={product.images?.[0]}
                        alt={product.name}
                        className="max-w-full max-h-full w-auto h-auto object-contain object-center group-hover:scale-[1.03] transition-transform duration-300 ease-out"
                      />
                    </div>
                    {product.category && (
                      <span className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider hidden sm:block z-10">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 w-full flex flex-col justify-between sm:items-center min-w-0">
                    <h3 className="font-poppins font-extrabold text-stone-900 text-sm sm:text-base mb-3 sm:mb-4 sm:text-center leading-snug line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem] flex items-center justify-center">
                      {product.name}
                    </h3>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(product, e);
                      }}
                      className="w-full bg-[#FAF9F6] border border-stone-200 group-hover:border-[#2E7D32] text-stone-800 group-hover:text-[#2E7D32] group-hover:bg-[#E8F5E9]/40 font-bold text-[11px] sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 mt-auto cursor-pointer"
                    >
                      <span className="truncate">View Product Details</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2E7D32] group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BOTTOM ACCREDITATION BANNER */}
          <div className="mt-8 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-xs grid grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-1.5 sm:mb-2">
                <span className="text-base sm:text-xl">🌿</span>
              </div>
              <div className="font-bold text-[11px] sm:text-xs text-stone-900 leading-tight">100% Natural</div>
              <div className="hidden sm:block text-[10px] text-stone-500 mt-0.5">Eco-friendly &amp; sustainable</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-1.5 sm:mb-2">
                <span className="text-base sm:text-xl">🏅</span>
              </div>
              <div className="font-bold text-[11px] sm:text-xs text-stone-900 leading-tight">Premium Quality</div>
              <div className="hidden sm:block text-[10px] text-stone-500 mt-0.5">Tested &amp; verified products</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-1.5 sm:mb-2">
                <span className="text-base sm:text-xl">🌐</span>
              </div>
              <div className="font-bold text-[11px] sm:text-xs text-stone-900 leading-tight">Global Export</div>
              <div className="hidden sm:block text-[10px] text-stone-500 mt-0.5">Worldwide shipping</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-1.5 sm:mb-2">
                <span className="text-base sm:text-xl">🤝</span>
              </div>
              <div className="font-bold text-[11px] sm:text-xs text-stone-900 leading-tight">Trusted Partner</div>
              <div className="hidden sm:block text-[10px] text-stone-500 mt-0.5">Reliable &amp; consistent supply</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE VIEW (< 768px / md:hidden): DEDICATED RESPONSIVE REDESIGN
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-12">
        
        {/* 1. Mobile Page Heading */}
        <section className="pt-4 pb-2 px-3.5 text-center">
          <h1 className="text-2xl font-extrabold text-stone-900 font-poppins tracking-tight mb-1">
            Our Products
          </h1>
          <p className="text-stone-600 text-xs font-normal max-w-sm mx-auto leading-relaxed">
            Premium organic coconut substrates engineered for global agriculture and horticulture
          </p>
        </section>

        {/* 2. Mobile Product Categories: Clean Multi-Row Grid (No Horizontal Scroll) */}
        <section className="px-3 my-2.5">
          <div className="grid grid-cols-2 min-[370px]:grid-cols-3 gap-1.5">
            {/* All Products Option */}
            <button
              type="button"
              onClick={() => handleCategorySelect('')}
              className={`h-7 xs:h-8 px-2 rounded-xl text-[10px] xs:text-[11px] font-bold transition-all flex items-center justify-center text-center truncate border cursor-pointer active:scale-95 select-none ${
                !selectedCategory
                  ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-xs'
                  : 'bg-white text-stone-700 hover:text-stone-900 border-stone-200/90 shadow-2xs'
              }`}
            >
              <span className="truncate">All ({products.length})</span>
            </button>

            {/* Category Buttons */}
            {categoryOptions.map((catName) => {
              const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();
              return (
                <button
                  key={`mobile-${catName}`}
                  type="button"
                  onClick={() => handleCategorySelect(catName)}
                  className={`h-7 xs:h-8 px-2 rounded-xl text-[10px] xs:text-[11px] font-bold transition-all flex items-center justify-center text-center truncate border cursor-pointer active:scale-95 select-none ${
                    isSelected
                      ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-xs'
                      : 'bg-white text-stone-700 hover:text-stone-900 border-stone-200/90 shadow-2xs'
                  }`}
                  title={catName}
                >
                  <span className="truncate">{catName}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Mobile Full-Width Search, Sort & Filters */}
        <section className="px-3 mb-3">
          <div className="bg-white rounded-2xl border border-stone-200/90 p-2.5 shadow-xs space-y-2">
            {/* Full-width Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search substrates, blocks, grow bags..."
                className="w-full pl-8 pr-7 py-2 bg-stone-50 focus:bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2E7D32] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter and Sort Row */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-[11px] font-semibold text-stone-500">
                <strong className="text-stone-900 font-extrabold">{mobileFilteredProducts.length}</strong> {mobileFilteredProducts.length === 1 ? 'Product' : 'Products'}
              </span>

              <div className="flex items-center gap-1.5">
                {/* Filter Sheet Trigger */}
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(true)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all active:scale-95 cursor-pointer ${
                    activeMobileFilterCount > 0
                      ? 'bg-emerald-50 text-[#2E7D32] border-[#2E7D32]'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#2E7D32]" />
                  <span>Filters</span>
                  {activeMobileFilterCount > 0 && (
                    <span className="w-3.5 h-3.5 rounded-full bg-[#2E7D32] text-white text-[8px] flex items-center justify-center font-bold">
                      {activeMobileFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-stone-50 border border-stone-200 text-stone-700 text-[11px] font-bold py-1.5 pl-2.5 pr-6 rounded-xl focus:outline-none focus:border-[#2E7D32] cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low-High</option>
                    <option value="price-high">Price: High-Low</option>
                    <option value="name-asc">Name: A-Z</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-stone-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Mobile 2-Column Product Grid */}
        <section className="px-3 min-h-[400px]">
          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-2.5 xs:gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-2.5 border border-stone-200/60 shadow-2xs animate-pulse h-[240px] flex flex-col justify-between">
                  <div className="w-full h-[120px] bg-stone-100 rounded-lg"></div>
                  <div className="h-4 bg-stone-200 rounded w-3/4 my-2"></div>
                  <div className="h-[42px] bg-stone-100 rounded-lg w-full"></div>
                </div>
              ))}
            </div>
          ) : mobileFilteredProducts.length === 0 ? (
            /* Compact Mobile Empty State */
            <div className="text-center py-10 bg-white rounded-xl border border-stone-200/60 p-5 mx-1 shadow-2xs">
              <div className="w-12 h-12 bg-emerald-50 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-2.5 text-xl">
                📦
              </div>
              <h3 className="text-sm font-semibold text-stone-900 mb-1 font-poppins">
                No Products Found
              </h3>
              <p className="text-stone-500 text-[11px] mb-4">
                No products match your current search or filter criteria.
              </p>
              <button
                type="button"
                onClick={resetMobileFilters}
                className="bg-[#2E7D32] text-white font-medium text-xs px-5 py-2.5 rounded-lg shadow-2xs active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 xs:gap-3">
              {mobileFilteredProducts.map((product) => {
                const wishlisted = isWishlisted(product);

                return (
                  <div
                    key={`mobile-prod-${product._id}`}
                    onClick={(e) => handleViewDetails(product, e)}
                    className="bg-white rounded-xl border border-stone-200/60 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden group cursor-pointer relative h-full"
                  >
                    {/* Centered Image Container: reduced spacing, fixed dimensions, contain */}
                    <div className="h-[120px] xs:h-[135px] w-full relative bg-white flex items-center justify-center p-2 border-b border-stone-100/80 overflow-hidden flex-shrink-0">
                      <div className="w-full h-full flex items-center justify-center relative">
                        <ImageWithFallback
                          src={product.images?.[0]}
                          alt={product.name}
                          className="max-w-full max-h-full w-auto h-auto object-contain object-center group-hover:scale-102 transition-transform duration-300"
                        />
                      </div>

                      {/* Compact Category Badge: smaller text and padding */}
                      {product.category && (
                        <span className="absolute top-2 left-2 z-10 bg-stone-900/75 backdrop-blur-2xs text-white text-[8px] font-medium px-1.5 py-0.5 rounded-sm uppercase tracking-wider max-w-[70%] truncate">
                          {product.category}
                        </span>
                      )}

                      {/* Optional Wishlist Heart */}
                      {isAuthenticated && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/90 shadow-2xs border border-stone-200/60 flex items-center justify-center text-stone-400 active:scale-90"
                          aria-label="Wishlist"
                        >
                          <Heart
                            className={`w-3 h-3 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Card Content: reduced internal padding */}
                    <div className="p-2 xs:p-2.5 flex flex-col flex-1 justify-between gap-2">
                      {/* Product Name: font-weight 600, 14-15px, max 2 lines with clean truncation */}
                      <div className="flex-1">
                        <h2 className="font-poppins font-semibold text-stone-900 text-[13px] xs:text-[14px] min-[400px]:text-[15px] leading-snug line-clamp-2 min-h-[36px] xs:min-h-[40px] group-hover:text-[#2E7D32] transition-colors">
                          {product.name}
                        </h2>
                      </div>

                      {/* View Product Button: ~42-44px height, 14px font, weight 600, 14px arrow, single line */}
                      <div className="pt-0.5 mt-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(product, e);
                          }}
                          className="w-full h-[42px] xs:h-[44px] bg-[#2E7D32] hover:bg-[#236327] text-white font-poppins font-semibold text-[13px] xs:text-[14px] rounded-lg shadow-2xs transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer select-none whitespace-nowrap"
                        >
                          <span>View Product</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white flex-shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mobile Accreditation */}
          <div className="mt-6 bg-white rounded-xl p-3 border border-stone-200/80 shadow-xs grid grid-cols-4 gap-1.5 text-center">
            <div className="flex flex-col items-center">
              <span className="text-sm">🌿</span>
              <div className="font-bold text-[9px] text-stone-900 mt-0.5">Natural</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm">🏅</span>
              <div className="font-bold text-[9px] text-stone-900 mt-0.5">Premium</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm">🌐</span>
              <div className="font-bold text-[9px] text-stone-900 mt-0.5">Export</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm">🤝</span>
              <div className="font-bold text-[9px] text-stone-900 mt-0.5">Trusted</div>
            </div>
          </div>
        </section>

        {/* 5. Mobile Filter Drawer / Bottom Sheet */}
        <AnimatePresence>
          {isFilterOpen && (
            <div className="fixed inset-0 z-[99999] flex items-end justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              />

              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className="relative w-full bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto p-4 shadow-2xl z-10 flex flex-col"
              >
                <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-2" />

                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#2E7D32]" />
                    <h3 className="font-poppins font-black text-sm text-stone-900">
                      Filters
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetMobileFilters}
                      className="text-xs font-bold text-red-600"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="py-3 space-y-4 flex-1 overflow-y-auto">
                  {/* Category Selection */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-stone-500 block mb-1.5">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCategorySelect('')}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          !selectedCategory
                            ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        All
                      </button>
                      {categoryOptions.map((catName) => {
                        const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();
                        return (
                          <button
                            key={`sheet-cat-${catName}`}
                            type="button"
                            onClick={() => handleCategorySelect(catName)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              isSelected
                                ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                                : 'bg-stone-50 text-stone-700 border-stone-200'
                            }`}
                          >
                            {catName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-stone-500 block mb-1.5">
                      Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'all', label: 'All Prices' },
                        { id: 'under10', label: 'Under $10' },
                        { id: '10to25', label: '$10 – $25' },
                        { id: '25plus', label: '$25+' }
                      ].map((tier) => (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setPriceFilter(tier.id)}
                          className={`p-2 rounded-lg text-xs font-bold border text-center ${
                            priceFilter === tier.id
                              ? 'bg-emerald-50 text-[#2E7D32] border-[#2E7D32]'
                              : 'bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          {tier.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* In Stock */}
                  <div>
                    <label className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="w-4 h-4 text-[#2E7D32] rounded focus:ring-[#2E7D32]"
                      />
                      <span className="text-xs font-bold text-stone-800">
                        In-Stock Only
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-3 bg-[#2E7D32] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Apply ({mobileFilteredProducts.length} Results)
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Products;
