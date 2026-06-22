import express from 'express';
import {
  getPackages,
  createTestingOrder,
  confirmTestingPayment,
  getMyTestingOrders,
  adminGetPackages,
  adminCreatePackage,
  adminUpdatePackage,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminUploadReport
} from '../controllers/testingController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public / Customer Routes
router.get('/packages', getPackages);
router.post('/orders', protect, createTestingOrder);
router.post('/orders/confirm', protect, confirmTestingPayment);
router.get('/my-orders', protect, getMyTestingOrders);

// Admin Routes
router.get('/admin/packages', protect, admin, adminGetPackages);
router.post('/admin/packages', protect, admin, adminCreatePackage);
router.put('/admin/packages/:id', protect, admin, adminUpdatePackage);

router.get('/admin/orders', protect, admin, adminGetOrders);
router.put('/admin/orders/:id/status', protect, admin, adminUpdateOrderStatus);
router.post('/admin/orders/:id/report', protect, admin, adminUploadReport);

export default router;
