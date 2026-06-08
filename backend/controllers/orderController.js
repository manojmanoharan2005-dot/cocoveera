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
  const { quoteId, items, shippingAddress, paymentGateway, containerType, shippingCharge = 0, shippingDetails = {}, discount = 0, tax = 0 } = req.body;

  try {
    let orderItems = [];
    let totalAmount = 0;
    let totalWeight = 0;
    let totalVolume = 0;
    let totalPieces = 0;
    
    const getPiecesForContainer = (cType, palletCount = 300) => {
      if (!cType) return 10 * palletCount;
      if (cType.includes('40FT')) return 22 * palletCount;
      return 10 * palletCount;
    };

    const requestedContainer = containerType || shippingDetails.containerType || '20FT FCL';

    // Case 1: Order is converted from an approved quote
    if (quoteId) {
      const quote = await Quote.findById(quoteId).populate('product');
      if (!quote) {
        return res.status(404).json({ success: false, message: 'Quote not found' });
      }

      if (quote.status !== 'replied') {
        return res.status(400).json({ success: false, message: 'This quote is not in a payable state.' });
      }

      const pieces = quote.quantity * getPiecesForContainer(requestedContainer, quote.product.palletCount);
      
      orderItems = [
        {
          product: quote.product._id,
          productName: quote.product.name,
          quantity: quote.quantity, // Fraction
          pieces: pieces,
          unitPrice: quote.pricingProposed || quote.product.price,
        },
      ];
      totalPieces = pieces;
      totalAmount = (quote.pricingProposed || quote.product.price) * pieces;
      totalWeight = (quote.product.weight || 0) * pieces;
      totalVolume = (quote.product.volumeCBM || 0) * pieces;
    } 
    // Case 2: Order is created directly from catalog
    else if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
        }

        const pieces = item.quantity * getPiecesForContainer(item.containerType || requestedContainer, product.palletCount);
        
        orderItems.push({
          product: product._id,
          productName: product.name,
          quantity: item.quantity, // Fraction
          pieces: pieces,
          unitPrice: product.price,
        });
        totalPieces += pieces;
        totalAmount += product.price * pieces;
        totalWeight += (product.weight || 0) * pieces;
        totalVolume += (product.volumeCBM || 0) * pieces;
      }
    } else {
      return res.status(400).json({ success: false, message: 'No items or quote provided for order' });
    }

    const totalOrderQuantity = orderItems.reduce((acc, item) => acc + item.quantity, 0);
    if (totalOrderQuantity < 1 || !Number.isInteger(totalOrderQuantity)) {
      return res.status(400).json({ success: false, message: 'Checkout is available only for full container quantities. Please complete the remaining container capacity.' });
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
      totalAmount: totalAmount + Number(shippingCharge) - Number(discount) + Number(tax),
      shippingCharge: Number(shippingCharge),
      discount: Number(discount),
      tax: Number(tax),
      shippingAddress,
      shippingDetails: {
        shippingMethod: shippingDetails.shippingMethod || 'Not Specified',
        portOfLoading: shippingDetails.portOfLoading || 'Origin Port',
        portOfDischarge: shippingDetails.portOfDischarge || 'Destination Port',
        incoterms: shippingDetails.incoterms || 'FOB',
        transitTime: shippingDetails.transitTime || 'TBD',
        containerType: requestedContainer,
      },
      paymentGateway: paymentGateway || 'mock',
      totalWeight,
      totalVolume,
      totalContainers: totalOrderQuantity,
      totalPieces: totalPieces,
      recommendedContainer: requestedContainer,
    });

    // Populate for email
    const populatedOrder = await Order.findById(order._id).populate('user', 'name email phone').populate('items.product', 'name slug');

    if (paymentGateway === 'cod' || paymentGateway === 'wire') {
      try {
        const { generateInvoicePDF, buildInvoiceDataFromOrder } = await import('../utils/InvoiceGenerator.js');
        const invoiceData = buildInvoiceDataFromOrder(populatedOrder);

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

// @desc    Download Order Invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone currency')
      .populate('items.product', 'name slug price palletCount');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    }

    const { generateInvoicePDF, buildInvoiceDataFromOrder } = await import('../utils/InvoiceGenerator.js');
    const invoiceData = buildInvoiceDataFromOrder(order);

    const pdfBuffer = await generateInvoicePDF(invoiceData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoiceData.invoiceNumber}.pdf`);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation failed:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice' });
  }
};

