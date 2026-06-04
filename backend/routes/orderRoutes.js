/**
 * File: backend/routes/orderRoutes.js
 * Purpose: Defines the API endpoints and routing logic for order requests.
 */
import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateTrackingStatus,
  getOrderById,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';
import { getShippingRules } from '../controllers/shippingController.js';
import { validateOrder } from '../middleware/validators.js';
import { orderCreateLimiter } from '../middleware/limiters.js';

const router = express.Router();

router.route('/')
  .post(protect, orderCreateLimiter, validateOrder, createOrder)
  .get(protect, admin, getAllOrders);

router.route('/shipping-rules')
  .get(protect, getShippingRules);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id/tracking')
  .put(protect, admin, updateTrackingStatus);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

router.route('/:id')
  .get(protect, getOrderById);

export default router;
