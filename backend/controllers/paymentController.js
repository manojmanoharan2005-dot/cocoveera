/**
 * File: backend/controllers/paymentController.js
 * Purpose: Handles the business logic and request processing for payment operations.
 */
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import paypal from '@paypal/checkout-server-sdk';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Quote from '../models/Quote.js';
import { generateInvoicePDF } from '../utils/InvoiceGenerator.js';
import { sendOrderConfirmationWithInvoice } from '../utils/EmailService.js';

// Setup payment gateways with mock detection
const isStripeMock = !process.env.STRIPE_SECRET || process.env.STRIPE_SECRET.startsWith('mock_');
const isRazorpayMock = !process.env.RAZORPAY_KEY || process.env.RAZORPAY_KEY.startsWith('mock_');
const isPaypalMock = !process.env.PAYPAL_SECRET || process.env.PAYPAL_SECRET.startsWith('mock_');

let stripeInstance = null;
if (!isStripeMock) {
  stripeInstance = new Stripe(process.env.STRIPE_SECRET);
}

let razorpayInstance = null;
if (!isRazorpayMock) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
}

// @desc    Initiate payment session for an order
// @route   POST /api/payments/initiate
// @access  Private
export const initiatePayment = async (req, res) => {
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
      if (isStripeMock) {
        console.log(`[Stripe Mock] Simulating payment intent for order: ${orderId}`);
        return res.status(200).json({
          success: true,
          gateway: 'stripe',
          clientSecret: 'mock_stripe_client_secret_' + Date.now(),
          amount: order.totalAmount,
        });
      }

      const paymentIntent = await stripeInstance.paymentIntents.create({
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
      if (isRazorpayMock) {
        console.log(`[Razorpay Mock] Simulating order creation for order: ${orderId}`);
        return res.status(200).json({
          success: true,
          gateway: 'razorpay',
          id: 'mock_rzp_order_' + Date.now(),
          amount: Math.round(order.totalAmount * 100),
          currency: 'INR',
        });
      }

      // order.totalAmount is already in INR
      const inrAmount = Math.round(order.totalAmount * 100);
      const rzpOrder = await razorpayInstance.orders.create({
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
        const invoiceNumber = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const invoiceData = {
          invoiceNumber,
          customerName: order.user.name,
          customerEmail: order.user.email,
          customerPhone: order.user.phone || 'Not Provided',
          shippingAddress: {
            addressLine: address.addressLine || 'Address not provided',
            city: address.city || 'City not provided',
            state: address.state || '',
            postalCode: address.postalCode || '',
            country: address.country || 'India',
          },
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentGateway,
          totalAmount: order.totalAmount,
          containerType: order.recommendedContainer || 'LCL',
          estimatedWeight: order.totalWeight || 0,
          estimatedVolume: order.totalVolume || 0,
          containerUtilization: order.totalVolume > 0 ? Math.min(Math.round((order.totalVolume / 33) * 100), 100) : 0,
          items: order.items.map(item => ({
            productName: item.productName || (item.product && item.product.name) || 'Product',
            sku: (item.product && item.product.slug) ? item.product.slug.toUpperCase().substring(0, 8) : 'COCO-ITEM',
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.unitPrice * item.quantity
          }))
        };

        const pdfBuffer = await generateInvoicePDF(invoiceData);

        // Send Email
        const orderSummary = {
          customerName: order.user.name,
          orderDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          deliveryInfo: 'Will be shipped in 3-5 business days',
          shippingAddress: order.shippingAddress,
          items: order.items.map(item => ({
            productName: item.productName || (item.product && item.product.name) || 'Product',
            unitPrice: item.unitPrice,
            quantity: item.quantity
          }))
        };
        await sendOrderConfirmationWithInvoice(order.user.email, order._id.toString(), orderSummary, pdfBuffer);

      } catch (err) {
        console.error('Invoice generation or email failed:', err);
      }

      return res.status(200).json({ success: true, message: 'Payment confirmed successfully', data: order });
    } else {
      order.paymentStatus = 'failed';
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
