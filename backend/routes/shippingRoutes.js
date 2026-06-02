import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getShippingRules,
  calculateShippingQuote,
  getShippingAnalytics,
  listResource,
  createResource,
  updateResource,
  deleteResource,
} from '../controllers/shippingController.js';

const router = express.Router();

router.get('/rules', protect, getShippingRules);
router.post('/calculate', protect, calculateShippingQuote);

router.get('/analytics', protect, admin, getShippingAnalytics);

router.get('/admin/:resource', protect, admin, listResource);
router.post('/admin/:resource', protect, admin, createResource);
router.put('/admin/:resource/:id', protect, admin, updateResource);
router.delete('/admin/:resource/:id', protect, admin, deleteResource);

export default router;
