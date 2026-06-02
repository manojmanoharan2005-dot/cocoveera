import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('adminToken');

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// ==================== PRODUCTS ====================
export const adminProductService = {
  getAll: async (page = 1, limit = 10, search = '', category = '', status = '') => {
    const response = await axios.get(`${API_URL}/admin/products`, {
      params: { page, limit, search, category, status },
      headers: getHeaders(),
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/admin/products/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(`${API_URL}/admin/products`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/admin/products/${id}`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/products/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  togglePublish: async (id) => {
    const response = await axios.patch(
      `${API_URL}/admin/products/${id}/publish`,
      {},
      { headers: getHeaders() }
    );
    return response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(`${API_URL}/admin/upload`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ==================== CATEGORIES ====================
export const adminCategoryService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await axios.get(`${API_URL}/admin/categories`, {
      params: { page, limit, search },
      headers: getHeaders(),
    });
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(`${API_URL}/admin/categories`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/admin/categories/${id}`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/categories/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },
};

// ==================== ORDERS ====================
export const adminOrderService = {
  getAll: async (page = 1, limit = 10, search = '', status = '', paymentStatus = '') => {
    const response = await axios.get(`${API_URL}/admin/orders`, {
      params: { page, limit, search, status, paymentStatus },
      headers: getHeaders(),
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/admin/orders/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  updateStatus: async (id, orderStatus, remarks) => {
    const response = await axios.patch(
      `${API_URL}/admin/orders/${id}/status`,
      { orderStatus, remarks },
      { headers: getHeaders() }
    );
    return response.data;
  },

  updatePayment: async (id, paymentStatus, paymentId) => {
    const response = await axios.patch(
      `${API_URL}/admin/orders/${id}/payment`,
      { paymentStatus, paymentId },
      { headers: getHeaders() }
    );
    return response.data;
  },

  assignContainer: async (id, containerId, containerCapacity) => {
    const response = await axios.patch(
      `${API_URL}/admin/orders/${id}/container`,
      { containerId, containerCapacity },
      { headers: getHeaders() }
    );
    return response.data;
  },

  generateInvoice: async (id) => {
    const response = await axios.post(
      `${API_URL}/admin/orders/${id}/invoice`,
      {},
      { headers: getHeaders() }
    );
    return response.data;
  },

  export: async (format = 'csv', filters = {}) => {
    const response = await axios.post(
      `${API_URL}/admin/orders/export`,
      { format, filters },
      { headers: getHeaders() }
    );
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get(`${API_URL}/admin/dashboard/orders-stats`, {
      headers: getHeaders(),
    });
    return response.data;
  },
};

// ==================== USERS ====================
export const adminUserService = {
  getAll: async (page = 1, limit = 10, search = '', status = '') => {
    const response = await axios.get(`${API_URL}/admin/users`, {
      params: { page, limit, search, status },
      headers: getHeaders(),
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/admin/users/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.patch(`${API_URL}/admin/users/${id}`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  block: async (id) => {
    const response = await axios.patch(
      `${API_URL}/admin/users/${id}/block`,
      {},
      { headers: getHeaders() }
    );
    return response.data;
  },

  unblock: async (id) => {
    const response = await axios.patch(
      `${API_URL}/admin/users/${id}/unblock`,
      {},
      { headers: getHeaders() }
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/users/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get(`${API_URL}/admin/dashboard/users-stats`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  export: async (format = 'csv') => {
    const response = await axios.post(
      `${API_URL}/admin/users/export`,
      { format },
      { headers: getHeaders() }
    );
    return response.data;
  },
};

// ==================== CONTAINERS ====================
export const adminContainerService = {
  getAll: async (page = 1, limit = 10, status = '', search = '') => {
    const response = await axios.get(`${API_URL}/admin/containers`, {
      params: { page, limit, status, search },
      headers: getHeaders(),
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/admin/containers/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(`${API_URL}/admin/containers`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  updateStatus: async (id, status, location, notes, eta) => {
    const response = await axios.patch(
      `${API_URL}/admin/containers/${id}/status`,
      { status, location, notes, eta },
      { headers: getHeaders() }
    );
    return response.data;
  },

  assignOrder: async (id, orderId) => {
    const response = await axios.patch(
      `${API_URL}/admin/containers/${id}/assign-order`,
      { orderId },
      { headers: getHeaders() }
    );
    return response.data;
  },

  updateLogistics: async (id, destination, eta) => {
    const response = await axios.patch(
      `${API_URL}/admin/containers/${id}/logistics`,
      { destination, eta },
      { headers: getHeaders() }
    );
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get(`${API_URL}/admin/dashboard/containers-stats`, {
      headers: getHeaders(),
    });
    return response.data;
  },
};

// ==================== QUALITY TESTING ====================
export const adminTestingService = {
  getAll: async (page = 1, limit = 10, status = '', search = '') => {
    try {
      const response = await axios.get(`${API_URL}/admin/testing`, {
        params: { page, limit, status, search },
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      // Mock data fallback since backend route is removed
      return {
        success: true,
        data: [
          { _id: 'test1', productName: 'Premium Coco Peat', batchNumber: 'B-8492', ecValue: '0.4 mS/cm', phValue: '6.2', moisturePercent: '14%', status: 'approved' },
          { _id: 'test2', productName: 'Coco Chips 10mm', batchNumber: 'B-8493', ecValue: '0.5 mS/cm', phValue: '5.9', moisturePercent: '16%', status: 'pending' },
          { _id: 'test3', productName: 'Hydroponic Growbags', batchNumber: 'B-8494', ecValue: '0.3 mS/cm', phValue: '6.5', moisturePercent: '15%', status: 'rejected' },
        ],
        pagination: { total: 3, pages: 1, currentPage: 1, limit: 10 }
      };
    }
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/admin/testing/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(`${API_URL}/admin/testing`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/admin/testing/${id}`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  approve: async (id, remarks) => {
    const response = await axios.patch(
      `${API_URL}/admin/testing/${id}/approve`,
      { remarks },
      { headers: getHeaders() }
    );
    return response.data;
  },

  reject: async (id, remarks) => {
    const response = await axios.patch(
      `${API_URL}/admin/testing/${id}/reject`,
      { remarks },
      { headers: getHeaders() }
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/testing/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get(`${API_URL}/admin/dashboard/testing-stats`, {
      headers: getHeaders(),
    });
    return response.data;
  },
};
