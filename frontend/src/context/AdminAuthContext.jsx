import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminRefreshToken', refreshToken);

      setAdmin(user);
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    setAdmin(null);
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
      value={{ admin, loading, error, login, logout, refreshToken }}
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
