/**
 * File: frontend/src/services/authService.js
 * Purpose: Service functions to make API requests to the backend.
 */
import { apiClient } from '../context/AuthContext';

export const authService = {
  async register(name, email, password, country, currency, companyName) {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      country,
      currency,
      companyName,
    });
    return response.data;
  },

  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      sessionStorage.setItem('cocoveera_token', response.data.token);
      localStorage.removeItem('cocoveera_token');
    }
    return response.data;
  },

  async verifyOTP(email, otp) {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    if (response.data.success && response.data.token) {
      sessionStorage.setItem('cocoveera_token', response.data.token);
      localStorage.removeItem('cocoveera_token');
    }
    return response.data;
  },

  async resendOTP(email) {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(email, token, password) {
    const response = await apiClient.post('/auth/reset-password', {
      email,
      token,
      password,
    });
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  logout() {
    sessionStorage.removeItem('cocoveera_token');
    localStorage.removeItem('cocoveera_token');
  },

  getToken() {
    return sessionStorage.getItem('cocoveera_token');
  },
};

export default authService;
