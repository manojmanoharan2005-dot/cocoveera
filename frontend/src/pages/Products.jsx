import React, { useMemo } from 'react';
import { useAuth, apiClient } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import useSWR from 'swr';
import ImageWithFallback from '../components/common/ImageWithFallback';
import { navigateToProduct } from '../utils/productNavigation';

const fetcher = (url) => apiClient.get(url).then((res) => res.data.data);

// Canonical order for predictable, consistent filter button placement
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
  'Growbags'
];

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

  // Build unique category options list in stable, predictable order
  const categoryOptions = useMemo(() => {
    const set = new Set();
    categories.forEach((c) => {
      if (c && c.name && !c.name.toLowerCase().includes('demo') && !c.name.toLowerCase().includes('test')) {
        set.add(c.name.trim());
      }
    });

    const list = Array.from(set);

    // Sort according to canonical ordering to guarantee rock-solid button positions
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
    if (!catName || catName.toLowerCase() === selectedCategory.toLowerCase()) {
      navigate('/products');
    } else {
      navigate(`/products?category=${encodeURIComponent(catName)}`);
    }
  };

  const handleViewDetails = (product, e) => {
    navigateToProduct(product, navigate, user, e);
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans">
      <SEO
        title={selectedCategory ? `${selectedCategory} - Products - Cocoveera` : "Our Products - Cocoveera"}
        description="Premium organic coconut substrates for global agriculture and horticulture."
        url="/products"
      />

      {/* HEADER HERO - Stable height and position to prevent layout shifting */}
      <div className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 font-poppins tracking-tight mb-2 sm:mb-3">
          Our Products
        </h1>
        <p className="text-stone-600 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
          Premium organic coconut substrates engineered for global agriculture and horticulture
        </p>

        {/* CATEGORY FILTER PILLS - Reserved space and fixed button dimensions */}
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
                key={catName}
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

      {/* CATALOGUE PREVIEW GRID / MOBILE LIST */}
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
        ) : filteredProducts.length === 0 ? (
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
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all flex flex-col items-center justify-between group cursor-pointer h-full"
                onClick={() => handleViewDetails(product)}
              >
                {/* Product Image Container - Fixed height with generous breathing space */}
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

                {/* Bottom content: title with fixed min-height for uniform alignment across rows, plus action button */}
                <div className="flex-1 w-full flex flex-col justify-between sm:items-center min-w-0">
                  <h3 className="font-poppins font-extrabold text-stone-900 text-sm sm:text-base mb-3 sm:mb-4 sm:text-center leading-snug line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem] flex items-center justify-center">
                    {product.name}
                  </h3>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(product);
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
  );
};

export default Products;
