/**
 * File: frontend/src/context/AuthContext.jsx
 * Purpose: Provides global state management context using React Context API.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

import { API_URL } from '../utils/config';

// Create default axios instance pointing to backend
export const apiClient = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cocoveera_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cocoveera_token'));
  
  // Explicitly track auth loading state
  const [loading, setLoading] = useState(!!localStorage.getItem('cocoveera_token'));
  
  // Derived state for strict authentication checks
  const isAuthenticated = !!user && !!token;
  
  const [error, setError] = useState(null);
  const [pendingWishlist, setPendingWishlist] = useState(new Set());

  // Global unauthorized listener
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const fetchProfile = async () => {
    if (token) {
      try {
        const res = await apiClient.get('/users/profile');
        if (res.data.success) {
          setUser(res.data.data);
          localStorage.setItem('cocoveera_user', JSON.stringify(res.data.data));
          setLoading(false);
          return res.data.data;
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session expired or connection failed:', err.message);
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const register = async (name, email, phone, password, country, countryCode, currency, companyName) => {
    setError(null);
    try {
      const res = await apiClient.post('/auth/register', { name, email, phone, password, country, countryCode, currency, companyName });
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const verifyOtp = async (email, otp) => {
    setError(null);
    try {
      const res = await apiClient.post('/auth/verify-otp', { email, otp });
      if (res.data.success) {
        localStorage.setItem('cocoveera_token', res.data.token);
        localStorage.setItem('cocoveera_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
      }
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'OTP verification failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data.success) {
        if (!res.data.requiresAdminVerification) {
          localStorage.setItem('cocoveera_token', res.data.token);
          localStorage.setItem('cocoveera_user', JSON.stringify(res.data.user));
          setToken(res.data.token);
          setUser(res.data.user);
        }
      }
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const googleLogin = async (email, name, googleId) => {
    setError(null);
    try {
      const res = await apiClient.post('/auth/google', { email, name, googleId });
      if (res.data.success) {
        localStorage.setItem('cocoveera_token', res.data.token);
        localStorage.setItem('cocoveera_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
      }
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Google Auth failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('cocoveera_token');
    localStorage.removeItem('cocoveera_user');
    sessionStorage.clear();
    
    // Clear any potential cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setToken(null);
    setUser(null);
    setError(null);
    setLoading(false);
    navigate('/', { replace: true });
  };

  const toggleWishlist = async (product) => {
    const t0 = performance.now();
    console.log(`[Wishlist] Heart Click -> ${t0}ms`);
    
    if (!user) return false;
    const productId = typeof product === 'string' ? product : (product._id || product.id);
    
    if (pendingWishlist.has(productId)) return true; // Already processing
    
    setPendingWishlist(prev => new Set(prev).add(productId));

    const currentWishlist = user.wishlist || [];
    const isWishlisted = currentWishlist.some(p => (p._id || p.id || p) === productId);
    
    // Optimistic UI Update
    const newWishlist = isWishlisted 
      ? currentWishlist.filter(p => (p._id || p.id || p) !== productId)
      : [...currentWishlist, product];
      
    const t1 = performance.now();
    setUser(prev => ({ ...prev, wishlist: newWishlist }));
    const t2 = performance.now();
    console.log(`[Wishlist] State Updated -> ${(t2 - t1).toFixed(2)}ms`);

    try {
      const t3 = performance.now();
      console.log(`[Wishlist] API Request Started -> ${(t3 - t0).toFixed(2)}ms`);
      await apiClient.post('/users/wishlist', { productId });
      const t4 = performance.now();
      console.log(`[Wishlist] Response Returned -> ${(t4 - t3).toFixed(2)}ms`);
      
      fetchProfile(); // Sync silently in background
      return true;
    } catch (err) {
      console.error('Wishlist sync failed:', err);
      // Revert on error
      setUser(prev => ({ ...prev, wishlist: currentWishlist }));
      return false;
    } finally {
      setPendingWishlist(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };


  const clearWishlist = async (productIds) => {
    if (!user) return;
    const currentWishlist = user.wishlist || [];
    setUser(prev => ({ ...prev, wishlist: [] })); // Optimistic clear
    
    try {
      for (const id of productIds) {
        await apiClient.post('/users/wishlist', { productId: id });
      }
      fetchProfile();
    } catch (err) {
      console.error('Failed to clear wishlist', err);
      setUser(prev => ({ ...prev, wishlist: currentWishlist })); // Revert on error
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading, // This is authLoading
        isAuthenticated,
        error,
        register,
        verifyOtp,
        login,
        googleLogin,
        logout,
        setError,
        fetchProfile,
        toggleWishlist,
        clearWishlist,
        pendingWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
