/**
 * File: frontend/src/services/authService.js
 * Purpose: Service functions to make API requests to the backend.
 */
import axios from 'axios';

import { API_URL } from '../utils/config';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT bearer token into requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cocoveera_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  async register(name, email, phone, password, country, currency) {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      phone,
      password,
      country,
      currency,
    });
    return response.data;
  },

  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('cocoveera_token', response.data.token);
    }
    return response.data;
  },

  async verifyOTP(phone, otp) {
    const response = await apiClient.post('/auth/verify-otp', { phone, otp });
    if (response.data.success && response.data.token) {
      localStorage.setItem('cocoveera_token', response.data.token);
    }
    return response.data;
  },

  async resendOTP(phone) {
    const response = await apiClient.post('/auth/resend-otp', { phone });
    return response.data;
  },

  async forgotPassword(phone) {
    const response = await apiClient.post('/auth/forgot-password', { phone });
    return response.data;
  },

  async resetPassword(phone, token, password) {
    const response = await apiClient.post('/auth/reset-password', {
      phone,
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
    localStorage.removeItem('cocoveera_token');
  },

  getToken() {
    return localStorage.getItem('cocoveera_token');
  },
};

export default authService;
