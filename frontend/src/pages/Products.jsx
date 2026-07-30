/**
 * File: frontend/src/pages/Products.jsx
 * Purpose: Public Product Catalogue Preview.
 * Displays ONLY Product Image, Product Name, and "View Product Details" button.
 * Redirects unauthenticated users to Login -> Customer Dashboard Product View.
 */

import React, { useMemo } from 'react';
import { useAuth, apiClient } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';
import SEO from '../components/SEO';
import useSWR from 'swr';
import ImageWithFallback from '../components/common/ImageWithFallback';

const fetcher = (url) => apiClient.get(url).then((res) => res.data.data);

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: products = [], isLoading: loading } = useSWR(
    '/products',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 600000 }
  );

  const handleViewDetails = (product) => {
    const targetProductPath = `/product/${product.slug || product._id}`;

    if (!user) {
      // Store intended destination inside Customer Dashboard
      sessionStorage.setItem('postLoginRedirect', targetProductPath);
      navigate(`/login?redirect=${encodeURIComponent(targetProductPath)}`);
    } else {
      navigate(targetProductPath);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans">
      <SEO
        title="Our Products - Cocoveera"
        description="Premium organic coconut substrates for global agriculture and horticulture."
        url="/products"
      />

      {/* HEADER HERO */}
      <div className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 font-poppins tracking-tight mb-3">
          Our Products
        </h1>
        <p className="text-stone-600 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
          Premium coco based products for global agriculture and horticulture
        </p>
      </div>

      {/* CATALOGUE PREVIEW GRID / MOBILE LIST */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all flex flex-row sm:flex-col items-center gap-3.5 sm:gap-0 group cursor-pointer"
                onClick={() => handleViewDetails(product)}
              >
                {/* Product Image - Compact on Mobile, Square Grid on Desktop */}
                <div className="w-28 h-24 sm:w-full sm:h-52 bg-stone-50/70 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center p-2 sm:p-3 sm:mb-4 flex-shrink-0 relative">
                  <ImageWithFallback
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
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

        {/* BOTTOM ACCREDITATION BANNER - Matches Reference 2 Bottom Bar */}
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
