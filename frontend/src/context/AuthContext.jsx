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
  
  // Only show loading if a token exists and we need to verify it
  const [loading, setLoading] = useState(!!localStorage.getItem('cocoveera_token'));
  
  const [error, setError] = useState(null);

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
    setToken(null);
    setUser(null);
    setError(null);
    setLoading(false);
    navigate('/', { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        verifyOtp,
        login,
        googleLogin,
        logout,
        setError,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
