import React, { useMemo } from 'react';
import { useAuth, apiClient } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Filter, X, Check } from 'lucide-react';
import SEO from '../components/SEO';
import useSWR from 'swr';
import ImageWithFallback from '../components/common/ImageWithFallback';

const fetcher = (url) => apiClient.get(url).then((res) => res.data.data);

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Build unique category options list
  const categoryOptions = useMemo(() => {
    const set = new Set();
    categories.forEach((c) => {
      if (c.name) set.add(c.name.trim());
    });
    products.forEach((p) => {
      if (p.category) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [categories, products]);

  // Filter products matching selectedCategory
  const filteredProducts = useMemo(() => {
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

  const handleCategorySelect = (catName) => {
    if (!catName || catName === selectedCategory) {
      navigate('/products');
    } else {
      navigate(`/products?category=${encodeURIComponent(catName)}`);
    }
  };

  const handleViewDetails = (product) => {
    const targetProductPath = `/product/${product.slug || product._id}`;

    if (!user) {
      sessionStorage.setItem('postLoginRedirect', targetProductPath);
      navigate(`/login?redirect=${encodeURIComponent(targetProductPath)}`);
    } else {
      navigate(targetProductPath);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans">
      <SEO
        title={selectedCategory ? `${selectedCategory} - Products - Cocoveera` : "Our Products - Cocoveera"}
        description="Premium organic coconut substrates for global agriculture and horticulture."
        url="/products"
      />

      {/* HEADER HERO */}
      <div className="pt-12 pb-6 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 font-poppins tracking-tight mb-3">
          {selectedCategory ? selectedCategory : "Our Products"}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
          {selectedCategory
            ? `Explore our range of premium export-grade ${selectedCategory} engineered for global growers.`
            : "Premium coco based products for global agriculture and horticulture"}
        </p>

        {/* CATEGORY FILTER PILLS */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => handleCategorySelect('')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
              !selectedCategory
                ? 'bg-[#2E7D32] text-white shadow-md'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            All Products ({products.length})
          </button>

          {categoryOptions.map((catName) => {
            const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();
            return (
              <button
                key={catName}
                onClick={() => handleCategorySelect(catName)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#2E7D32] text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {catName}
                {isSelected && <X className="w-3.5 h-3.5 ml-1 hover:text-stone-200" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* CATALOGUE PREVIEW GRID / MOBILE LIST */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-row sm:flex-col items-center gap-4 sm:gap-0 animate-pulse"
              >
                <div className="w-24 h-24 sm:w-full sm:h-48 bg-stone-100 rounded-xl sm:rounded-2xl flex-shrink-0"></div>
                <div className="flex-1 w-full flex flex-col justify-center sm:items-center">
                  <div className="h-5 bg-stone-200 rounded-md w-3/4 sm:w-2/3 mb-3"></div>
                  <div className="h-9 bg-stone-100 rounded-xl w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8 max-w-md mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 bg-[#2E7D32]/10 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">
              No Products Found
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mb-6">
              No products found under "{selectedCategory}". View our complete product catalog below.
            </p>
            <button
              onClick={() => handleCategorySelect('')}
              className="bg-[#2E7D32] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md hover:bg-[#236327] transition-all"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all flex flex-col items-center group cursor-pointer"
                onClick={() => handleViewDetails(product)}
              >
                {/* Product Image Container - Fixed height with generous breathing space */}
                <div className="w-full h-[200px] sm:h-[250px] bg-white rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center p-4 sm:p-6 sm:mb-4 flex-shrink-0 relative border border-stone-100">
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

                {/* Right side content on mobile, Center aligned on desktop */}
                <div className="flex-1 w-full flex flex-col justify-center sm:items-center min-w-0">
                  {/* Product Name */}
                  <h3 className="font-poppins font-extrabold text-stone-900 text-sm sm:text-lg mb-2 sm:mb-4 sm:text-center leading-tight sm:leading-snug truncate sm:whitespace-normal">
                    {product.name}
                  </h3>

                  {/* View Product Details Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(product);
                    }}
                    className="w-full sm:w-full bg-[#FAF9F6] border border-stone-200 group-hover:border-[#2E7D32] text-stone-800 group-hover:text-[#2E7D32] group-hover:bg-[#E8F5E9]/40 font-bold text-[11px] sm:text-sm py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 mt-auto"
                  >
                    <span className="truncate">View Product Details</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2E7D32] group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </button>
                </div>
              </motion.div>
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
  );
};

export default Products;

