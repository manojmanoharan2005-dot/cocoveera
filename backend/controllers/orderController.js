import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Quote from '../models/Quote.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { quoteId, items, shippingAddress, paymentGateway, shippingCharge = 0 } = req.body;

  try {
    let orderItems = [];
    let totalAmount = 0;

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
      }
    } else {
      return res.status(400).json({ success: false, message: 'No items or quote provided for order' });
    }

    const order = await Order.create({
      user: req.user.id,
      quote: quoteId || null,
      items: orderItems,
      totalAmount: totalAmount + Number(shippingCharge),
      shippingCharge: Number(shippingCharge),
      shippingAddress,
      paymentGateway: paymentGateway || 'mock',
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
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
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.trackingStatus = trackingStatus || order.trackingStatus;
    await order.save();

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
