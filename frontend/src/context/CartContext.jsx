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
      totalCartAmount: 0,
      loading: false,
      addToCart: async () => false,
      updateQuantity: async () => false,
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
  const { user, isAuthenticated, fetchProfile } = useAuth();
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
      if (res.data?.success) {
        const items = res.data.data || res.data.cart || [];
        setCart(sanitizeCartItems(items));
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

  // Add container configuration or direct product to cart
  const addToCart = useCallback(async (productOrPayload, quantity = 1, increment = true, silent = false) => {
    if (!isAuthenticated) {
      if (!silent) showToast('Please log in to add items to your cart', 'error');
      return false;
    }
    setLoading(true);
    try {
      let payload;
      if (productOrPayload && typeof productOrPayload === 'object' && productOrPayload.mainProductId) {
        // Container configuration payload shape
        payload = productOrPayload;
      } else if (productOrPayload && typeof productOrPayload === 'object' && (productOrPayload.productId || productOrPayload._id)) {
        // Product object shape
        const prodId = productOrPayload.productId || productOrPayload._id;
        const qty = productOrPayload.quantity !== undefined ? Number(productOrPayload.quantity) : Number(quantity);
        payload = {
          productId: prodId,
          mainProductId: prodId,
          quantity: qty,
          mainQuantity: qty,
          totalContainers: qty,
          increment: productOrPayload.increment !== undefined ? productOrPayload.increment : increment,
        };
      } else if (typeof productOrPayload === 'string') {
        // Product ID string shape
        payload = {
          productId: productOrPayload,
          mainProductId: productOrPayload,
          quantity: Number(quantity),
          mainQuantity: Number(quantity),
          totalContainers: Number(quantity),
          increment,
        };
      } else {
        payload = productOrPayload;
      }

      const res = await apiClient.post('/cart', payload);
      if (res.data?.success) {
        const items = res.data.data || res.data.cart || [];
        setCart(sanitizeCartItems(items));
        if (!silent) showToast('Product added to cart!');
        if (fetchProfile) fetchProfile().catch(() => {});
        return true;
      } else {
        if (!silent) showToast(res.data?.message || 'Failed to add to cart', 'error');
        return false;
      }
    } catch (err) {
      console.error('Add to Cart Error:', err);
      const errMsg = err.response?.data?.message || 'Error saving to cart';
      if (!silent) showToast(errMsg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, sanitizeCartItems, showToast, fetchProfile]);

  // Remove a specific cart item
  const removeFromCart = useCallback(async (itemId, silent = false) => {
    if (!isAuthenticated || !itemId) return false;
    setLoading(true);
    try {
      const res = await apiClient.delete(`/cart/${itemId}`);
      if (res.data?.success) {
        const items = res.data.data || res.data.cart || [];
        setCart(sanitizeCartItems(items));
        if (!silent) showToast('Item removed from cart');
        if (fetchProfile) fetchProfile().catch(() => {});
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
  }, [isAuthenticated, sanitizeCartItems, showToast, fetchProfile]);

  // Update existing cart item (Edit configuration or quantity)
  const updateCartItem = useCallback(async (itemId, payload, silent = false) => {
    if (!isAuthenticated || !itemId) return false;
    setLoading(true);
    try {
      const res = await apiClient.put(`/cart/${itemId}`, payload);
      if (res.data?.success) {
        const items = res.data.data || res.data.cart || [];
        setCart(sanitizeCartItems(items));
        if (!silent) showToast('Cart updated!');
        if (fetchProfile) fetchProfile().catch(() => {});
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
  }, [isAuthenticated, sanitizeCartItems, showToast, fetchProfile]);

  // Quick quantity modifier (+ / -)
  const updateQuantity = useCallback(async (itemId, newQuantity, silent = false) => {
    if (!isAuthenticated || !itemId) return false;
    if (newQuantity <= 0) {
      return removeFromCart(itemId, silent);
    }
    return updateCartItem(itemId, { quantity: newQuantity, mainQuantity: newQuantity, totalContainers: newQuantity }, silent);
  }, [isAuthenticated, updateCartItem, removeFromCart]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return false;
    setLoading(true);
    try {
      const res = await apiClient.delete('/cart');
      if (res.data?.success) {
        setCart([]);
        showToast('Cart cleared');
        if (fetchProfile) fetchProfile().catch(() => {});
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
  }, [isAuthenticated, showToast, fetchProfile]);

  // Cart count: SUM of quantities of all products in the cart
  const cartCount = useMemo(() => {
    return (cart || []).reduce((sum, item) => {
      if (!item) return sum;
      if (item.completedContainers && item.completedContainers.length > 0) {
        const cCount = item.completedContainers.length;
        const aLoad = Number(item.activeContainer?.totalLoad || 0);
        return sum + Math.max(1, Math.round(cCount + aLoad));
      }
      const qty = Number(item.mainQuantity) || Number(item.totalContainers) || 1;
      return sum + qty;
    }, 0);
  }, [cart]);
  
  const totalContainersCount = useMemo(() => {
    return cart.reduce((acc, item) => {
      const completedCount = item.completedContainers?.length || 0;
      const activeLoad = item.activeContainer?.totalLoad || 0;
      return acc + (completedCount > 0 ? completedCount : 0) + (activeLoad > 0 ? activeLoad : 0);
    }, 0);
  }, [cart]);

  const totalCartAmount = useMemo(() => {
    return (cart || []).reduce((sum, item) => {
      if (!item || !item.mainProduct) return sum;
      const price = Number(item.mainProduct.price) || 0;
      const qty = Number(item.mainQuantity) || Number(item.totalContainers) || 1;
      return sum + (price * qty);
    }, 0);
  }, [cart]);

  const contextValue = useMemo(() => ({
    cart,
    cartCount,
    totalContainersCount,
    totalCartAmount,
    loading,
    toast,
    addToCart,
    updateQuantity,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
  }), [cart, cartCount, totalContainersCount, totalCartAmount, loading, toast, addToCart, updateQuantity, updateCartItem, removeFromCart, clearCart, fetchCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
