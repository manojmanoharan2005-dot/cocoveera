/**
 * File: backend/controllers/adminOrderController.js
 * Purpose: Handles the business logic and request processing for adminOrder operations.
 */
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAdminOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentStatus,
      sortBy = '-createdAt',
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Search by order ID or customer email
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone country companyName')
      .populate('items.product', 'name price')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
export const getAdminOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user')
      .populate('items.product')
      .populate('container');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, remarks } = req.body;

    if (
      ![
        'pending',
        'confirmed',
        'production',
        'packed',
        'loaded',
        'shipped',
        'delivered',
        'cancelled',
      ].includes(orderStatus)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update payment status (Admin)
// @route   PATCH /api/admin/orders/:id/payment
// @access  Private/Admin
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;

    if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;
    if (paymentId) order.paymentId = paymentId;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign container to order
// @route   PATCH /api/admin/orders/:id/container
// @access  Private/Admin
export const assignContainer = async (req, res) => {
  try {
    const { containerId, containerCapacity } = req.body;

    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.container = containerId;
    order.containerCapacity = containerCapacity;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Container assigned successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate invoice for order
// @route   POST /api/admin/orders/:id/invoice
// @access  Private/Admin
export const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const invoiceData = {
      invoiceNumber: `INV-${order._id.toString().slice(-6).toUpperCase()}`,
      date: new Date().toLocaleDateString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      customer: order.user,
      items: order.items,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
    };

    res.status(200).json({ success: true, data: invoiceData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate and download invoice for order
// @route   GET /api/admin/orders/:id/invoice/download
// @access  Private/Admin
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const { generateInvoicePDF } = await import('../utils/InvoiceGenerator.js');
    
    // Map order data to invoiceData
    const invoiceData = {
      invoiceNumber: `INV-${order._id.toString().slice(-6).toUpperCase()}`,
      orderId: order._id.toString(),
      customerId: order.user?._id?.toString() || 'Guest',
      currency: order.user?.currency || 'USD',
      customerName: order.user?.name || 'Customer',
      customerEmail: order.user?.email || '',
      customerPhone: order.user?.phone || '',
      shippingAddress: order.shippingAddress || {},
      containerType: order.recommendedContainer || 'N/A',
      containerUtilization: order.assignedContainer ? 100 : 0, 
      estimatedWeight: order.totalWeight || 0,
      estimatedVolume: order.totalVolume || 0,
      shippingMethod: order.shippingAddress?.country?.toLowerCase() === 'india' ? 'Road Transport' : 'Sea Freight',
      destinationCountry: order.shippingAddress?.country || 'Unknown',
      transitTime: 'Standard ETA',
      items: order.items.map(item => ({
        productName: item.product?.name || 'Product',
        sku: item.product?._id?.toString().slice(-6) || 'SKU',
        quantity: item.quantity,
        unitPrice: item.product?.price || 0
      })),
      subtotal: order.items.reduce((acc, curr) => acc + (curr.quantity * (curr.product?.price || 0)), 0),
      discount: 0,
      shippingCharge: order.shippingCharge || 0,
      tax: 0,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentGateway || 'Card',
      transactionId: order.paymentId || 'N/A',
      paymentDate: order.paidAt ? new Date(order.paidAt).toLocaleDateString() : new Date().toLocaleDateString(),
      paymentStatus: order.paymentStatus || 'PENDING',
      orderDate: new Date(order.createdAt).toLocaleDateString(),
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoiceData.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend Invoice Email
// @route   POST /api/admin/orders/:id/invoice/email
// @access  Private/Admin
export const resendInvoiceEmail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const { generateInvoicePDF } = await import('../utils/InvoiceGenerator.js');
    const { sendOrderConfirmationWithInvoice } = await import('../utils/EmailService.js');
    
    // Map order data to invoiceData
    const invoiceData = {
      invoiceNumber: `INV-${order._id.toString().slice(-6).toUpperCase()}`,
      orderId: order._id.toString(),
      customerId: order.user?._id?.toString() || 'Guest',
      currency: order.user?.currency || 'USD',
      customerName: order.user?.name || 'Customer',
      customerEmail: order.user?.email || '',
      customerPhone: order.user?.phone || '',
      shippingAddress: order.shippingAddress || {},
      containerType: order.recommendedContainer || 'N/A',
      containerUtilization: order.assignedContainer ? 100 : 0, 
      estimatedWeight: order.totalWeight || 0,
      estimatedVolume: order.totalVolume || 0,
      shippingMethod: order.shippingAddress?.country?.toLowerCase() === 'india' ? 'Road Transport' : 'Sea Freight',
      destinationCountry: order.shippingAddress?.country || 'Unknown',
      transitTime: 'Standard ETA',
      items: order.items.map(item => ({
        productName: item.product?.name || 'Product',
        sku: item.product?._id?.toString().slice(-6) || 'SKU',
        quantity: item.quantity,
        unitPrice: item.product?.price || 0
      })),
      subtotal: order.items.reduce((acc, curr) => acc + (curr.quantity * (curr.product?.price || 0)), 0),
      discount: 0,
      shippingCharge: order.shippingCharge || 0,
      tax: 0,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentGateway || 'Card',
      transactionId: order.paymentId || 'N/A',
      paymentDate: order.paidAt ? new Date(order.paidAt).toLocaleDateString() : new Date().toLocaleDateString(),
      paymentStatus: order.paymentStatus || 'PENDING',
      orderDate: new Date(order.createdAt).toLocaleDateString(),
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);

    await sendOrderConfirmationWithInvoice(
      invoiceData.customerEmail,
      invoiceData.orderId,
      invoiceData,
      pdfBuffer
    );

    res.status(200).json({ success: true, message: 'Invoice email resent successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export orders (Admin)
// @route   POST /api/admin/orders/export
// @access  Private/Admin
export const exportOrders = async (req, res) => {
  try {
    const { format = 'csv', filters = {} } = req.body;

    let query = {};
    if (filters.status) query.orderStatus = filters.status;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;

    const orders = await Order.find(query)
      .populate('user', 'name email phone country')
      .populate('items.product', 'name price');

    res.status(200).json({
      success: true,
      message: `Exporting ${orders.length} orders as ${format}`,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order statistics
// @route   GET /api/admin/orders/stats
// @access  Private/Admin
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        paidOrders,
        pendingOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
