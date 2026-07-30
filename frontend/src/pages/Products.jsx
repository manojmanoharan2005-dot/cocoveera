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

      {/* CATALOGUE PREVIEW GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs flex flex-col items-center animate-pulse"
              >
                <div className="w-full h-48 bg-stone-100 rounded-2xl mb-4"></div>
                <div className="h-5 bg-stone-200 rounded-md w-2/3 mb-4"></div>
                <div className="h-10 bg-stone-100 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all flex flex-col items-center group cursor-pointer"
                onClick={() => handleViewDetails(product)}
              >
                {/* Product Image */}
                <div className="w-full h-48 sm:h-52 bg-stone-50/60 rounded-2xl overflow-hidden flex items-center justify-center p-3 mb-4 relative">
                  <ImageWithFallback
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Product Name */}
                <h3 className="font-poppins font-extrabold text-stone-900 text-base sm:text-lg mb-4 text-center leading-snug">
                  {product.name}
                </h3>

                {/* View Product Details Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(product);
                  }}
                  className="w-full bg-[#FAF9F6] border border-stone-200 group-hover:border-[#2E7D32] text-stone-800 group-hover:text-[#2E7D32] group-hover:bg-[#E8F5E9]/40 font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 mt-auto"
                >
                  <span>View Product Details</span>
                  <ArrowRight className="w-4 h-4 text-[#2E7D32] group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* BOTTOM ACCREDITATION BANNER */}
        <div className="mt-12 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-2">
              <span className="text-lg">🌿</span>
            </div>
            <div className="font-bold text-xs text-stone-900">100% Natural</div>
            <div className="text-[10px] text-stone-500">Eco-friendly & sustainable</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-2">
              <span className="text-lg">🏅</span>
            </div>
            <div className="font-bold text-xs text-stone-900">Premium Quality</div>
            <div className="text-[10px] text-stone-500">Tested & verified products</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-2">
              <span className="text-lg">🌐</span>
            </div>
            <div className="font-bold text-xs text-stone-900">Global Export</div>
            <div className="text-[10px] text-stone-500">Worldwide shipping</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-2">
              <span className="text-lg">🤝</span>
            </div>
            <div className="font-bold text-xs text-stone-900">Trusted Partner</div>
            <div className="text-[10px] text-stone-500">Reliable & consistent supply</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
