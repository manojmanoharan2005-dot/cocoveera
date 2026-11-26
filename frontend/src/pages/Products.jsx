/**
 * File: frontend/src/pages/Products.jsx
 * Purpose: Premium Mobile-First E-Commerce Products Listing Page for Cocoveera.
 * Features:
 *  - Responsive 2-column mobile product cards (320px–430px) & 4-column desktop grid.
 *  - Horizontal swipeable category ribbon with canonical order and smooth touch scrolling.
 *  - Mobile search bar, sorting options, and slide-up filter bottom sheet.
 *  - Large product images with object-fit: contain and neutral backgrounds.
 *  - Real-time Add to Cart with visual feedback and CartContext count synchronization.
 *  - Currency conversion integration and Wishlist support.
 *  - Sufficient bottom padding (pb-28) to protect content from the mobile bottom navigation bar.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Tag,
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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'under10', '10to25', '25plus'
  const [inStockOnly, setInStockOnly] = useState(false);

  // Instant Add to Cart feedback tracking (productId -> boolean)
  const [addedMap, setAddedMap] = useState({});

  // Active category from URL query parameter ?category=...
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
    
    // Add canonical order first
    PREFERRED_CATEGORY_ORDER.forEach(cat => set.add(cat));

    // Add any database categories
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

  // Comprehensive Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Category Filter
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

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const desc = (p.description || p.shortDescription || '').toLowerCase();
        return name.includes(q) || cat.includes(q) || desc.includes(q);
      });
    }

    // 3. Price Filter (converted roughly to USD equivalents for standard tiers)
    if (priceFilter !== 'all') {
      result = result.filter((p) => {
        const price = p.price || 450;
        // Assume INR 450 ~= $5.40, 1000 ~= $12, 2000 ~= $24
        if (priceFilter === 'under10') return price < 850;
        if (priceFilter === '10to25') return price >= 850 && price <= 2100;
        if (priceFilter === '25plus') return price > 2100;
        return true;
      });
    }

    // 4. In Stock Filter
    if (inStockOnly) {
      result = result.filter((p) => p.stockStatus !== 'out_of_stock' && p.stock !== 0);
    }

    // 5. Sorting
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

  const handleWishlistClick = (product, e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setPriceFilter('all');
    setInStockOnly(false);
    setSortBy('featured');
    navigate('/products');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (priceFilter !== 'all') count++;
    if (inStockOnly) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, priceFilter, inStockOnly, searchQuery]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans text-stone-900 selection:bg-[#2E7D32]/20 overflow-x-hidden">
      <SEO
        title={selectedCategory ? `${selectedCategory} - Products - Cocoveera` : "Our Products - Cocoveera"}
        description="Premium organic coconut coir substrates, grow bags, blocks, and discs engineered for commercial agriculture and greenhouse growers worldwide."
        url="/products"
      />

      {/* ═══════════════════════════════════════════════════════════════════
          1. COMPACT HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="pt-4 xs:pt-6 pb-2 sm:pb-4 px-3.5 xs:px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-[10.5px] xs:text-[11px] font-bold tracking-wider uppercase mb-2">
          <Sparkles className="w-3 h-3 text-[#2E7D32]" />
          <span>EXPORT-GRADE COIR SUBSTRATES</span>
        </div>
        <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 font-poppins tracking-tight mb-1.5 sm:mb-2 leading-tight">
          Our Products
        </h1>
        <p className="text-stone-600 text-xs xs:text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed">
          Premium organic coconut substrates engineered for global agriculture and commercial horticulture
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          2. HORIZONTAL SWIPEABLE CATEGORY NAVIGATION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 mt-2 mb-3 sm:mb-5">
        <div className="flex items-center gap-1.5 xs:gap-2 overflow-x-auto pb-1.5 pt-0.5 hide-scrollbar touch-pan-x -mx-1 px-1">
          {/* All Products Pill */}
          <button
            type="button"
            onClick={() => handleCategorySelect('')}
            className={`h-8 xs:h-9 sm:h-10 px-3 xs:px-4 rounded-full text-[11px] xs:text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center whitespace-nowrap border shrink-0 cursor-pointer active:scale-95 select-none ${
              !selectedCategory
                ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm'
                : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 border-stone-200/90'
            }`}
          >
            All Products ({products.length})
          </button>

          {/* Canonical & Dynamic Category Pills */}
          {categoryOptions.map((catName) => {
            const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();
            return (
              <button
                key={catName}
                type="button"
                onClick={() => handleCategorySelect(catName)}
                className={`h-8 xs:h-9 sm:h-10 px-3 xs:px-4 rounded-full text-[11px] xs:text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center whitespace-nowrap border shrink-0 cursor-pointer active:scale-95 select-none ${
                  isSelected
                    ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm'
                    : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 border-stone-200/90'
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          3. SEARCH, SORT & FILTER TOOLBAR (Mobile-First)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-2 xs:p-2.5 sm:p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 105+ substrates, blocks, grow bags..."
              className="w-full pl-9 pr-8 py-2 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 rounded-xl text-xs xs:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2E7D32] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Row: Count, Filter Drawer Button, Sort Dropdown */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Products Count */}
            <span className="text-[11px] xs:text-xs font-semibold text-stone-500 whitespace-nowrap pl-1">
              <strong className="text-stone-900 font-extrabold">{filteredProducts.length}</strong> Products
            </span>

            <div className="flex items-center gap-1.5 xs:gap-2">
              {/* Filter Button (Opens Bottom Sheet on Mobile / Drawer) */}
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                  activeFilterCount > 0
                    ? 'bg-emerald-50 text-[#2E7D32] border-[#2E7D32]'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#2E7D32] text-white text-[9px] flex items-center justify-center font-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:border-[#2E7D32] cursor-pointer"
                  aria-label="Sort products"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* Active Filter Chips / Reset Shortcut */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5 px-1">
            <span className="text-[10px] uppercase font-bold text-stone-400">Active:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-[#2E7D32] border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {selectedCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleCategorySelect('')} />
              </span>
            )}
            {priceFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-[#2E7D32] border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {priceFilter === 'under10' ? 'Under $10' : priceFilter === '10to25' ? '$10 – $25' : '$25+'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceFilter('all')} />
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-[#2E7D32] border border-emerald-200 px-2.5 py-0.5 rounded-full">
                In Stock Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => setInStockOnly(false)} />
              </span>
            )}
            <button
              onClick={resetAllFilters}
              className="text-[10.5px] font-bold text-red-600 hover:text-red-700 underline ml-1 cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          4. PRODUCT GRID (2-Column Mobile, 4-Column Desktop)
      ═══════════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 pb-28 sm:pb-20 min-h-[500px]">
        {loadingProducts ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3.5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs animate-pulse flex flex-col justify-between h-[280px] xs:h-[320px]"
              >
                <div className="w-full h-[120px] xs:h-[150px] bg-stone-100 rounded-xl mb-3"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                  <div className="h-3 bg-stone-100 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-stone-100 rounded-xl w-full mt-2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 sm:py-16 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 max-w-md mx-auto my-6 shadow-sm">
            <div className="w-14 h-14 bg-emerald-50 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
              📦
            </div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 mb-1.5 font-poppins">
              No Products Match Your Criteria
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mb-5 leading-relaxed">
              We couldn&apos;t find products matching your filters. Try clearing filters or search terms.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="bg-[#2E7D32] hover:bg-[#236327] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          /* Actual 2-Column Mobile / 4-Column Desktop Product Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3.5 sm:gap-6">
            {filteredProducts.map((product) => {
              const basePrice = product.price || 450;
              const convertedPrice = convertCurrency(basePrice, user?.currency || 'INR');
              const oldPrice = Math.round(basePrice * 1.25);
              const convertedOldPrice = convertCurrency(oldPrice, user?.currency || 'INR');
              const isAdded = !!addedMap[product._id];
              const wishlisted = isWishlisted(product);

              return (
                <div
                  key={product._id}
                  onClick={(e) => handleViewDetails(product, e)}
                  className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between overflow-hidden group cursor-pointer h-full relative"
                >
                  {/* Image Container with Consistent Height & Neutral Background */}
                  <div className="h-[130px] xs:h-[155px] sm:h-[195px] w-full relative bg-white flex items-center justify-center p-2.5 xs:p-3 sm:p-4 border-b border-stone-100 overflow-hidden flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center relative">
                      <ImageWithFallback
                        src={product.images?.[0]}
                        alt={product.name}
                        className="max-w-full max-h-full w-auto h-auto object-contain object-center group-hover:scale-[1.04] transition-transform duration-300 ease-out"
                      />
                    </div>

                    {/* Top-Left Category Badge */}
                    {product.category && (
                      <span className="absolute top-2 left-2 z-10 bg-stone-900/80 backdrop-blur-xs text-white text-[8px] xs:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider max-w-[70%] truncate">
                        {product.category}
                      </span>
                    )}

                    {/* Top-Right Wishlist Button */}
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={(e) => handleWishlistClick(product, e)}
                        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-stone-200/70 flex items-center justify-center text-stone-400 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-all ${
                            wishlisted ? 'fill-red-500 text-red-500 scale-110' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Product Details & Actions */}
                  <div className="p-2 xs:p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5">
                    {/* Title */}
                    <div>
                      <h2 className="font-poppins font-black text-stone-900 text-[11px] xs:text-xs sm:text-[13px] leading-snug line-clamp-2 group-hover:text-[#2E7D32] transition-colors min-h-[28px] xs:min-h-[32px]">
                        {product.name}
                      </h2>

                      {/* Brief Specs or Excerpt */}
                      <p className="text-[9.5px] xs:text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                        {product.specifications?.ec ? `EC: ${product.specifications.ec} • pH: ${product.specifications.ph || '5.5 - 6.5'}` : (product.description || 'Export grade 100% organic coir')}
                      </p>
                    </div>

                    {/* Price & Stock Row */}
                    <div className="pt-1 border-t border-stone-100 flex items-baseline justify-between gap-1 flex-wrap">
                      <div className="flex items-baseline gap-1">
                        <span className="font-poppins font-black text-[#2E7D32] text-xs xs:text-sm sm:text-base leading-none">
                          {convertedPrice.formatted}
                        </span>
                        <span className="text-[9px] xs:text-[9.5px] text-stone-400 line-through leading-none">
                          {convertedOldPrice.formatted}
                        </span>
                      </div>

                      <span className="text-[8px] xs:text-[8.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full">
                        In Stock
                      </span>
                    </div>

                    {/* Action Buttons: Add to Cart & View Details */}
                    <div className="pt-1.5 space-y-1">
                      {/* Primary Add to Cart Button */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`w-full py-1.5 xs:py-2 px-2 rounded-xl text-[10px] xs:text-[11px] font-bold transition-all duration-200 flex items-center justify-center gap-1 shadow-2xs active:scale-95 cursor-pointer select-none ${
                          isAdded
                            ? 'bg-[#1B5E20] text-white'
                            : 'bg-[#2E7D32] hover:bg-[#236327] text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added ✓</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      {/* Secondary View Product Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(product, e);
                        }}
                        className="w-full py-1 xs:py-1.5 px-2 bg-stone-50 hover:bg-stone-100 border border-stone-200/90 text-stone-700 hover:text-stone-900 rounded-lg text-[9px] xs:text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer select-none"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3 text-[#2E7D32]" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            5. BOTTOM ACCREDITATION BANNER
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="mt-8 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl p-3.5 xs:p-4 sm:p-6 border border-stone-200/80 shadow-xs grid grid-cols-4 gap-2 sm:gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-1">
              <span className="text-sm xs:text-base sm:text-xl">🌿</span>
            </div>
            <div className="font-bold text-[10px] xs:text-[11px] sm:text-xs text-stone-900 leading-tight">100% Natural</div>
            <div className="hidden sm:block text-[10px] text-stone-500 mt-0.5">Eco-friendly &amp; sustainable</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-1">
              <span className="text-sm xs:text-base sm:text-xl">🏅</span>
            </div>
            <div className="font-bold text-[10px] xs:text-[11px] sm:text-xs text-stone-900 leading-tight">Premium Quality</div>
            <div className="hidden sm:block text-[10px] text-stone-500 mt-0.5">Tested &amp; verified substrates</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-1">
              <span className="text-sm xs:text-base sm:text-xl">🌐</span>
            </div>
            <div className="font-bold text-[10px] xs:text-[11px] sm:text-xs text-stone-900 leading-tight">Global Export</div>
            <div className="hidden sm:block text-[10px] text-stone-500 mt-0.5">Direct FCL container delivery</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-1">
              <span className="text-sm xs:text-base sm:text-xl">🤝</span>
            </div>
            <div className="font-bold text-[10px] xs:text-[11px] sm:text-xs text-stone-900 leading-tight">Direct Supplier</div>
            <div className="hidden sm:block text-[10px] text-stone-500 mt-0.5">Consistent bulk volume</div>
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════
          6. MOBILE FILTER BOTTOM SHEET / DRAWER
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-[28px] max-h-[85vh] overflow-y-auto p-4 xs:p-5 shadow-2xl z-10 flex flex-col"
            >
              {/* Drag Handle Bar */}
              <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-3 sm:hidden" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#2E7D32]" />
                  <h3 className="font-poppins font-black text-base text-stone-900">
                    Filter &amp; Sort Products
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:text-stone-900"
                    aria-label="Close filters"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sheet Body */}
              <div className="py-4 space-y-5 flex-1 overflow-y-auto">
                {/* Category Selection */}
                <div>
                  <label className="text-xs font-black uppercase text-stone-500 tracking-wider block mb-2">
                    Product Category
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('')}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                        !selectedCategory
                          ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      All ({products.length})
                    </button>
                    {categoryOptions.map((catName) => {
                      const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();
                      return (
                        <button
                          key={`sheet-${catName}`}
                          type="button"
                          onClick={() => handleCategorySelect(catName)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
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

                {/* Price Range Filter */}
                <div>
                  <label className="text-xs font-black uppercase text-stone-500 tracking-wider block mb-2">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'all', label: 'All Prices' },
                      { id: 'under10', label: 'Under $10' },
                      { id: '10to25', label: '$10 – $25' },
                      { id: '25plus', label: '$25 & Above' }
                    ].map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setPriceFilter(tier.id)}
                        className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                          priceFilter === tier.id
                            ? 'bg-emerald-50 text-[#2E7D32] border-[#2E7D32] font-black'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Status Toggle */}
                <div>
                  <label className="text-xs font-black uppercase text-stone-500 tracking-wider block mb-2">
                    Availability
                  </label>
                  <label className="flex items-center gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 text-[#2E7D32] rounded focus:ring-[#2E7D32]"
                    />
                    <span className="text-xs font-bold text-stone-800">
                      Show In-Stock &amp; Export-Ready Products Only
                    </span>
                  </label>
                </div>

                {/* Sort Option */}
                <div>
                  <label className="text-xs font-black uppercase text-stone-500 tracking-wider block mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold p-3 rounded-xl focus:outline-none focus:border-[#2E7D32]"
                  >
                    <option value="featured">Featured / Best Sellers</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Alphabetical: A to Z</option>
                    <option value="name-desc">Alphabetical: Z to A</option>
                  </select>
                </div>
              </div>

              {/* Sheet Sticky Footer Button */}
              <div className="pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-3.5 bg-[#2E7D32] hover:bg-[#236327] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Show {filteredProducts.length} Results</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Products;
