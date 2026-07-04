/**
 * File: frontend/src/context/AdminAuthContext.jsx
 * Purpose: Provides global state management context using React Context API.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/config';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('adminToken'));
  const [error, setError] = useState(null);



  // Check if admin is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/admin/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAdmin(response.data.data);
        } catch (err) {
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

      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminRefreshToken', refreshToken);

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
    axios.post(`${API_URL}/admin/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    }).catch(() => {});
    
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    sessionStorage.clear();
    setAdmin(null);
    setLoading(false);
    navigate('/login', { replace: true });
  };

  const logoutAllDevices = async () => {
    try {
      await axios.post(`${API_URL}/admin/auth/logout-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      logout();
    } catch (err) {
      console.error('Logout all devices failed', err);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('adminRefreshToken');
      if (!refreshTokenValue) throw new Error('No refresh token');

      const response = await axios.post(`${API_URL}/admin/auth/refresh`, {
        refreshToken: refreshTokenValue,
      });

      const { accessToken } = response.data;
      localStorage.setItem('adminToken', accessToken);

      return accessToken;
    } catch (err) {
      logout();
      throw err;
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, loading, error, login, logout, refreshToken, verifyAdminKey, logoutAllDevices }}
    >
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
