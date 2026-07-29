/**
 * File: frontend/src/context/WishlistContext.jsx
 * Purpose: Robust, Fault-Tolerant Centralized Wishlist Store for all frontend components.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth, apiClient } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    // Return safe fallback instead of throwing error to prevent component crashes
    return {
      wishlist: [],
      wishlistCount: 0,
      loading: false,
      isWishlisted: () => false,
      addToWishlist: async () => false,
      removeFromWishlist: async () => false,
      toggleWishlist: async () => false,
      clearWishlist: async () => {},
      fetchWishlist: async () => {},
      errorState: null,
      toast: null
    };
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
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
    try {
      setToast({ message, type, id: Date.now() });
    } catch (e) {
      console.error('Toast Error:', e);
    }
  }, []);

  // Safe item sanitization helper: Filters out null/undefined or corrupt objects
  const sanitizeWishlistData = useCallback((rawData) => {
    if (!Array.isArray(rawData)) return [];
    return rawData.filter(item => {
      if (!item) return false;
      if (typeof item === 'string' && item.trim().length > 0) return true;
      if (typeof item === 'object') {
        const hasId = Boolean(item._id || item.id);
        return hasId;
      }
      return false;
    });
  }, []);

  // Synchronize initial wishlist state safely from Auth user context
  useEffect(() => {
    try {
      if (isAuthenticated && user?.wishlist) {
        setWishlist(sanitizeWishlistData(user.wishlist));
      } else if (!isAuthenticated) {
        setWishlist([]);
      }
    } catch (err) {
      console.error('Wishlist auth sync error:', err);
      setWishlist([]);
    }
  }, [isAuthenticated, user?.wishlist, sanitizeWishlistData]);

  // Initial fetch from GET /api/wishlist on auth startup
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setErrorState(null);
    try {
      const res = await apiClient.get('/wishlist');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setWishlist(sanitizeWishlistData(res.data.data));
      } else if (Array.isArray(res.data)) {
        setWishlist(sanitizeWishlistData(res.data));
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setErrorState('Unable to connect to server. Using cached data.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sanitizeWishlistData]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Helper check if a product is in wishlist safely
  const isWishlisted = useCallback((productOrId) => {
    try {
      if (!productOrId) return false;
      const targetId = typeof productOrId === 'string' ? productOrId : (productOrId._id || productOrId.id);
      if (!targetId) return false;

      return wishlist.some(item => {
        if (!item) return false;
        const itemId = typeof item === 'string' ? item : (item._id || item.id);
        return itemId === targetId;
      });
    } catch (e) {
      console.error('isWishlisted check error:', e);
      return false;
    }
  }, [wishlist]);

  // Add Product to Wishlist with Optimistic UI Update
  const addToWishlist = useCallback(async (product) => {
    try {
      if (!isAuthenticated) {
        showToast('Please login to save items to your wishlist', 'error');
        return false;
      }

      const productId = typeof product === 'string' ? product : (product?._id || product?.id);
      if (!productId) return false;
      if (pendingOps.has(productId)) return true;

      setPendingOps(prev => new Set(prev).add(productId));

      // 1. Optimistic UI update
      setWishlist(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const exists = safePrev.some(item => {
          if (!item) return false;
          const id = typeof item === 'string' ? item : (item._id || item.id);
          return id === productId;
        });
        if (exists) return safePrev;
        return [...safePrev, product];
      });

      showToast('Added to Wishlist!', 'success');

      // 2. API Request
      try {
        const res = await apiClient.post('/wishlist', { productId });
        if (res.data?.success && Array.isArray(res.data.data)) {
          setWishlist(sanitizeWishlistData(res.data.data));
        }
        return true;
      } catch (err) {
        console.error('API Error adding to wishlist:', err);
        // Rollback
        setWishlist(prev => (Array.isArray(prev) ? prev : []).filter(item => {
          if (!item) return false;
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
    } catch (fatalErr) {
      console.error('addToWishlist unhandled error:', fatalErr);
      return false;
    }
  }, [isAuthenticated, pendingOps, showToast, sanitizeWishlistData]);

  // Remove Product from Wishlist with Optimistic UI Update
  const removeFromWishlist = useCallback(async (productOrId) => {
    try {
      if (!isAuthenticated) return false;

      const productId = typeof productOrId === 'string' ? productOrId : (productOrId?._id || productOrId?.id);
      if (!productId) return false;
      if (pendingOps.has(productId)) return true;

      setPendingOps(prev => new Set(prev).add(productId));

      // Preserve previous item in case rollback is needed
      const previousWishlist = [...wishlist];

      // 1. Optimistic UI removal
      setWishlist(prev => (Array.isArray(prev) ? prev : []).filter(item => {
        if (!item) return false;
        const id = typeof item === 'string' ? item : (item._id || item.id);
        return id !== productId;
      }));

      showToast('Removed from Wishlist', 'info');

      // 2. API Request
      try {
        const res = await apiClient.delete(`/wishlist/${productId}`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          setWishlist(sanitizeWishlistData(res.data.data));
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
    } catch (fatalErr) {
      console.error('removeFromWishlist unhandled error:', fatalErr);
      return false;
    }
  }, [isAuthenticated, wishlist, pendingOps, showToast, sanitizeWishlistData]);

  // Toggle Product Wishlist state
  const toggleWishlist = useCallback((productOrId) => {
    try {
      if (isWishlisted(productOrId)) {
        return removeFromWishlist(productOrId);
      } else {
        return addToWishlist(productOrId);
      }
    } catch (e) {
      console.error('toggleWishlist error:', e);
      return false;
    }
  }, [isWishlisted, removeFromWishlist, addToWishlist]);

  // Clear All Wishlist Items with Optimistic UI Update
  const clearWishlist = useCallback(async () => {
    try {
      if (!isAuthenticated || wishlist.length === 0) return;

      const previousWishlist = [...wishlist];
      setWishlist([]);
      showToast('Wishlist cleared', 'info');

      try {
        const res = await apiClient.delete('/wishlist');
        if (res.data?.success) {
          setWishlist([]);
        }
      } catch (err) {
        console.error('Wishlist Clear Error Details:', err.response ? err.response.data : err.message);
        setWishlist(previousWishlist);
        showToast('Unable to clear Wishlist. Please try again.', 'error');
      }
    } catch (fatalErr) {
      console.error('clearWishlist unhandled error:', fatalErr);
    }
  }, [isAuthenticated, wishlist, showToast]);

  const wishlistCount = useMemo(() => {
    return Array.isArray(wishlist) ? wishlist.length : 0;
  }, [wishlist]);

  const value = useMemo(() => ({
    wishlist,
    wishlistCount,
    loading,
    errorState,
    isWishlisted,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    fetchWishlist,
    toast
  }), [wishlist, wishlistCount, loading, errorState, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist, fetchWishlist, toast]);

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
