/**
 * File: backend/controllers/orderController.js
 * Purpose: Handles the business logic and request processing for order operations.
 */
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Quote from '../models/Quote.js';
import { generateInvoicePDF } from '../utils/InvoiceGenerator.js';
import { sendOrderConfirmationWithInvoice, sendShipmentUpdate } from '../utils/EmailService.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { quoteId, items, shippingAddress, paymentGateway, containerType, shippingCharge = 0 } = req.body;

  try {
    let orderItems = [];
    let totalAmount = 0;
    let totalWeight = 0;
    let totalVolume = 0;

    // Case 1: Order is converted from an approved quote
    if (quoteId) {
      const quote = await Quote.findById(quoteId).populate('product');
      if (!quote) {
        return res.status(404).json({ success: false, message: 'Quote not found' });
      }

      if (quote.status !== 'replied') {
        return res.status(400).json({ success: false, message: 'This quote is not in a payable state.' });
      }

      orderItems = [
        {
          product: quote.product._id,
          quantity: quote.quantity,
          unitPrice: quote.pricingProposed || quote.product.price,
        },
      ];
      totalAmount = (quote.pricingProposed || quote.product.price) * quote.quantity;
      totalWeight = (quote.product.weight || 0) * quote.quantity;
      totalVolume = (quote.product.volumeCBM || 0) * quote.quantity;
    } 
    // Case 2: Order is created directly from catalog
    else if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
        }

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          unitPrice: product.price,
        });
        totalAmount += product.price * item.quantity;
        totalWeight += (product.weight || 0) * item.quantity;
        totalVolume += (product.volumeCBM || 0) * item.quantity;
      }
    } else {
      return res.status(400).json({ success: false, message: 'No items or quote provided for order' });
    }

    let recommendedContainer = containerType || '20FT Container';
    const MAX_20FT_WEIGHT = 28000;
    const MAX_20FT_VOL = 33;
    const MAX_40FT_WEIGHT = 26000;
    const MAX_40FT_VOL = 67;

    if (!containerType) {
      if (totalWeight > MAX_20FT_WEIGHT || totalVolume > MAX_20FT_VOL) {
        if (totalWeight <= MAX_40FT_WEIGHT && totalVolume <= MAX_40FT_VOL) {
          recommendedContainer = '40FT Container';
        } else {
          recommendedContainer = 'Multiple Containers Required';
        }
      }
    }

    const order = await Order.create({
      user: req.user.id,
      quote: quoteId || null,
      items: orderItems,
      totalAmount: totalAmount + Number(shippingCharge),
      shippingCharge: Number(shippingCharge),
      shippingAddress,
      paymentGateway: paymentGateway || 'mock',
      totalWeight,
      totalVolume,
      recommendedContainer,
    });

    // Populate for email
    const populatedOrder = await Order.findById(order._id).populate('user', 'name email phone').populate('items.product', 'name slug');

    if (paymentGateway === 'cod' || paymentGateway === 'wire') {
      try {
        const address = populatedOrder.shippingAddress || {};
        const invoiceData = {
          invoiceNumber: 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          orderId: order._id.toString().slice(-8).toUpperCase(),
          customerName: populatedOrder.user.name,
          customerEmail: populatedOrder.user.email,
          customerPhone: (populatedOrder.user.phone && populatedOrder.user.phone !== 'N/A' && populatedOrder.user.phone !== 'Not Provided') 
            ? (populatedOrder.user.phone.startsWith('+') ? populatedOrder.user.phone : '+' + populatedOrder.user.phone) 
            : 'Not Provided',
          shippingAddress: {
            street: address.street || address.addressLine || 'Address not provided',
            city: address.city || 'City not provided',
            state: address.state || '',
            zip: address.zipCode || address.zip || address.postalCode || '',
            country: address.country || 'India',
          },
          paymentStatus: 'pending',
          paymentMethod: paymentGateway.toUpperCase(),
          transactionId: paymentGateway === 'cod' ? 'CASH ON DELIVERY' : (paymentGateway === 'wire' ? 'BANK WIRE' : 'N/A'),
          totalAmount: populatedOrder.totalAmount,
          containerType: populatedOrder.recommendedContainer || '20FT Container',
          estimatedWeight: populatedOrder.totalWeight || 0,
          estimatedVolume: populatedOrder.totalVolume || 0,
          containerUtilization: (() => {
            const totalPallets = populatedOrder.items.reduce((acc, item) => acc + item.quantity, 0);
            const capacity = (populatedOrder.recommendedContainer && populatedOrder.recommendedContainer.includes('40')) ? 22 : 10;
            return Math.min(Math.round((totalPallets / capacity) * 100), 100);
          })(),
          items: populatedOrder.items.map(item => ({
            productName: item.productName || (item.product && item.product.name) || 'Product',
            sku: (item.product && item.product.slug) ? item.product.slug.toUpperCase().substring(0, 8) : 'COCO-ITEM',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.unitPrice * item.quantity
          })),
          status: order.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'
        };

        const pdfBuffer = await generateInvoicePDF(invoiceData);

        const orderSummary = {
          customerName: populatedOrder.user.name,
          orderDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          totalAmount: populatedOrder.totalAmount,
          paymentStatus: 'pending',
          shippingAddress: populatedOrder.shippingAddress,
          items: invoiceData.items
        };
        await sendOrderConfirmationWithInvoice(populatedOrder.user.email, order._id.toString(), orderSummary, pdfBuffer);
      } catch (err) {
        console.error('Invoice generation or email failed for COD/Wire:', err);
      }
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    import('fs').then(fs => fs.appendFileSync('order_error.log', new Date().toISOString() + ': ' + error.message + '\n' + error.stack + '\n'));
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name category price images')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'name category price')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order shipping tracking status (Admin only)
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
export const updateTrackingStatus = async (req, res) => {
  const { trackingStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.trackingStatus = trackingStatus || order.trackingStatus;
    await order.save();

    try {
      if (trackingStatus) {
        await sendShipmentUpdate(order.user.email, order._id, `Your order status has been updated to: ${trackingStatus}`);
      }
    } catch (err) {
      console.error('Failed to send shipment update email:', err);
    }

    res.status(200).json({ success: true, message: `Tracking status updated to ${order.trackingStatus}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name category price images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user is admin or the order belongs to the user
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Cancel order (User only if pending)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an order that is already being processed' });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.status(200).json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
