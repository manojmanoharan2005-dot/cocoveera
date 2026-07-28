/**
 * File: backend/routes/paymentRoutes.js
 * Purpose: Defines the API endpoints and routing logic for payment requests.
 */
import express from 'express';
import {
  initiatePayment,
  confirmPayment,
  verifyRazorpayPayment,
  getMyPayments,
  getAllPayments,
  requestRefund,
  approveRefund,
  rejectRefund,
  getPaymentSyncStatus,
} from '../controllers/paymentController.js';
import { validateRefundRequest, validateIdParam } from '../middleware/validators.js';
import { paymentInitiateLimiter } from '../middleware/limiters.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/initiate', protect, paymentInitiateLimiter, initiatePayment);
router.post('/confirm', protect, confirmPayment);
router.post('/verify-payment', protect, verifyRazorpayPayment);
router.get('/sync-status/:orderId', protect, getPaymentSyncStatus);
router.get('/history', protect, getMyPayments);
router.get('/admin', protect, (req, res, next) => { if (req.user && ['admin','manager','support'].includes(req.user.role)) return next(); return res.status(403).json({ success:false, message:'Not authorized' }); }, getAllPayments);
router.post('/refund', protect, validateRefundRequest, requestRefund);
router.patch('/refund/:id/approve', protect, (req, res, next) => { if (req.user && ['admin','manager','support'].includes(req.user.role)) return next(); return res.status(403).json({ success:false, message:'Not authorized' }); }, validateIdParam, approveRefund);
router.patch('/refund/:id/reject', protect, (req, res, next) => { if (req.user && ['admin','manager','support'].includes(req.user.role)) return next(); return res.status(403).json({ success:false, message:'Not authorized' }); }, validateIdParam, rejectRefund);

export default router;
