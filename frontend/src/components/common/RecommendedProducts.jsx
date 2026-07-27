import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiClient, useAuth } from '../../context/AuthContext';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ProductCard from '../../dashboards/ProductCard';

const RecommendedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, fetchProfile, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.firstChild?.offsetWidth || 324;
      const gap = 24; // gap-6
      scrollContainerRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.firstChild?.offsetWidth || 324;
      const gap = 24; // gap-6
      scrollContainerRef.current.scrollBy({ left: (cardWidth + gap), behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await apiClient.get('/products/recommended');
        const sortedProducts = prodRes.data.success ? prodRes.data.data : [];
        setProducts(sortedProducts);
      } catch (err) {
        console.error('Failed to fetch recommended products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleWishlistToggle = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleWishlist(product);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await apiClient.post('/users/cart', { productId: product._id, quantity: 1, increment: true });
      await fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const isWishlisted = (id) => {
    return user?.wishlist?.some((item) => item._id === id);
  };

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-12 w-full relative">
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-xl font-extrabold text-stone-900 text-left">Recommended For You</h3>
        <div className="flex gap-2">
          <button 
            onClick={scrollLeft} 
            className="w-10 h-10 rounded-full border border-stone-200 bg-white flex items-center justify-center hover:bg-stone-50 hover:text-[#2E7D32] transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={scrollRight} 
            className="w-10 h-10 rounded-full border border-stone-200 bg-white flex items-center justify-center hover:bg-stone-50 hover:text-[#2E7D32] transition-colors shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div ref={scrollContainerRef} className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth">
        {products.map((product, idx) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="w-full sm:w-[300px] snap-center flex-shrink-0"
          >
            <ProductCard
              product={product}
              isWishlisted={isWishlisted(product._id)}
              onWishlistToggle={handleWishlistToggle}
              onAddToCart={handleAddToCart}
              onCardClick={(p) => navigate(`/products/${p.slug || p._id}`)}
            />
          </motion.div>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default RecommendedProducts;
