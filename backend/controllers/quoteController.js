/**
 * File: backend/controllers/quoteController.js
 * Purpose: Handles client-side Quote operations (listing, details, accepting, revision requests, secure PDFs).
 */
import fs from 'fs';
import path from 'path';
import Quote from '../models/Quote.js';
import mongoose from 'mongoose';
import QuoteRequest from '../models/QuoteRequest.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { sendQuoteRevisionRequestEmail, sendQuoteResponseEmail } from '../utils/mailer.js';
import { generateAndStoreDocument, generateSequentialNumber } from '../utils/documentService.js';

// Helper to check and update quote expiration status dynamically
const checkQuoteExpiration = async (quote) => {
  const now = new Date();
  if (quote.status === 'Quote Approved' && quote.validUntil && new Date(quote.validUntil) < now) {
    await Quote.updateOne({ _id: quote._id }, { status: 'Quote Expired' });
    quote.status = 'Quote Expired';
  }
  return quote;
};

// @desc    Get current logged-in customer's quotes
// @route   GET /api/quotes/myquotes or /api/quotes
// @access  Private
export const getMyQuotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', dateFilter = 'all' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Initial query matching user's ID or email (to capture guest RFQs claimed by login email)
    const userQuery = {
      $or: [
        { user: req.user._id },
        { email: req.user.email.toLowerCase() },
      ],
    };

    // Auto-update claim if not already set
    await Quote.updateMany(
      { email: req.user.email.toLowerCase(), user: { $ne: req.user._id } },
      { user: req.user._id }
    );

    // Build the query
    let query = { ...userQuery };

    // Apply Status Filter
    if (status) {
      query.status = status;
    }

    // Apply Search Filter (Quote Number or Product Name)
    if (search) {
      query.$and = [
        userQuery,
        {
          $or: [
            { quoteNumber: { $regex: search, $options: 'i' } },
            { 'productDetails.name': { $regex: search, $options: 'i' } },
          ],
        },
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

    // Process auto-expiration checks for all matching documents in a single query
    const now = new Date();
    await Quote.updateMany(
      {
        ...query,
        status: 'Quote Approved',
        validUntil: { $lt: now }
      },
      { status: 'Quote Expired' }
    );

    const total = await Quote.countDocuments(query);
    const quotes = await Quote.find(query)
      .select('quoteNumber rfq user email status rejectionReason quoteDate validUntil currency exchangeRate originalInrAmount convertedAmount shippingTerms estimatedProductionTime commercialNotes pdfUrl productDetails containerDetails shippingAddress products createdAt')
      .populate('productDetails.productId', 'name images price slug')
      .populate('products.product', 'name images price slug')
      .populate('rfq')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: quotes.length,
      data: quotes,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get quote details by ID
// @route   GET /api/quotes/:id
// @access  Private
export const getQuoteDetails = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('productDetails.productId', 'name images price slug description')
      .populate('rfq')
      .lean();

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    // Authorization: User must own the quote (via user ID or email)
    const ownsQuote =
      quote.user?.toString() === req.user._id.toString() ||
      quote.email.toLowerCase() === req.user.email.toLowerCase();

    if (!ownsQuote) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this quotation.' });
    }

    // Check expiration dynamically
    await checkQuoteExpiration(quote);

    res.status(200).json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    View Quote PDF inline inside the application
// @route   GET /api/quotes/:id/view-pdf
// @access  Private
export const viewQuotePDF = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    // Authorization Check
    const ownsQuote =
      quote.user?.toString() === req.user._id.toString() ||
      quote.email.toLowerCase() === req.user.email.toLowerCase();

    if (!ownsQuote) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this document.' });
    }

    // Resolve the best available PDF source
    const cloudinaryUrl = quote.pdfUrl || quote.quotationPdf || '';
    const hasLocalFile = quote.pdfPath && fs.existsSync(quote.pdfPath);

    if (!hasLocalFile && !cloudinaryUrl) {
      return res.status(404).json({ success: false, message: 'Quotation PDF file not found on server.' });
    }

    // If local file is available, stream it directly
    if (hasLocalFile) {
      // Allow framing for this specific PDF route (override Helmet's restrictive defaults)
      res.removeHeader('X-Frame-Options');
      res.setHeader(
        'Content-Security-Policy',
        "frame-ancestors 'self' https://cocoveera.com https://www.cocoveera.com https://cocoveera.vercel.app https://*.vercel.app http://localhost:5173 http://localhost:5174 http://localhost:5175"
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Quotation_${quote.quoteNumber}.pdf"`);
      const fileStream = fs.createReadStream(quote.pdfPath);
      fileStream.pipe(res);
      return;
    }

    // Fall back: redirect to Cloudinary URL (serverless environments like Vercel)
    return res.redirect(302, cloudinaryUrl);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Download Quote PDF file
// @route   GET /api/quotes/:id/download-pdf
// @access  Private
export const downloadQuotePDF = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    // Authorization Check
    const ownsQuote =
      quote.user?.toString() === req.user._id.toString() ||
      quote.email.toLowerCase() === req.user.email.toLowerCase();

    if (!ownsQuote) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this document.' });
    }

    // Resolve the best available PDF source
    const cloudinaryUrl = quote.pdfUrl || quote.quotationPdf || '';
    const hasLocalFile = quote.pdfPath && fs.existsSync(quote.pdfPath);

    if (!hasLocalFile && !cloudinaryUrl) {
      return res.status(404).json({ success: false, message: 'Quotation PDF file not found on server.' });
    }

    if (hasLocalFile) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Quotation_${quote.quoteNumber}.pdf"`);
      const fileStream = fs.createReadStream(quote.pdfPath);
      fileStream.pipe(res);
      return;
    }

    // Fall back: redirect browser to Cloudinary with content-disposition attachment hint
    return res.redirect(302, cloudinaryUrl);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept Quotation and prepare for conversion to order
// @route   PUT /api/quotes/:id/accept
// @access  Private
export const acceptQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    // Authorization Check
    const ownsQuote =
      quote.user?.toString() === req.user._id.toString() ||
      quote.email.toLowerCase() === req.user.email.toLowerCase();

    if (!ownsQuote) {
      return res.status(403).json({ success: false, message: 'Not authorized to perform this action.' });
    }

    // Check if order already exists for this quote (Idempotency check)
    const Order = (await import('../models/Order.js')).default;
    const existingOrder = await Order.findOne({ quote: quote._id });
    if (existingOrder) {
      if (quote.status !== 'Quote Accepted') {
        quote.status = 'Quote Accepted';
        quote.acceptedAt = quote.acceptedAt || new Date();
        quote.acceptedBy = quote.acceptedBy || req.user._id;
        await quote.save();
      }
      return res.status(200).json({
        success: true,
        message: 'Quotation accepted successfully. Redirecting to Orders...',
        orderId: existingOrder._id,
        data: quote,
      });
    }

    // Verify status is Approved or valid (cannot accept expired, rejected, or already accepted)
    await checkQuoteExpiration(quote);

    if (quote.status === 'Quote Expired') {
      return res.status(400).json({ success: false, message: 'This quotation has expired and cannot be accepted.' });
    }

    if (quote.status === 'Quote Rejected' || quote.status === 'Rejected by Customer') {
      return res.status(400).json({ success: false, message: 'Rejected quotations cannot be accepted.' });
    }

    if (quote.status === 'Quote Accepted' || quote.status === 'ACCEPTED' || quote.status === 'converted') {
      return res.status(400).json({ success: false, message: 'Quotation has already been accepted.' });
    }

    // Accept Quote and save state
    quote.status = 'Quote Accepted';
    quote.acceptedAt = new Date();
    quote.acceptedBy = req.user._id;
    await quote.save();

    // Link back to RFQ and update its status
    let expectedDeliveryDate = null;
    if (quote.rfq) {
      const rfq = await QuoteRequest.findById(quote.rfq);
      if (rfq) {
        rfq.status = 'CONFIRMED';
        rfq.timeline.push({
          status: 'CONFIRMED',
          title: 'Quote Accepted by Customer',
          description: `Customer accepted quote proposal #${quote.quoteNumber}. Automatically converted to Order.`,
          timestamp: new Date(),
        });
        await rfq.save();
        expectedDeliveryDate = rfq.expectedDeliveryDate;
      }
    }

    // Generate sequential Order Number
    const orderNumber = await generateSequentialNumber('ORD');

    // Structure items array
    const totalAmt = quote.convertedAmount || 0;
    const orderItems = (quote.products && quote.products.length > 0)
      ? quote.products.map(item => ({
          product: item.product || null,
          productName: item.productName || 'Coco Substrates',
          quantity: item.quantity || 1,
          pieces: item.pieces || 0,
          unitPrice: item.unitPrice || 0,
        }))
      : [
          {
            product: quote.productDetails?.productId || null,
            productName: quote.productDetails?.name || 'Coco Substrates',
            quantity: parseInt(quote.productDetails?.quantity) || 1,
            pieces: 0,
            unitPrice: parseInt(quote.productDetails?.quantity) > 0 ? (totalAmt / parseInt(quote.productDetails?.quantity)) : totalAmt,
          }
        ];

    // Setup payment milestones
    const paymentMilestones = [
      {
        milestoneType: '40% Advance Payment',
        percentage: 40,
        amount: Math.round(totalAmt * 0.40 * 100) / 100,
        currency: quote.currency || 'USD',
        status: 'Pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      },
      {
        milestoneType: '60% Payment Unlocked',
        percentage: 20,
        amount: Math.round(totalAmt * 0.20 * 100) / 100,
        currency: quote.currency || 'USD',
        status: 'Locked',
      },
      {
        milestoneType: '80% Payment Unlocked',
        percentage: 20,
        amount: Math.round(totalAmt * 0.20 * 100) / 100,
        currency: quote.currency || 'USD',
        status: 'Locked',
      },
      {
        milestoneType: '100% Final Payment',
        percentage: 20,
        amount: Math.round(totalAmt * 0.20 * 100) / 100,
        currency: quote.currency || 'USD',
        status: 'Locked',
      },
    ];

    // Create the Order
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      quote: quote._id,
      expectedDeliveryDate: expectedDeliveryDate || quote.expectedDelivery || null,
      items: orderItems,
      totalAmount: totalAmt,
      currency: quote.currency || 'USD',
      exchangeRate: quote.exchangeRate || 1.0,
      commercialNotes: quote.commercialNotes || '',
      paymentGateway: 'wire',
      paymentStatus: 'Awaiting Initial Payment',
      orderStatus: 'Payment Pending',
      paymentProgress: 0,
      discount: quote.discount || 0,
      shippingCharge: quote.shippingCharges || 0,
      tax: quote.tax || 0,
      totalContainers: quote.containerCount || 1,
      totalPieces: quote.products?.reduce((acc, curr) => acc + (curr.pieces || 0), 0) || 0,
      totalWeight: quote.estimatedWeight || 0,
      totalVolume: quote.estimatedVolume || 0,
      shippingAddress: {
        addressLine1: quote.shippingAddress?.addressLine1 || '',
        addressLine2: quote.shippingAddress?.addressLine2 || '',
        city: quote.shippingAddress?.city || '',
        state: quote.shippingAddress?.state || '',
        postalCode: quote.shippingAddress?.postalCode || '',
        country: quote.shippingAddress?.country || '',
      },
      shippingDetails: {
        shippingMethod: quote.shippingMethod || 'Sea Freight',
        portOfLoading: quote.originPort || 'Chennai, India',
        portOfDischarge: quote.destinationPort || 'Destination Port',
        incoterms: quote.incoterms || 'FOB',
        transitTime: quote.transitTime || '14 Days',
        containerType: quote.containerDetails?.containerSize || '20 FT',
      },
      invoiceUrl: '',
      paymentMilestones: paymentMilestones,
    });

    // Automatically generate sequential Proforma Invoice and upload to Cloudinary + DB
    const docRecord = await generateAndStoreDocument({
      orderId: order._id,
      type: 'proformaInvoicePdf',
      user: req.user,
    });

    // Update order with the Proforma Invoice URL
    order.invoiceUrl = docRecord.url;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Quotation accepted successfully. Your order has been created.',
      orderId: order._id,
      data: quote,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject Quote from Customer
// @route   PUT /api/quotes/:id/reject
// @access  Private
export const rejectQuote = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    // Authorization Check
    const ownsQuote =
      quote.user?.toString() === req.user._id.toString() ||
      quote.email.toLowerCase() === req.user.email.toLowerCase();

    if (!ownsQuote) {
      return res.status(403).json({ success: false, message: 'Not authorized to perform this action.' });
    }

    // Check expiration
    await checkQuoteExpiration(quote);
    if (quote.status === 'Quote Expired') {
      return res.status(400).json({ success: false, message: 'This quotation has expired and cannot be rejected.' });
    }

    quote.status = 'Rejected by Customer';
    quote.rejectionReason = rejectionReason || '';
    await quote.save();

    // Sync RFQ timeline and status
    if (quote.rfq) {
      const rfq = await QuoteRequest.findById(quote.rfq);
      if (rfq) {
        rfq.status = 'REJECTED';
        rfq.timeline.push({
          status: 'REJECTED',
          title: 'Quotation Rejected by Customer',
          description: rejectionReason ? `Reason: ${rejectionReason}` : 'No reason provided.',
          timestamp: new Date(),
        });
        await rfq.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Quotation rejected successfully.',
      data: quote,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request revision on a quote
// @route   POST /api/quotes/:id/revision
// @access  Private
export const requestRevision = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide revision comments.' });
    }

    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    // Authorization Check
    const ownsQuote =
      quote.user?.toString() === req.user._id.toString() ||
      quote.email.toLowerCase() === req.user.email.toLowerCase();

    if (!ownsQuote) {
      return res.status(403).json({ success: false, message: 'Not authorized to perform this action.' });
    }

    // Check expiration
    await checkQuoteExpiration(quote);
    if (quote.status === 'Quote Expired') {
      return res.status(400).json({ success: false, message: 'This quotation has expired.' });
    }

    // Add revision request to history
    quote.revisionRequests.push({
      comment: comment.trim(),
      requestedAt: new Date(),
      status: 'pending',
    });

    // Reset status to Pending Review
    quote.status = 'Pending Review';
    await quote.save();

    // Sync RFQ timeline and status
    if (quote.rfq) {
      const rfq = await QuoteRequest.findById(quote.rfq);
      if (rfq) {
        rfq.status = 'NEGOTIATION';
        rfq.timeline.push({
          status: 'NEGOTIATION',
          title: 'Revision Requested by Customer',
          description: comment.trim(),
          timestamp: new Date(),
        });
        await rfq.save();
      }
    }

    // Notify Administrator via email
    try {
      await sendQuoteRevisionRequestEmail(
        req.user.email,
        req.user.name,
        quote.quoteNumber,
        comment.trim()
      );
    } catch (mailError) {
      console.error('Failed to notify admin of revision request:', mailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Revision request submitted successfully. Our team will review your feedback and get back to you shortly.',
      data: quote,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// LEGACY BACKWARD COMPATIBILITY CONTROLLERS
// ==========================================

// @desc    Submit a legacy quote request
// @route   POST /api/quotes
// @access  Private
export const submitQuoteRequest = async (req, res) => {
  const { productId, quantity, unitType, ph, ec, moisture, notes, shippingAddress } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const quoteNumber = `QT-${year}${month}${day}-${randomSuffix}`;

    const quote = await Quote.create({
      quoteNumber,
      rfq: new mongoose.Types.ObjectId(), // dummy RFQ for legacy compatibility
      user: req.user.id,
      email: req.user.email,
      productDetails: {
        productId,
        name: product.name,
        quantity: quantity ? String(quantity) : '',
        unitType: unitType || 'Tons',
        specifications: { ph, ec, moisture, notes },
      },
      shippingAddress,
      status: 'RFQ Submitted',
    });

    res.status(201).json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all quotes (Admin only)
// @route   GET /api/quotes
// @access  Private/Admin
export const getAllQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find()
      .populate('user', 'name email phone')
      .populate('productDetails.productId', 'name category price')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply/update quote (Admin only)
// @route   PUT /api/quotes/:id/reply
// @access  Private/Admin
export const replyToQuote = async (req, res) => {
  const { pricingProposed, replyMessage, status } = req.body;

  try {
    let quote = await Quote.findById(req.params.id)
      .populate('user', 'name email')
      .populate('productDetails.productId', 'name');

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    quote.convertedAmount = pricingProposed !== undefined ? Number(pricingProposed) : quote.convertedAmount;
    quote.commercialNotes = replyMessage || quote.commercialNotes;
    quote.status = status === 'replied' ? 'Quote Approved' : status || 'Quote Approved';

    await quote.save();

    // Trigger Brevo Email notifying user of the proposal details
    await sendQuoteResponseEmail(
      quote.user.email,
      quote.user.name,
      quote.productDetails.name || 'Coco Substrates',
      quote.convertedAmount,
      quote.commercialNotes
    );

    res.status(200).json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
