/**
 * File: frontend/src/context/WishlistContext.jsx
 * Purpose: Centralized Wishlist Store & Single Source of Truth for all frontend components.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth, apiClient } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingOps, setPendingOps] = useState(new Set());
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // Synchronize initial wishlist state from Auth user context or fetch from REST API
  useEffect(() => {
    if (isAuthenticated && user?.wishlist) {
      setWishlist(user.wishlist || []);
    } else if (!isAuthenticated) {
      setWishlist([]);
    }
  }, [isAuthenticated, user?.wishlist]);

  // Initial fetch from GET /api/wishlist on auth startup
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/wishlist');
      if (res.data?.success) {
        setWishlist(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Helper check if a product is in wishlist (accepts ID or Product Object)
  const isWishlisted = useCallback((productOrId) => {
    if (!productOrId) return false;
    const targetId = typeof productOrId === 'string' ? productOrId : (productOrId._id || productOrId.id);
    return wishlist.some(item => {
      const itemId = typeof item === 'string' ? item : (item._id || item.id);
      return itemId === targetId;
    });
  }, [wishlist]);

  // Add Product to Wishlist with Optimistic UI Update
  const addToWishlist = useCallback(async (product) => {
    if (!isAuthenticated) {
      showToast('Please login to save items to your wishlist', 'error');
      return false;
    }

    const productId = typeof product === 'string' ? product : (product._id || product.id);
    if (!productId) return false;
    if (pendingOps.has(productId)) return true;

    setPendingOps(prev => new Set(prev).add(productId));

    // 1. Optimistic UI update
    setWishlist(prev => {
      const exists = prev.some(item => {
        const id = typeof item === 'string' ? item : (item._id || item.id);
        return id === productId;
      });
      if (exists) return prev;
      return [...prev, product];
    });

    showToast('Added to Wishlist!', 'success');

    // 2. API Request
    try {
      const res = await apiClient.post('/wishlist', { productId });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setWishlist(res.data.data);
      }
      return true;
    } catch (err) {
      console.error('API Error adding to wishlist:', err);
      // Rollback
      setWishlist(prev => prev.filter(item => {
        const id = typeof item === 'string' ? item : (item._id || item.id);
        return id !== productId;
      }));
      showToast('Unable to update Wishlist. Please try again.', 'error');
      return false;
    } finally {
      setPendingOps(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, [isAuthenticated, pendingOps, showToast]);

  // Remove Product from Wishlist with Optimistic UI Update
  const removeFromWishlist = useCallback(async (productOrId) => {
    if (!isAuthenticated) return false;

    const productId = typeof productOrId === 'string' ? productOrId : (productOrId._id || productOrId.id);
    if (!productId) return false;
    if (pendingOps.has(productId)) return true;

    setPendingOps(prev => new Set(prev).add(productId));

    // Preserve previous item in case rollback is needed
    const previousWishlist = [...wishlist];

    // 1. Optimistic UI removal
    setWishlist(prev => prev.filter(item => {
      const id = typeof item === 'string' ? item : (item._id || item.id);
      return id !== productId;
    }));

    showToast('Removed from Wishlist', 'info');

    // 2. API Request
    try {
      const res = await apiClient.delete(`/wishlist/${productId}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setWishlist(res.data.data);
      }
      return true;
    } catch (err) {
      console.error('API Error removing from wishlist:', err);
      // Rollback
      setWishlist(previousWishlist);
      showToast('Unable to update Wishlist. Please try again.', 'error');
      return false;
    } finally {
      setPendingOps(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, [isAuthenticated, wishlist, pendingOps, showToast]);

  // Toggle Product Wishlist state
  const toggleWishlist = useCallback((productOrId) => {
    if (isWishlisted(productOrId)) {
      return removeFromWishlist(productOrId);
    } else {
      return addToWishlist(productOrId);
    }
  }, [isWishlisted, removeFromWishlist, addToWishlist]);

  // Clear All Wishlist Items with Optimistic UI Update
  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated || wishlist.length === 0) return;

    const previousWishlist = [...wishlist];
    setWishlist([]);
    showToast('Wishlist cleared', 'info');

    try {
      // apiClient already has baseURL = API_URL ('/api'), so use '/wishlist'
      const res = await apiClient.delete('/wishlist');
      if (res.data?.success) {
        setWishlist([]);
      }
    } catch (err) {
      console.error('Wishlist Clear Error Details:', err.response ? err.response.data : err.message);
      setWishlist(previousWishlist);
      showToast('Unable to clear Wishlist. Please try again.', 'error');
    }
  }, [isAuthenticated, wishlist, showToast]);

  const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

  const value = useMemo(() => ({
    wishlist,
    wishlistCount,
    loading,
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    fetchWishlist,
    toast
  }), [wishlist, wishlistCount, loading, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist, fetchWishlist, toast]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
      {/* Global Toast Notification Component */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[99999] pointer-events-none animate-slide-up">
          <div className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-extrabold flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-650 border-red-200'
              : toast.type === 'info'
              ? 'bg-stone-900 text-white border-stone-800'
              : 'bg-[#2E7D32] text-white border-green-600'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </WishlistContext.Provider>
  );
};
