/**
 * File: backend/controllers/orderController.js
 * Purpose: Handles the business logic and request processing for order operations.
 */
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Quote from '../models/Quote.js';
import User from '../models/User.js';
import { generateInvoicePDF } from '../utils/InvoiceGenerator.js';
import { sendShipmentUpdate } from '../utils/EmailService.js';
import { sendOrderConfirmationNotification } from '../utils/NotificationService.js';

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
      const quote = await Quote.findById(quoteId)
        .populate('products.product')
        .populate('productDetails.productId')
        .populate('rfq');
      if (!quote) {
        return res.status(404).json({ success: false, message: 'Quote not found' });
      }

      if (quote.status !== 'replied' && quote.status !== 'Quote Approved' && quote.status !== 'Quote Accepted') {
        return res.status(400).json({ success: false, message: 'This quote is not in a payable state.' });
      }

      if (quote.products && quote.products.length > 0) {
        orderItems = [];
        totalPieces = 0;
        totalAmount = 0;
        totalWeight = 0;
        totalVolume = 0;

        for (const item of quote.products) {
          const productObj = item.product;
          if (!productObj) continue;

          const pieces = item.quantity * getPiecesForContainer(requestedContainer, productObj.palletCount || 300);
          
          orderItems.push({
            product: productObj._id,
            productName: item.productName || productObj.name,
            quantity: item.quantity,
            pieces: pieces,
            unitPrice: quote.pricingProposed || productObj.price || 0,
          });

          totalPieces += pieces;
          totalAmount += (quote.pricingProposed || productObj.price || 0) * pieces;
          totalWeight += (productObj.weight || 0) * pieces;
          totalVolume += (productObj.volumeCBM || 0) * pieces;
        }
      } else {
        // Legacy fallback
        const productObj = quote.productDetails?.productId;
        if (!productObj) {
          return res.status(400).json({ success: false, message: 'No product information found in quote.' });
        }

        const quoteQty = parseFloat(quote.productDetails?.quantity) || 1;
        const pieces = quoteQty * getPiecesForContainer(requestedContainer, productObj.palletCount || 300);
        
        orderItems = [
          {
            product: productObj._id,
            productName: quote.productDetails?.name || productObj.name,
            quantity: quoteQty,
            pieces: pieces,
            unitPrice: quote.pricingProposed || productObj.price || 0,
          },
        ];
        totalPieces = pieces;
        totalAmount = (quote.pricingProposed || productObj.price || 0) * pieces;
        totalWeight = (productObj.weight || 0) * pieces;
        totalVolume = (productObj.volumeCBM || 0) * pieces;
      }
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

    const now = new Date();
    const shippingDate = new Date(now);
    shippingDate.setDate(shippingDate.getDate() + 3); // 3 days to ship

    const estimatedDeliveryDate = new Date(shippingDate);
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 14); // 14 days transit

    const order = await Order.create({
      user: req.user.id,
      quote: quoteId || null,
      expectedDeliveryDate: (quoteId && quote) ? (quote.rfq?.expectedDeliveryDate || null) : null,
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
        transitTime: shippingDetails.transitTime || '14 Days',
        containerType: requestedContainer,
      },
      shippingDate,
      estimatedDeliveryDate,
      paymentGateway: paymentGateway || 'mock',
      totalWeight,
      totalVolume,
      totalContainers: totalOrderQuantity,
      totalPieces: totalPieces,
      recommendedContainer: requestedContainer,
    });

    // Save address to user profile if it doesn't exist
    if (shippingAddress && shippingAddress.street) {
      const userDoc = await User.findById(req.user.id);
      if (userDoc) {
        const addressExists = userDoc.addresses.some(addr => 
          addr.street === shippingAddress.street && 
          addr.city === shippingAddress.city && 
          (addr.zip === shippingAddress.zipCode || addr.zip === shippingAddress.postalCode)
        );

        if (!addressExists) {
          userDoc.addresses.push({
            name: userDoc.name,
            phone: userDoc.phone,
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zip: shippingAddress.zipCode || shippingAddress.postalCode,
            country: shippingAddress.country,
            isDefault: userDoc.addresses.length === 0,
            tag: 'Home'
          });
          await userDoc.save();
        }
      }
    }

    // Populate for email
    const populatedOrder = await Order.findById(order._id).populate('user', 'name email phone').populate('items.product', 'name slug');

    if (paymentGateway === 'cod' || paymentGateway === 'wire') {
      // Clear user cart for offline methods since they are considered placed immediately
      try {
        await User.findByIdAndUpdate(req.user.id, { cart: [] });
      } catch (err) {
        console.error('Failed to clear cart for offline order:', err);
      }

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
          items: invoiceData.items,
          shippingDate: populatedOrder.shippingDate,
          estimatedDeliveryDate: populatedOrder.estimatedDeliveryDate
        };
        await sendOrderConfirmationNotification(populatedOrder.user.email, populatedOrder.user.phone, order._id.toString(), orderSummary, pdfBuffer);
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
    const { page = 1, limit = 10, search = '', dateFilter = 'all' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { user: req.user.id };

    // Apply search filter (orderNumber or productName)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { orderNumber: { $regex: searchRegex } },
        { 'items.productName': { $regex: searchRegex } }
      ];
    }

    // Apply Date Range Filter
    if (dateFilter && dateFilter !== 'all') {
      const days = parseInt(dateFilter);
      if (!isNaN(days)) {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - days);
        query.createdAt = { $gte: thresholdDate };
      }
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .select('orderNumber items totalAmount currency paymentStatus orderStatus createdAt shippingAddress shippingDetails totalContainers totalPieces totalWeight totalVolume recommendedContainer paymentProgress paymentMilestones amountPaid remainingAmount paymentHistory paymentId paymentGateway paymentVerified invoiceVersion productionStatus updatedAt')
      .populate('items.product', 'name slug images price category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      }
    });
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
      .populate('items.product', 'name category price images slug')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user is admin or the order belongs to the user
    const orderUserId = order.user?._id ? order.user._id.toString() : order.user?.toString();
    if (orderUserId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const { cancellationReason, cancellationCustomReason } = req.body;
    
    if (!cancellationReason) {
      return res.status(400).json({ success: false, message: 'Cancellation reason is required' });
    }
    
    if (cancellationReason === 'Other' && !cancellationCustomReason) {
      return res.status(400).json({ success: false, message: 'Custom reason is required when "Other" is selected' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    // Cancellation Allowed: pending, confirmed, packed, loaded
    // Cancellation Not Allowed: shipped, delivered, cancelled
    const notAllowedStatuses = ['shipped', 'delivered', 'cancelled'];
    if (notAllowedStatuses.includes(order.orderStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: 'This order has already been shipped and can no longer be cancelled. Please contact support for assistance.' 
      });
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = cancellationReason;
    if (cancellationCustomReason) {
      order.cancellationCustomReason = cancellationCustomReason;
    }
    order.cancelledAt = new Date();
    
    await order.save();

    // Send cancellation email
    try {
      const { sendOrderCancellationEmail } = await import('../utils/EmailService.js');
      await sendOrderCancellationEmail(
        order.user.email,
        order._id,
        cancellationCustomReason || cancellationReason,
        order.cancelledAt,
        order.paymentStatus === 'paid' ? 'Pending Refund' : 'N/A'
      );
    } catch (emailErr) {
      console.error('Failed to send cancellation email:', emailErr);
    }

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
    // Always fetch a fresh (non-lean) order — never use a cached document
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

    // No-cache headers: PDF must always reflect current payment state
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Invoice-${invoiceData.invoiceNumber}.pdf`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation failed:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice' });
  }
};

