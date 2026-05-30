import Stripe from 'stripe';
import Razorpay from 'razorpay';
import paypal from '@paypal/checkout-server-sdk';
import Order from '../models/Order.js';
import Quote from '../models/Quote.js';
import Invoice from '../models/Invoice.js';
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

      // If this order is linked to a quote, convert quote status to "converted"
      if (order.quote) {
        await Quote.findByIdAndUpdate(order.quote, { status: 'converted' });
      }

      try {
        const invoiceNumber = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const invoiceData = {
          invoiceNumber,
          customerName: order.user.name,
          customerEmail: order.user.email,
          customerPhone: order.user.phone,
          shippingAddress: order.shippingAddress,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentGateway,
          totalAmount: order.totalAmount,
          items: order.items.map(item => ({
            productName: item.productName || (item.product && item.product.name) || 'Product',
            unitPrice: item.unitPrice,
            quantity: item.quantity
          }))
        };

        const pdfBuffer = await generateInvoicePDF(invoiceData);

        const newInvoice = await Invoice.create({
          invoiceNumber,
          orderId: order._id,
          userId: order.user._id,
          customerName: order.user.name,
          customerEmail: order.user.email,
          invoicePdfUrl: 'sent_via_email', // Mocked URL since we email it directly
          totalAmount: order.totalAmount,
          paymentStatus: 'paid'
        });

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
