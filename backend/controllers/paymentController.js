/**
 * File: backend/controllers/paymentController.js
 * Purpose: Handles the business logic and request processing for payment operations.
 */
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Quote from '../models/Quote.js';
import User from '../models/User.js';
import { generateInvoicePDF } from '../utils/InvoiceGenerator.js';
import { sendOrderConfirmationNotification } from '../utils/NotificationService.js';

// @desc    Initiate payment session for an order
// @route   POST /api/payments/initiate
// @access  Private
export const initiatePayment = async (req, res) => {
  // Force reload environment variables to pick up latest keys without a restart
  dotenv.config({ override: true });

  const { orderId, gateway } = req.body;

  try {
    const order = await Order.findById(orderId).populate('items.product', 'name');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order has already been paid' });
    }

    const amountInCentsStripe = Math.round(order.totalAmount * 0.012 * 100);

    // 1. STRIPE GATEWAY
    if (gateway === 'stripe') {
      const isStripeMock = !process.env.STRIPE_SECRET || process.env.STRIPE_SECRET.startsWith('mock_');
      if (isStripeMock) {
        console.log(`[Stripe Mock] Simulating payment intent for order: ${orderId}`);
        return res.status(200).json({
          success: true,
          gateway: 'stripe',
          clientSecret: 'mock_stripe_client_secret_' + Date.now(),
          amount: order.totalAmount,
        });
      }

      const activeStripeInstance = new Stripe(process.env.STRIPE_SECRET);
      const paymentIntent = await activeStripeInstance.paymentIntents.create({
        amount: amountInCentsStripe,
        currency: 'usd',
        metadata: { orderId: orderId.toString() },
      });

      return res.status(200).json({
        success: true,
        gateway: 'stripe',
        clientSecret: paymentIntent.client_secret,
        amount: order.totalAmount,
      });
    }

    // 2. RAZORPAY GATEWAY
    if (gateway === 'razorpay') {
      const currentRzpKey = process.env.RAZORPAY_KEY;
      const currentRzpSecret = process.env.RAZORPAY_SECRET;
      const isRzpMock = !currentRzpKey || currentRzpKey.startsWith('mock_');

      if (isRzpMock) {
        console.log(`[Razorpay Mock] Simulating order creation for order: ${orderId}`);
        return res.status(200).json({
          success: true,
          gateway: 'razorpay',
          id: 'mock_rzp_order_' + Date.now(),
          amount: Math.round(order.totalAmount * 100),
          currency: 'INR',
        });
      }

      // Initialize dynamically to use the latest key
      const activeRazorpayInstance = new Razorpay({
        key_id: currentRzpKey,
        key_secret: currentRzpSecret,
      });

      // order.totalAmount is already in INR. Ensure minimum 1 INR (100 paise) for Razorpay.
      let inrAmount = Math.max(100, Math.round(order.totalAmount * 100));
      const isLive = currentRzpKey.startsWith('rzp_live_');
      if (!isLive && inrAmount > 50000000) {
        console.warn(`[Razorpay] Test mode: Capping order amount from ${inrAmount} to 50000000 paise to prevent limit errors.`);
        inrAmount = 50000000;
      }
      
      const rzpOrder = await activeRazorpayInstance.orders.create({
        amount: inrAmount,
        currency: 'INR',
        receipt: orderId.toString(),
      });

      return res.status(200).json({
        success: true,
        gateway: 'razorpay',
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: currentRzpKey, // Send the exact key used to create the order
      });
    }

    // 3. PAYPAL GATEWAY
    if (gateway === 'paypal') {
      if (isPaypalMock) {
        console.log(`[PayPal Mock] Simulating authorization for order: ${orderId}`);
        return res.status(200).json({
          success: true,
          gateway: 'paypal',
          approvalUrl: '#mock-paypal-approval',
          orderId: 'mock_paypal_order_' + Date.now(),
        });
      }

      // Live Paypal Client configuration
      const environment = new paypal.core.LiveEnvironment(
        process.env.VITE_PAYPAL_CLIENT_ID,
        process.env.PAYPAL_SECRET
      );
      const client = new paypal.core.PayPalHttpClient(environment);

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderId.toString(),
            amount: {
              currency_code: "USD",
              value: (order.totalAmount * 0.012).toFixed(2),
            },
          },
        ],
      });

      const paypalOrder = await client.execute(request);
      const approvalUrl = paypalOrder.result.links.find(
        (link) => link.rel === "approve"
      ).href;

      return res.status(200).json({
        success: true,
        gateway: 'paypal',
        approvalUrl,
        orderId: paypalOrder.result.id,
      });
    }

    // 4. MOCK DIRECT GATEWAY (always available for easy debugging)
    if (gateway === 'mock') {
      return res.status(200).json({
        success: true,
        gateway: 'mock',
        orderId: order._id,
        amount: order.totalAmount,
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid payment gateway' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm/finalize payment for order
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = async (req, res) => {
  const { orderId, paymentId, gateway, status } = req.body;

  try {
    const order = await Order.findById(orderId).populate('user', 'name email phone').populate('items.product', 'name');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status === 'success' || status === 'paid') {
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      order.paymentId = paymentId || 'pm_' + Math.random().toString(36).substring(7);
      order.paymentGateway = gateway || 'mock';
      await order.save();

      // Create a Payment record
      try {
        await Payment.create({
          order: order._id,
          amount: order.totalAmount,
          status: 'completed',
          method: gateway || 'mock',
          transactionId: paymentId || order.paymentId,
          paymentDate: new Date(),
          description: `Payment for order ${order._id}`,
          user: order.user._id
        });
      } catch (payErr) {
        console.error('Failed to create Payment record:', payErr);
      }

      // If this order is linked to a quote, convert quote status to "converted"
      if (order.quote) {
        await Quote.findByIdAndUpdate(order.quote, { status: 'converted' });
      }

      try {
        const address = order.shippingAddress || {};
        const { generateInvoicePDF, buildInvoiceDataFromOrder } = await import('../utils/InvoiceGenerator.js');
        const invoiceData = buildInvoiceDataFromOrder(order);

        const pdfBuffer = await generateInvoicePDF(invoiceData);

        // Send Email
        const orderSummary = {
          customerName: order.user.name,
          orderDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          deliveryInfo: 'Will be shipped in 3-5 business days',
          shippingAddress: order.shippingAddress,
          shippingDate: order.shippingDate,
          estimatedDeliveryDate: order.estimatedDeliveryDate,
          items: order.items.map(item => ({
            productName: item.productName || (item.product && item.product.name) || 'Product',
            unitPrice: item.unitPrice,
            quantity: item.quantity
          }))
        };
        await sendOrderConfirmationNotification(order.user.email, order.user.phone, order._id.toString(), orderSummary, pdfBuffer);

      } catch (err) {
        console.error('Invoice generation or email failed:', err);
      }

      return res.status(200).json({ success: true, message: 'Payment confirmed successfully', data: order });
    } else {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      await order.save();
      return res.status(400).json({ success: false, message: 'Payment status marked as failed', data: order });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's payment history
// @route   GET /api/payments/history
// @access  Private
export const getMyPayments = async (req, res) => {
  try {
    const Payment = (await import('../models/Payment.js')).default;
    let payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Fallback: if no Payment documents, derive from paid Orders
    if (!payments || payments.length === 0) {
      const Order = (await import('../models/Order.js')).default;
      const orders = await Order.find({ user: req.user._id, paymentStatus: 'paid' }).sort({ updatedAt: -1 });
      payments = orders.map(o => ({ _id: o._id, order: o._id, amount: o.totalAmount, status: 'completed', method: o.paymentGateway || 'mock', transactionId: o.paymentId || '', paymentDate: o.updatedAt, user: req.user._id }));
    }

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments/admin
// @access  Private/Admin
export const getAllPayments = async (req, res) => {
  try {
    const Payment = (await import('../models/Payment.js')).default;
    let payments = await Payment.find().populate('order', 'orderId totalAmount').populate('user', 'name email').sort({ createdAt: -1 });

    if (!payments || payments.length === 0) {
      const Order = (await import('../models/Order.js')).default;
      const orders = await Order.find({ paymentStatus: 'paid' }).populate('user', 'name email').sort({ updatedAt: -1 });
      payments = orders.map(o => ({ _id: o._id, order: o._id, amount: o.totalAmount, status: 'completed', method: o.paymentGateway || 'mock', transactionId: o.paymentId || '', paymentDate: o.updatedAt, user: o.user }));
    }

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request a refund for a payment/order
// @route   POST /api/payments/refund
// @access  Private
export const requestRefund = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    const Payment = (await import('../models/Payment.js')).default;
    let payment = await Payment.findById(paymentId).populate('user');

    // If Payment doc not found, try interpreting paymentId as an Order id and derive/create Payment
    if (!payment) {
      const Order = (await import('../models/Order.js')).default;
      const order = await Order.findById(paymentId).populate('user');
      if (!order) return res.status(404).json({ success: false, message: 'Payment not found' });
      if (order.user._id.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

      // Create a Payment document representing this order's paid transaction if not present
      try {
        payment = await Payment.create({
          order: order._id,
          amount: order.totalAmount,
          status: 'completed',
          method: order.paymentGateway || 'mock',
          transactionId: order.paymentId || '',
          paymentDate: order.updatedAt || new Date(),
          user: order.user._id,
        });
      } catch (createErr) {
        // Handle duplicate transactionId: find existing payment
        if (createErr && createErr.code === 11000 && order.paymentId) {
          payment = await Payment.findOne({ transactionId: order.paymentId });
        } else {
          throw createErr;
        }
      }
    }

    if (payment.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    payment.status = 'refund_requested';
    payment.refundReason = reason || 'No reason provided';
    payment.refundRequestedAt = new Date();
    await payment.save();

    // Notify admin via email
    const { sendAdminNotificationEmail } = await import('../utils/mailer.js');
    await sendAdminNotificationEmail(process.env.SUPPORT_EMAIL || 'servicedesk@cocoveera.com', 'Cocoveera Admin', { type: 'refund_request', message: `Refund requested for payment ${payment._id}` });

    res.status(200).json({ success: true, message: 'Refund requested successfully', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve refund (admin)
// @route   PATCH /api/payments/refund/:id/approve
// @access  Private/Admin
export const approveRefund = async (req, res) => {
  try {
    const Payment = (await import('../models/Payment.js')).default;
    const payment = await Payment.findById(req.params.id).populate('order');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = 'refunded';
    payment.refundDecisionAt = new Date();
    payment.refundDecisionBy = req.user._id;
    await payment.save();

    // Update order refund status if applicable
    if (payment.order) {
      const Order = (await import('../models/Order.js')).default;
      await Order.findByIdAndUpdate(payment.order, { refundStatus: 'refunded' });
    }

    res.status(200).json({ success: true, message: 'Refund approved', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject refund (admin)
// @route   PATCH /api/payments/refund/:id/reject
// @access  Private/Admin
export const rejectRefund = async (req, res) => {
  try {
    const Payment = (await import('../models/Payment.js')).default;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = 'failed';
    payment.refundDecisionAt = new Date();
    payment.refundDecisionBy = req.user._id;
    await payment.save();

    res.status(200).json({ success: true, message: 'Refund rejected', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify-payment
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

  try {
    dotenv.config({ override: true });
    // Use Render environment variables directly.
    const secret = process.env.VITE_RAZORPAY_SECRET || process.env.RAZORPAY_SECRET;
    
    if (!secret) {
      console.error('[Razorpay Verify] RAZORPAY_SECRET is missing from environment variables');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    // Generate signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.error('[Razorpay Verify] Signature mismatch!');
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Signature is valid. Fetch and update order.
    const order = await Order.findById(orderId).populate('user', 'name email phone').populate('items.product', 'name');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Prevent duplicate processing
    if (order.paymentStatus === 'paid' && order.paymentVerified) {
       return res.status(200).json({ success: true, orderId: order._id, paymentId: razorpay_payment_id, message: 'Already verified' });
    }

    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    order.paymentId = razorpay_payment_id;
    order.paymentGateway = 'razorpay';
    order.paymentVerified = true;
    await order.save();

    // Create Payment Record
    try {
      await Payment.create({
        order: order._id,
        amount: order.totalAmount,
        status: 'completed',
        method: 'razorpay',
        transactionId: razorpay_payment_id,
        paymentDate: new Date(),
        description: `Payment for order ${order._id}`,
        user: order.user._id
      });
    } catch (payErr) {
      console.error('Failed to create Payment record:', payErr);
    }

    // Clear user cart
    try {
      await User.findByIdAndUpdate(order.user._id, { cart: [] });
    } catch(err) {
      console.error('Failed to clear cart:', err);
    }

    // Reduce Inventory
    try {
      const Product = (await import('../models/Product.js')).default;
      for (const item of order.items) {
         if (item.product && item.product._id) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.pieces } });
         }
      }
    } catch(err) {
      console.error('Failed to update inventory:', err);
    }

    // Invoice & Email
    try {
      const { generateInvoicePDF, buildInvoiceDataFromOrder } = await import('../utils/InvoiceGenerator.js');
      const invoiceData = buildInvoiceDataFromOrder(order);
      
      // Hardcode SUCCESS status for verified invoices
      invoiceData.paymentStatus = 'SUCCESS';
      
      const pdfBuffer = await generateInvoicePDF(invoiceData);

      const orderSummary = {
        customerName: order.user.name,
        orderDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        totalAmount: order.totalAmount,
        paymentStatus: 'SUCCESS', 
        deliveryInfo: 'Will be shipped in 3-5 business days',
        shippingAddress: order.shippingAddress,
        shippingDate: order.shippingDate,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        items: order.items.map(item => ({
          productName: item.productName || (item.product && item.product.name) || 'Product',
          unitPrice: item.unitPrice,
          quantity: item.quantity
        }))
      };
      
      await sendOrderConfirmationNotification(order.user.email, order.user.phone, order._id.toString(), orderSummary, pdfBuffer);
    } catch (err) {
      console.error('Invoice or email failed:', err);
    }

    return res.status(200).json({
      success: true,
      orderId: order._id,
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
