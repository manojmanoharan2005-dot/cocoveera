/**
 * File: backend/controllers/quoteController.js
 * Purpose: Handles client-side B2B Quote operations (listing, details, accepting, revision requests, secure PDFs).
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

// Helper to check and update quote expiration status dynamically
const checkQuoteExpiration = async (quote) => {
  const now = new Date();
  if (quote.status === 'Quote Approved' && quote.validUntil && quote.validUntil < now) {
    quote.status = 'Quote Expired';
    await quote.save();
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

    // Process auto-expiration checks for all matching documents first
    const quotesToCheck = await Quote.find(query);
    for (const q of quotesToCheck) {
      await checkQuoteExpiration(q);
    }

    const total = await Quote.countDocuments(query);
    const quotes = await Quote.find(query)
      .populate('productDetails.productId', 'name images price slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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
      .populate('rfq');

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

    if (!quote.pdfPath || !fs.existsSync(quote.pdfPath)) {
      return res.status(404).json({ success: false, message: 'Quotation PDF file not found on server.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Quotation_${quote.quoteNumber}.pdf"`);

    const fileStream = fs.createReadStream(quote.pdfPath);
    fileStream.pipe(res);
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

    if (!quote.pdfPath || !fs.existsSync(quote.pdfPath)) {
      return res.status(404).json({ success: false, message: 'Quotation PDF file not found on server.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Quotation_${quote.quoteNumber}.pdf"`);

    const fileStream = fs.createReadStream(quote.pdfPath);
    fileStream.pipe(res);
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

    // Verify status is Approved or valid (cannot accept expired or already accepted)
    await checkQuoteExpiration(quote);

    if (quote.status === 'Quote Expired') {
      return res.status(400).json({ success: false, message: 'This quotation has expired and cannot be accepted.' });
    }

    if (quote.status === 'Quote Accepted') {
      return res.status(400).json({ success: false, message: 'This quotation has already been accepted.' });
    }

    if (quote.status !== 'Quote Approved') {
      return res.status(400).json({ success: false, message: 'Only approved quotations can be accepted.' });
    }

    // Accept Quote and save state
    quote.status = 'Quote Accepted';
    await quote.save();

    // Link back to RFQ and update its status
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
      }
    }

    // Generate unique B2B Order Number
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `ORD-${year}${month}${day}-${randomSuffix}`;

    // Structure items array
    const qty = parseInt(quote.productDetails?.quantity) || 1;
    const totalAmt = quote.convertedAmount || 0;
    const orderItems = [
      {
        product: quote.productDetails?.productId || null,
        productName: quote.productDetails?.name || 'Coco Substrates',
        quantity: qty,
        pieces: 0,
        unitPrice: qty > 0 ? (totalAmt / qty) : totalAmt,
      }
    ];

    // Setup B2B payment milestones
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
      items: orderItems,
      totalAmount: totalAmt,
      currency: quote.currency || 'USD',
      exchangeRate: quote.exchangeRate || 1.0,
      commercialNotes: quote.commercialNotes || '',
      paymentGateway: 'wire',
      paymentStatus: 'pending',
      orderStatus: 'confirmed',
      shippingAddress: {
        addressLine1: quote.shippingAddress?.addressLine1 || '',
        addressLine2: quote.shippingAddress?.addressLine2 || '',
        city: quote.shippingAddress?.city || '',
        state: quote.shippingAddress?.state || '',
        postalCode: quote.shippingAddress?.postalCode || '',
        country: quote.shippingAddress?.country || '',
      },
      shippingDetails: {
        shippingMethod: 'Sea Freight',
        portOfLoading: 'Chennai, India',
        portOfDischarge: 'Destination Port',
        incoterms: quote.shippingTerms || 'FOB',
        transitTime: '14 Days',
        containerType: quote.containerDetails?.containerSize || '20 FT',
      },
      invoiceUrl: quote.pdfUrl || '',
      paymentMilestones: paymentMilestones,
    });

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
