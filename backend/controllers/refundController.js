/**
 * File: backend/controllers/refundController.js
 * Purpose: Handles refund requests, approvals, processing, and analytics.
 */
import Refund from '../models/Refund.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { processGatewayRefund } from '../utils/refundService.js';
import { sendRefundNotification } from '../utils/NotificationService.js';

// @desc    Request a refund
// @route   POST /api/refunds/request
// @access  Private
export const requestRefund = async (req, res) => {
  try {
    const { orderId, amount, type, reason, bankDetails } = req.body;

    const order = await Order.findById(orderId).populate('user');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    // Ensure we don't refund more than totalAmount
    if (order.refundedAmount + amount > order.totalAmount) {
      return res.status(400).json({ success: false, message: 'Refund amount exceeds allowed limit' });
    }

    const payment = await Payment.findOne({ order: orderId, status: 'completed' });
    if (!payment) return res.status(400).json({ success: false, message: 'No completed payment found for this order' });

    const refund = await Refund.create({
      order: order._id,
      payment: payment._id,
      user: req.user._id,
      amount,
      type: type || 'full',
      reason,
      gatewayName: payment.method,
      transactionId: payment.transactionId,
      status: 'requested',
      bankDetails: payment.method === 'wire' || payment.method === 'bank_transfer' ? bankDetails : undefined
    });

    order.refunds.push(refund._id);
    await order.save();

    payment.refunds.push(refund._id);
    payment.status = 'refund_requested';
    await payment.save();

    // Send email notification to user
    await sendRefundNotification(req.user.email, req.user.phone, 'requested', amount, 'INR', order._id);

    res.status(201).json({ success: true, message: 'Refund requested successfully', data: refund });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve and auto-process refund
// @route   PATCH /api/refunds/:id/approve
// @access  Private/Admin
export const approveRefund = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id).populate('user order');
    if (!refund) return res.status(404).json({ success: false, message: 'Refund not found' });
    if (refund.status !== 'requested' && refund.status !== 'pending_validation') {
      return res.status(400).json({ success: false, message: 'Refund is not in a valid state for approval' });
    }

    refund.status = 'approved';
    refund.approvedBy = req.user._id;
    refund.approvedAt = new Date();
    await refund.save();

    // Notify user of approval
    await sendRefundNotification(refund.user.email, refund.user.phone, 'approved', refund.amount, 'INR', refund.order._id);

    // Auto trigger refund processing immediately
    refund.status = 'initiated';
    await refund.save();
    await sendRefundNotification(refund.user.email, refund.user.phone, 'initiated', refund.amount, 'INR', refund.order._id);

    const startTime = Date.now();
    const result = await processGatewayRefund(refund);
    const processingTime = Date.now() - startTime;

    if (result.success) {
      refund.status = 'completed';
      refund.refundId = result.refundId;
      refund.refundDate = new Date();
      refund.processingTime = processingTime;
      await refund.save();

      // Update Order refunded amount
      const order = await Order.findById(refund.order._id);
      order.refundedAmount += refund.amount;
      if (order.refundedAmount >= order.totalAmount) {
        order.paymentStatus = 'refunded';
      }
      await order.save();

      await sendRefundNotification(refund.user.email, refund.user.phone, 'processed', refund.amount, 'INR', refund.order._id);
      return res.status(200).json({ success: true, message: 'Refund processed successfully', data: refund });
    } else {
      refund.status = 'failed';
      refund.failureReason = result.error;
      refund.retryCount += 1;
      await refund.save();

      await sendRefundNotification(refund.user.email, refund.user.phone, 'failed', refund.amount, 'INR', refund.order._id);
      return res.status(400).json({ success: false, message: 'Refund processing failed', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Analytics for Admin Dashboard
// @route   GET /api/refunds/analytics
// @access  Private/Admin
export const getRefundAnalytics = async (req, res) => {
  try {
    const totalRefunds = await Refund.countDocuments();
    const completedRefunds = await Refund.countDocuments({ status: 'completed' });
    
    const stats = await Refund.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    const gatewayStats = await Refund.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$gatewayName', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    res.status(200).json({ 
      success: true, 
      data: {
        total: totalRefunds,
        completed: completedRefunds,
        successRate: totalRefunds ? ((completedRefunds / totalRefunds) * 100).toFixed(2) : 0,
        statusStats: stats,
        gatewayStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all refunds (Admin)
// @route   GET /api/refunds
// @access  Private/Admin
export const getAllRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find().populate('user', 'name email').populate('order', 'totalAmount').sort('-createdAt');
    res.status(200).json({ success: true, count: refunds.length, data: refunds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
