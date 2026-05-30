import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateTrackingStatus,
  getOrderById,
} from '../controllers/orderController.js';
import { getShippingRules } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getAllOrders);

router.route('/shipping-rules')
  .get(protect, getShippingRules);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id/tracking')
  .put(protect, admin, updateTrackingStatus);

router.route('/:id')
  .get(protect, getOrderById);

export default router;
