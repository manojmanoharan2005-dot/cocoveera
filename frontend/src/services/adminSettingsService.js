/**
 * File: frontend/src/services/adminSettingsService.js
 * Purpose: Service functions to make API requests to the backend.
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const adminSettingsService = {
  // Shipping Rules
  getShippingRules: async () => {
    const response = await axios.get(`${API_URL}/shipping/rules`, getAuthHeaders());
    return response.data;
  },

  createShippingRule: async (data) => {
    const response = await axios.post(`${API_URL}/shipping/admin/shippingrates`, data, getAuthHeaders());
    return response.data;
  },

  updateShippingRule: async (id, data) => {
    const response = await axios.put(`${API_URL}/shipping/admin/shippingrates/${id}`, data, getAuthHeaders());
    return response.data;
  },

  deleteShippingRule: async (id) => {
    const response = await axios.delete(`${API_URL}/shipping/admin/shippingrates/${id}`, getAuthHeaders());
    return response.data;
  },

  listShippingResource: async (resource) => {
    const response = await axios.get(`${API_URL}/shipping/admin/${resource}`, getAuthHeaders());
    return response.data;
  },

  createShippingResource: async (resource, data) => {
    const response = await axios.post(`${API_URL}/shipping/admin/${resource}`, data, getAuthHeaders());
    return response.data;
  },

  updateShippingResource: async (resource, id, data) => {
    const response = await axios.put(`${API_URL}/shipping/admin/${resource}/${id}`, data, getAuthHeaders());
    return response.data;
  },

  deleteShippingResource: async (resource, id) => {
    const response = await axios.delete(`${API_URL}/shipping/admin/${resource}/${id}`, getAuthHeaders());
    return response.data;
  },

  calculateShippingQuote: async (data) => {
    const response = await axios.post(`${API_URL}/shipping/calculate`, data, getAuthHeaders());
    return response.data;
  },

  getShippingAnalytics: async () => {
    const response = await axios.get(`${API_URL}/shipping/analytics`, getAuthHeaders());
    return response.data;
  },

  // Currency Settings
  getCurrencySettings: async () => {
    const response = await axios.get(`${API_URL}/admin/settings/currency`, getAuthHeaders());
    return response.data;
  },

  updateCurrencySettings: async (data) => {
    const response = await axios.put(`${API_URL}/admin/settings/currency`, data, getAuthHeaders());
    return response.data;
  },

  syncCurrencyRates: async () => {
    const response = await axios.post(`${API_URL}/admin/settings/currency/sync`, {}, getAuthHeaders());
    return response.data;
  }
};
