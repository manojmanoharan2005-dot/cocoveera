/**
 * File: frontend/src/context/AuthContext.jsx
 * Purpose: Provides global state management context using React Context API.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cocoveera_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (token) {
      try {
        const res = await apiClient.get('/users/profile');
        if (res.data.success) {
          setUser(res.data.data);
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

  const register = async (name, email, phone, password, country, currency, companyName) => {
    setError(null);
    try {
      const res = await apiClient.post('/auth/register', { name, email, phone, password, country, currency, companyName });
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
        localStorage.setItem('cocoveera_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
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
    setToken(null);
    setUser(null);
    setError(null);
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
