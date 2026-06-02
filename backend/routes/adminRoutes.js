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
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '../controllers/adminCategoryController.js';


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

// ==================== CATEGORY ROUTES ====================
router.get('/categories', protect, admin, getAdminCategories);
router.post('/categories', protect, admin, createAdminCategory);
router.put('/categories/:id', protect, admin, updateAdminCategory);
router.delete('/categories/:id', protect, admin, deleteAdminCategory);

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



// ==================== SETTINGS ROUTES ====================
// Note: Removed testing, discount, and settings routes/controllers per cleanup

export default router;
