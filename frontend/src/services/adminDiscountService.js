/**
 * File: frontend/src/services/adminDiscountService.js
 * Purpose: Service functions to make API requests to the backend.
 */
import axios from 'axios';

import { API_URL } from '../utils/config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const adminDiscountService = {
  getDiscounts: async () => {
    const response = await axios.get(`${API_URL}/admin/discounts`, getAuthHeaders());
    return response.data;
  },

  getDiscount: async (id) => {
    const response = await axios.get(`${API_URL}/admin/discounts/${id}`, getAuthHeaders());
    return response.data;
  },

  createDiscount: async (data) => {
    const response = await axios.post(`${API_URL}/admin/discounts`, data, getAuthHeaders());
    return response.data;
  },

  updateDiscount: async (id, data) => {
    const response = await axios.put(`${API_URL}/admin/discounts/${id}`, data, getAuthHeaders());
    return response.data;
  },

  deleteDiscount: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/discounts/${id}`, getAuthHeaders());
    return response.data;
  },

  getDiscountStats: async () => {
    const response = await axios.get(`${API_URL}/admin/discounts/stats`, getAuthHeaders());
    return response.data;
  }
};
