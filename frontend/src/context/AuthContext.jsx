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
      // Do not trigger global logout if the request was an explicit auth action
      const isAuthAction = error.config && error.config.url && (
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/register') ||
        error.config.url.includes('/auth/verify-otp') ||
        error.config.url.includes('/auth/google') ||
        error.config.url.includes('/admin/auth/login')
      );
      
      if (!isAuthAction) {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
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
    navigate('/login', { replace: true });
  };

  const toggleWishlist = async (product) => {
    
    if (!user) return false;
    
    // Determine the product ID safely (could be a string or object)
    const productId = typeof product === 'string' ? product : (product._id || product.id);
    if (!productId) {
      console.error('Invalid product for wishlist');
      return false;
    }
    
    if (pendingWishlist.has(productId)) return true; // Already processing
    
    setPendingWishlist(prev => new Set(prev).add(productId));

    // Determine API action based on current state (safe because pendingWishlist prevents concurrent same-item toggles)
    const currentWishlist = user.wishlist || [];
    const isWishlisted = currentWishlist.some(p => {
      const id = typeof p === 'string' ? p : (p._id || p.id);
      return id === productId;
    });

    setUser(prev => {
      if (!prev) return prev;
      
      const prevWishlist = prev.wishlist || [];
      const actuallyWishlisted = prevWishlist.some(p => {
        const id = typeof p === 'string' ? p : (p._id || p.id);
        return id === productId;
      });
      
      const updatedWishlist = actuallyWishlisted 
        ? prevWishlist.filter(p => {
            const id = typeof p === 'string' ? p : (p._id || p.id);
            return id !== productId;
          })
        : [...prevWishlist, product];
        
      return { ...prev, wishlist: updatedWishlist };
    });

    try {
      apiClient.post('/users/wishlist', { 
        productId,
        action: isWishlisted ? 'remove' : 'add'
      }).catch(err => {
         console.error('Wishlist sync failed:', err);
         // Revert using functional update to preserve other items
         setUser(prev => {
           if (!prev) return prev;
           const prevWishlist = prev.wishlist || [];
           const updatedWishlist = isWishlisted 
             ? [...prevWishlist, product] // It was wishlisted, so we put it back
             : prevWishlist.filter(p => { // It wasn't wishlisted, so we remove it
                 const id = typeof p === 'string' ? p : (p._id || p.id);
                 return id !== productId;
               });
           return { ...prev, wishlist: updatedWishlist };
         });
      });
      return true;
    } finally {
      setPendingWishlist(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };


  const clearWishlist = async () => {
    if (!user) return;
    const currentWishlist = user.wishlist || [];
    setUser(prev => ({ ...prev, wishlist: [] })); // Optimistic clear
    
    try {
      // Send a single explicit clear command instead of looping over IDs
      await apiClient.post('/users/wishlist', { action: 'clear' });
    } catch (err) {
      console.error('Failed to clear wishlist', err);
      setUser(prev => ({ ...prev, wishlist: currentWishlist })); // Revert on error
    }
  };

  const contextValue = React.useMemo(() => ({
    user,
    token,
    loading,
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
  }), [user, token, loading, isAuthenticated, error, pendingWishlist]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
