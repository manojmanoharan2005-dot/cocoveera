/**
 * File: backend/controllers/testingController.js
 * Purpose: Handles the business logic for testing packages and testing orders.
 */
import TestingPackage from '../models/TestingPackage.js';
import TestingOrder from '../models/TestingOrder.js';
import Payment from '../models/Payment.js';
import Razorpay from 'razorpay';
import { sendNotificationEmail } from '../utils/EmailService.js';

const isRazorpayMock = !process.env.RAZORPAY_KEY || process.env.RAZORPAY_KEY.startsWith('mock_');
let razorpayInstance = null;
if (!isRazorpayMock) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
}

// --- Customer Endpoints ---

export const getPackages = async (req, res) => {
  try {
    const packages = await TestingPackage.find({ active: true }).sort({ price: 1 });
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTestingOrder = async (req, res) => {
  try {
    const { productId, packageId, gateway } = req.body;
    
    const testingPackage = await TestingPackage.findById(packageId);
    if (!testingPackage) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    // Create the TestingOrder record in DB
    const testingOrder = await TestingOrder.create({
      userId: req.user._id,
      productId,
      packageId,
      amountPaid: testingPackage.price,
      paymentStatus: 'Payment Pending',
      testingStatus: 'Payment Pending',
    });

    if (gateway === 'razorpay') {
      if (isRazorpayMock) {
        return res.status(200).json({
          success: true,
          gateway: 'razorpay',
          id: 'mock_rzp_order_' + Date.now(),
          amount: Math.round(testingPackage.price * 100),
          currency: 'INR',
          testingOrderId: testingOrder._id
        });
      }

      const inrAmount = Math.round(testingPackage.price * 100);
      const rzpOrder = await razorpayInstance.orders.create({
        amount: inrAmount,
        currency: 'INR',
        receipt: testingOrder._id.toString(),
      });

      return res.status(200).json({
        success: true,
        gateway: 'razorpay',
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        testingOrderId: testingOrder._id
      });
    }

    if (gateway === 'mock') {
      return res.status(200).json({
        success: true,
        gateway: 'mock',
        testingOrderId: testingOrder._id,
        amount: testingPackage.price,
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid payment gateway' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmTestingPayment = async (req, res) => {
  try {
    const { testingOrderId, paymentId, gateway, status } = req.body;

    const testingOrder = await TestingOrder.findById(testingOrderId).populate('userId', 'name email').populate('productId', 'name').populate('packageId', 'name');
    if (!testingOrder) {
      return res.status(404).json({ success: false, message: 'Testing Order not found' });
    }

    if (status === 'success' || status === 'paid') {
      testingOrder.paymentStatus = 'Completed';
      testingOrder.testingStatus = 'Testing Requested';
      await testingOrder.save();

      try {
        await Payment.create({
          amount: testingOrder.amountPaid,
          status: 'completed',
          method: gateway || 'mock',
          transactionId: paymentId || 'pm_' + Math.random().toString(36).substring(7),
          paymentDate: new Date(),
          description: `Testing Fee for Product ${testingOrder.productId._id}`,
          user: testingOrder.userId._id
        });
      } catch (payErr) {
        console.error('Failed to create Payment record:', payErr);
      }

      // Send Email Notification
      try {
        await sendNotificationEmail(
          testingOrder.userId.email,
          'Testing Request Confirmed',
          `Your testing request for ${testingOrder.productId.name} (${testingOrder.packageId.name}) has been confirmed. Our team will start processing it.`
        );
      } catch (err) {
        console.error('Email failed:', err);
      }

      return res.status(200).json({ success: true, message: 'Payment confirmed', data: testingOrder });
    } else {
      testingOrder.paymentStatus = 'Failed';
      await testingOrder.save();
      return res.status(400).json({ success: false, message: 'Payment marked as failed', data: testingOrder });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyTestingOrders = async (req, res) => {
  try {
    const orders = await TestingOrder.find({ userId: req.user._id })
      .populate('productId', 'name category images')
      .populate('packageId', 'name price')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Admin Endpoints ---

export const adminGetPackages = async (req, res) => {
  try {
    const packages = await TestingPackage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminCreatePackage = async (req, res) => {
  try {
    const newPackage = await TestingPackage.create(req.body);
    res.status(201).json({ success: true, data: newPackage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUpdatePackage = async (req, res) => {
  try {
    const updated = await TestingPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminGetOrders = async (req, res) => {
  try {
    const orders = await TestingOrder.find()
      .populate('userId', 'name email')
      .populate('productId', 'name')
      .populate('packageId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { testingStatus } = req.body;
    const order = await TestingOrder.findByIdAndUpdate(req.params.id, { testingStatus }, { new: true })
      .populate('userId', 'name email')
      .populate('productId', 'name');
    
    if (testingStatus === 'Completed' || testingStatus === 'In Progress') {
      try {
        await sendNotificationEmail(
          order.userId.email,
          `Testing Status Updated: ${testingStatus}`,
          `The testing request for ${order.productId.name} is now ${testingStatus}.`
        );
      } catch (err) {}
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUploadReport = async (req, res) => {
  try {
    const { reportUrl } = req.body;
    const order = await TestingOrder.findById(req.params.id).populate('userId', 'email').populate('productId', 'name');
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.reportUrl = reportUrl;
    order.testingStatus = 'Report Available';
    await order.save();

    try {
      await sendNotificationEmail(
        order.userId.email,
        'Testing Report Available',
        `Your testing report for ${order.productId.name} is now available for download in your dashboard.`
      );
    } catch (err) {}

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
