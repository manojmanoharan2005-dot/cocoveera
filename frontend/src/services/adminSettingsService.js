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
    const response = await axios.get(`${API_URL}/admin/settings/shipping`, getAuthHeaders());
    return response.data;
  },

  createShippingRule: async (data) => {
    const response = await axios.post(`${API_URL}/admin/settings/shipping`, data, getAuthHeaders());
    return response.data;
  },

  updateShippingRule: async (id, data) => {
    const response = await axios.put(`${API_URL}/admin/settings/shipping/${id}`, data, getAuthHeaders());
    return response.data;
  },

  deleteShippingRule: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/settings/shipping/${id}`, getAuthHeaders());
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
