import express from 'express';
import multer from 'multer';
import { protect, admin, adminRoleCheck } from '../middleware/auth.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Setup multer buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Import admin controllers
import {
  adminLogin,
  refreshAdminToken,
  getAdminMe,
  adminForgotPassword,
  adminResetPassword,
  adminChangePassword,
  adminLogout,
} from '../controllers/adminAuthController.js';

import {
  getAdminProducts,
  getAdminProduct,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  togglePublishProduct,
} from '../controllers/adminProductController.js';

import {
  getAdminOrders,
  getAdminOrder,
  updateOrderStatus,
  updatePaymentStatus,
  assignContainer,
  generateInvoice,
  exportOrders,
  getOrderStats,
} from '../controllers/adminOrderController.js';

import {
  getAdminUsers,
  getAdminUser,
  blockUser,
  unblockUser,
  deleteAdminUser,
  updateAdminUser,
  getUserStats,
  exportUsers,
} from '../controllers/adminUserController.js';

import {
  getAdminContainers,
  getAdminContainer,
  createAdminContainer,
  updateContainerStatus,
  assignOrderToContainer,
  getContainerStats,
  updateContainerLogistics,
} from '../controllers/adminContainerController.js';

import {
  getAdminTestingReports,
  getAdminTestingReport,
  createAdminTestingReport,
  updateAdminTestingReport,
  approveTestingReport,
  rejectTestingReport,
  deleteAdminTestingReport,
  getTestingStats,
} from '../controllers/adminTestingController.js';

import {
  getDiscounts,
  getDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getDiscountStats
} from '../controllers/discountController.js';

const router = express.Router();

// ==================== ADMIN AUTH ROUTES ====================
router.post('/auth/login', adminLogin);
router.post('/auth/refresh', refreshAdminToken);
router.post('/auth/forgot-password', adminForgotPassword);
router.post('/auth/reset-password/:token', adminResetPassword);
router.post('/auth/logout', protect, adminLogout);

// Protected routes
router.get('/auth/me', protect, admin, getAdminMe);
router.post('/auth/change-password', protect, admin, adminChangePassword);

// ==================== DASHBOARD & STATS ====================
router.get('/dashboard/orders-stats', protect, admin, getOrderStats);
router.get('/dashboard/users-stats', protect, admin, getUserStats);
router.get('/dashboard/containers-stats', protect, admin, getContainerStats);
router.get('/dashboard/testing-stats', protect, admin, getTestingStats);

// ==================== UPLOAD ROUTE ====================
router.post('/upload', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    const result = await uploadToCloudinary(req.file.buffer, 'cocoveera_products');
    res.status(200).json({ success: true, url: result.secure_url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PRODUCT ROUTES ====================
router.get('/products', protect, admin, getAdminProducts);
router.get('/products/:id', protect, admin, getAdminProduct);
router.post('/products', protect, admin, createAdminProduct);
router.put('/products/:id', protect, admin, updateAdminProduct);
router.delete('/products/:id', protect, admin, deleteAdminProduct);
router.patch('/products/:id/publish', protect, admin, togglePublishProduct);

// ==================== ORDER ROUTES ====================
router.get('/orders', protect, admin, getAdminOrders);
router.get('/orders/:id', protect, admin, getAdminOrder);
router.patch('/orders/:id/status', protect, admin, updateOrderStatus);
router.patch('/orders/:id/payment', protect, admin, updatePaymentStatus);
router.patch('/orders/:id/container', protect, admin, assignContainer);
router.post('/orders/:id/invoice', protect, admin, generateInvoice);
router.post('/orders/export', protect, admin, exportOrders);

// ==================== USER ROUTES ====================
router.get('/users', protect, admin, getAdminUsers);
router.get('/users/:id', protect, admin, getAdminUser);
router.patch('/users/:id/block', protect, admin, blockUser);
router.patch('/users/:id/unblock', protect, admin, unblockUser);
router.patch('/users/:id', protect, admin, updateAdminUser);
router.delete('/users/:id', protect, admin, deleteAdminUser);
router.post('/users/export', protect, admin, exportUsers);

// ==================== CONTAINER ROUTES ====================
router.get('/containers', protect, admin, getAdminContainers);
router.get('/containers/:id', protect, admin, getAdminContainer);
router.post('/containers', protect, admin, createAdminContainer);
router.patch('/containers/:id/status', protect, admin, updateContainerStatus);
router.patch('/containers/:id/assign-order', protect, admin, assignOrderToContainer);
router.patch('/containers/:id/logistics', protect, admin, updateContainerLogistics);

// ==================== QUALITY TESTING ROUTES ====================
router.get('/testing', protect, admin, getAdminTestingReports);
router.get('/testing/:id', protect, admin, getAdminTestingReport);
router.post('/testing', protect, admin, createAdminTestingReport);
router.put('/testing/:id', protect, admin, updateAdminTestingReport);
router.patch('/testing/:id/approve', protect, admin, approveTestingReport);
router.patch('/testing/:id/reject', protect, admin, rejectTestingReport);
router.delete('/testing/:id', protect, admin, deleteAdminTestingReport);

// ==================== DISCOUNT ROUTES ====================
router.get('/discounts/stats', protect, admin, getDiscountStats);
router.get('/discounts', protect, admin, getDiscounts);
router.get('/discounts/:id', protect, admin, getDiscount);
router.post('/discounts', protect, admin, createDiscount);
router.put('/discounts/:id', protect, admin, updateDiscount);
router.delete('/discounts/:id', protect, admin, deleteDiscount);

// ==================== SETTINGS ROUTES ====================
import {
  getShippingRules,
  createShippingRule,
  updateShippingRule,
  deleteShippingRule,
  getCurrencySettings,
  updateCurrencySettings,
  syncCurrencyRates
} from '../controllers/settingsController.js';

router.get('/settings/shipping', protect, admin, getShippingRules);
router.post('/settings/shipping', protect, admin, createShippingRule);
router.put('/settings/shipping/:id', protect, admin, updateShippingRule);
router.delete('/settings/shipping/:id', protect, admin, deleteShippingRule);

router.get('/settings/currency', protect, admin, getCurrencySettings);
router.put('/settings/currency', protect, admin, updateCurrencySettings);
router.post('/settings/currency/sync', protect, admin, syncCurrencyRates);

export default router;
