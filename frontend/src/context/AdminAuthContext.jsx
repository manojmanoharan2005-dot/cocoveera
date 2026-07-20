/**
 * File: frontend/src/context/AdminAuthContext.jsx
 * Purpose: Provides global state management context using React Context API.
 */
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/config';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(!!sessionStorage.getItem('adminToken'));
  const [error, setError] = useState(null);
  
  // Utility to decode JWT without external library
  const parseJwt = (t) => {
    try {
      return JSON.parse(atob(t.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const adminToken = sessionStorage.getItem('adminToken');

  // JWT Auto-Logout based on expiry
  useEffect(() => {
    if (!adminToken) return;
    
    const decodedToken = parseJwt(adminToken);
    if (!decodedToken || !decodedToken.exp) return;

    const expirationTimeMs = decodedToken.exp * 1000;
    let timeoutId;

    const checkExpiration = () => {
      const timeRemaining = expirationTimeMs - Date.now();
      if (timeRemaining <= 0) {
        console.warn('Admin session automatically expired.');
        logout();
      } else {
        // Cap the delay to 24 hours (86400000 ms) to prevent 32-bit signed integer overflow in setTimeout
        const delay = Math.min(timeRemaining, 86400000);
        timeoutId = setTimeout(checkExpiration, delay);
      }
    };

    checkExpiration();

    return () => clearTimeout(timeoutId);
  }, [adminToken]);

  // Check if admin is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('adminToken');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/admin/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAdmin(response.data.data);
        } catch (err) {
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminRefreshToken');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminRefreshToken');
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/admin/auth/login`, {
        email,
        password,
      });

      // Step 1 returns tempToken and requiresVerification flag
      return { 
        success: true, 
        requiresVerification: response.data.requiresVerification,
        tempToken: response.data.tempToken
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    }
  };

  const verifyAdminKey = async (tempToken, verificationKey) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/admin/auth/verify-key`, {
        tempToken,
        verificationKey,
      });

      const { accessToken, refreshToken, user } = response.data;

      sessionStorage.setItem('adminToken', accessToken);
      sessionStorage.setItem('adminRefreshToken', refreshToken);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');

      setAdmin(user);
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    // Optionally call backend logout
    const currentToken = sessionStorage.getItem('adminToken');
    if (currentToken) {
      axios.post(`${API_URL}/admin/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${currentToken}` }
      }).catch(() => {});
    }
    
    sessionStorage.clear();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('cocoveera_token');
    localStorage.removeItem('cocoveera_user');
    
    // Clear cookies if present
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setAdmin(null);
    setLoading(false);
    navigate('/login', { replace: true });
  };

  const logoutAllDevices = async () => {
    try {
      const currentToken = sessionStorage.getItem('adminToken');
      if (currentToken) {
        await axios.post(`${API_URL}/admin/auth/logout-all`, {}, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
      }
      logout();
    } catch (err) {
      console.error('Logout all devices failed', err);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = sessionStorage.getItem('adminRefreshToken');
      if (!refreshTokenValue) throw new Error('No refresh token');

      const response = await axios.post(`${API_URL}/admin/auth/refresh`, {
        refreshToken: refreshTokenValue,
      });

      const { accessToken } = response.data;
      sessionStorage.setItem('adminToken', accessToken);

      return accessToken;
    } catch (err) {
      logout();
      throw err;
    }
  };

  const contextValue = React.useMemo(() => ({
    admin, loading, error, login, logout, refreshToken, verifyAdminKey, logoutAllDevices
  }), [admin, loading, error]);

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
