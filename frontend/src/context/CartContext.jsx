/**
 * File: frontend/src/context/CartContext.jsx
 * Purpose: Centralized Database-Backed Shopping Cart Store for Container Configurations.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth, apiClient } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cart: [],
      cartCount: 0,
      totalContainersCount: 0,
      loading: false,
      addToCart: async () => false,
      updateCartItem: async () => false,
      removeFromCart: async () => false,
      clearCart: async () => false,
      fetchCart: async () => {},
      toast: null,
    };
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const sanitizeCartItems = useCallback((rawItems) => {
    if (!Array.isArray(rawItems)) return [];
    return rawItems.filter(item => Boolean(item && item._id && item.mainProduct));
  }, []);

  // Fetch cart from MongoDB API
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get('/cart');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCart(sanitizeCartItems(res.data.data));
      } else if (Array.isArray(res.data)) {
        setCart(sanitizeCartItems(res.data));
      }
    } catch (err) {
      console.error('Failed to fetch user cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sanitizeCartItems]);

  // Sync cart when user logs in or logs out
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated, fetchCart]);

  // Add container configuration to cart
  const addToCart = useCallback(async (payload, silent = false) => {
    if (!isAuthenticated) {
      if (!silent) showToast('Please log in to add items to your cart', 'error');
      return false;
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/cart', payload);
      if (res.data?.success) {
        setCart(sanitizeCartItems(res.data.data));
        if (!silent) showToast('Container configuration added to cart!');
        return true;
      } else {
        if (!silent) showToast(res.data?.message || 'Failed to add to cart', 'error');
        return false;
      }
    } catch (err) {
      console.error('Add to Cart Error:', err);
      if (!silent) showToast(err.response?.data?.message || 'Error saving container configuration to cart', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sanitizeCartItems, showToast]);

  // Update existing cart item (Edit configuration flow)
  const updateCartItem = useCallback(async (itemId, payload, silent = false) => {
    if (!isAuthenticated || !itemId) return false;
    setLoading(true);
    try {
      const res = await apiClient.put(`/cart/${itemId}`, payload);
      if (res.data?.success) {
        setCart(sanitizeCartItems(res.data.data));
        if (!silent) showToast('Cart container configuration updated!');
        return true;
      } else {
        if (!silent) showToast(res.data?.message || 'Failed to update cart item', 'error');
        return false;
      }
    } catch (err) {
      console.error('Update Cart Item Error:', err);
      if (!silent) showToast(err.response?.data?.message || 'Error updating cart item', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sanitizeCartItems, showToast]);

  // Remove a specific cart item
  const removeFromCart = useCallback(async (itemId, silent = false) => {
    if (!isAuthenticated || !itemId) return false;
    setLoading(true);
    try {
      const res = await apiClient.delete(`/cart/${itemId}`);
      if (res.data?.success) {
        setCart(sanitizeCartItems(res.data.data));
        if (!silent) showToast('Item removed from cart');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Remove from Cart Error:', err);
      if (!silent) showToast('Failed to remove item', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sanitizeCartItems, showToast]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return false;
    setLoading(true);
    try {
      const res = await apiClient.delete('/cart');
      if (res.data?.success) {
        setCart([]);
        showToast('Cart cleared');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Clear Cart Error:', err);
      showToast('Failed to clear cart', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast]);

  // Computed totals
  const cartCount = useMemo(() => cart.length, [cart]);
  
  const totalContainersCount = useMemo(() => {
    return cart.reduce((acc, item) => {
      const completedCount = item.completedContainers?.length || 0;
      const activeLoad = item.activeContainer?.totalLoad || 0;
      return acc + (completedCount > 0 ? completedCount : 0) + (activeLoad > 0 ? activeLoad : 0);
    }, 0);
  }, [cart]);

  const contextValue = useMemo(() => ({
    cart,
    cartCount,
    totalContainersCount,
    loading,
    toast,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
  }), [cart, cartCount, totalContainersCount, loading, toast, addToCart, updateCartItem, removeFromCart, clearCart, fetchCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
