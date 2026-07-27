/**
 * File: backend/controllers/adminOrderController.js
 * Purpose: Handles the business logic and request processing for adminOrder operations.
 */
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendStatusUpdateNotification } from '../utils/NotificationService.js';
import fs from 'fs';
import path from 'path';
import Document from '../models/Document.js';
import Timeline from '../models/Timeline.js';
import { generateAndStoreDocument } from '../utils/documentService.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

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
      const users = await User.find({ email: { $regex: search, $options: 'i' } }).select('_id');
      const userIds = users.map(u => u._id);

      // Check if search is a valid ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search);

      query.$or = [];
      if (isValidObjectId) {
        query.$or.push({ _id: search });
      }
      if (userIds.length > 0) {
        query.$or.push({ user: { $in: userIds } });
      }

      // If neither matched, return empty result by adding an unsatisfiable condition if query.$or is empty
      if (query.$or.length === 0) {
        query._id = null; // Forces no results
        delete query.$or;
      }
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

    let order = await Order.findById(req.params.id).populate('user').populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    // Trigger automated document generation based on status change
    try {
      if (orderStatus === 'production') {
        // Generate Production / Quality Report automatically
        await generateAndStoreDocument({
          orderId: order._id,
          type: 'qualityReportPdf',
          user: order.user,
        });
      } else if (orderStatus === 'packed') {
        // Generate Packing List automatically
        await generateAndStoreDocument({
          orderId: order._id,
          type: 'packingListPdf',
          user: order.user,
        });
      } else if (orderStatus === 'loaded') {
        // Generate Container Loading Report automatically
        await generateAndStoreDocument({
          orderId: order._id,
          type: 'loadingReportPdf',
          user: order.user,
        });
      } else if (orderStatus === 'shipped') {
        // Generate ALL remaining B2B export documents automatically
        const exportDocTypes = [
          'commercialInvoicePdf',
          'packingListPdf',
          'certificateOfOriginPdf',
          'billOfLadingPdf',
          'phytosanitaryPdf',
          'fumigationPdf',
          'weightPdf',
          'inspectionPdf',
          'exportDeclarationPdf',
        ];
        for (const docType of exportDocTypes) {
          try {
            await generateAndStoreDocument({
              orderId: order._id,
              type: docType,
              user: order.user,
            });
          } catch (docErr) {
            console.error(`Failed to automatically generate export document ${docType}:`, docErr);
          }
        }
      }
    } catch (docErr) {
      console.error(`Failed to run automated documents for status ${orderStatus}:`, docErr);
    }

    // Send email notification to user
    try {
      if (order.user && order.user.email) {
        await sendStatusUpdateNotification(order.user.email, order.user.phone, order, orderStatus);
      }
    } catch (emailErr) {
      console.error('Failed to send status update email:', emailErr);
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload Quality Inspection Report PDF
// @route   POST /api/admin/orders/:id/quality-report
// @access  Private/Admin
export const uploadQualityReport = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    const order = await Order.findById(orderId).populate('user').populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Upload buffer to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'cocoveera_documents/qualityReportPdf');

    // Save a local copy for viewing endpoints
    try {
      const localDir = path.join('uploads', 'orders');
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      fs.writeFileSync(path.join(localDir, `invoice_${order._id}.pdf`), req.file.buffer);
    } catch (localErr) {
      console.warn('Failed to save a local copy of uploaded PDF:', localErr);
    }

    // Create or update Document record in DB
    let docRecord = await Document.findOne({ order: order._id, type: 'qualityReportPdf' });
    if (!docRecord) {
      docRecord = new Document({
        order: order._id,
        user: order.user._id,
        name: 'Quality Report',
        type: 'qualityReportPdf',
        generatedBy: 'Admin Upload',
      });
    }

    docRecord.url = uploadResult.secure_url;
    docRecord.publicId = uploadResult.public_id;
    docRecord.status = 'Available';
    docRecord.generatedDate = new Date();
    await docRecord.save();

    // Update order
    order.qualityReportPdf = uploadResult.secure_url;
    await order.save();

    // Create Order Timeline event
    await Timeline.create({
      order: order._id,
      status: 'qualityReportPdf',
      title: 'Quality Inspection Report Uploaded',
      description: 'The Quality Inspection Report was uploaded by the administration and is available.',
    });

    res.status(200).json({
      success: true,
      message: 'Quality Inspection Report uploaded successfully',
      data: docRecord,
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

    const { generateInvoicePDF, buildInvoiceDataFromOrder } = await import('../utils/InvoiceGenerator.js');
    
    // Map order data to invoiceData
    const invoiceData = buildInvoiceDataFromOrder(order);

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

    const { generateInvoicePDF, buildInvoiceDataFromOrder } = await import('../utils/InvoiceGenerator.js');
    const { sendOrderConfirmationNotification } = await import('../utils/NotificationService.js');
    
    // Map order data to invoiceData
    const invoiceData = buildInvoiceDataFromOrder(order);

    const pdfBuffer = await generateInvoicePDF(invoiceData);

    await sendOrderConfirmationNotification(
      invoiceData.customerEmail,
      order.user?.phone || null,
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
    
    // Revenue
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Cancellations
    const totalCancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });
    const cancellationRate = totalOrders > 0 ? ((totalCancelledOrders / totalOrders) * 100).toFixed(2) : 0;
    
    const cancellationReasons = await Order.aggregate([
      { $match: { orderStatus: 'cancelled', cancellationReason: { $ne: null } } },
      { $group: { _id: '$cancellationReason', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        paidOrders,
        pendingOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCancelledOrders,
        cancellationRate: Number(cancellationRate),
        cancellationReasons,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
