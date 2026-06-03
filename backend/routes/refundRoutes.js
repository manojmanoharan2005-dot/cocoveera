import express from 'express';
import {
  requestRefund,
  approveRefund,
  getRefundAnalytics,
  getAllRefunds
} from '../controllers/refundController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, admin, getAllRefunds);
router.route('/analytics').get(protect, admin, getRefundAnalytics);
router.route('/request').post(protect, requestRefund);
router.route('/:id/approve').patch(protect, admin, approveRefund);

export default router;
