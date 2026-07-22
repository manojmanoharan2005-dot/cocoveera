/**
 * File: backend/controllers/quoteRequestController.js
 * Purpose: Handles the business logic and request processing for Quote Requests.
 */
import QuoteRequest from '../models/QuoteRequest.js';
import Product from '../models/Product.js';
import Quote from '../models/Quote.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import {
  sendAdminQuoteRequestEmail,
  sendRFQApprovalEmail,
  sendRFQRejectionEmail,
  sendRFQInfoRequestedEmail,
} from '../utils/mailer.js';

// @desc    Submit a quote request (RFQ)
// @route   POST /api/quote-requests
// @access  Public
export const submitQuoteRequest = async (req, res) => {
  try {
    const {
      category,
      product: productId,
      requirementNote,
      containerSize,
      expectedDeliveryDate,
      companyName,
      contactPerson,
      email,
      phone,
      country,
      address,
      quantity,
      shippingAddress,
    } = req.body;

    // Validate structured shipping address
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping Address section is required.' });
    }

    const { addressLine1, addressLine2, city, state, postalCode, country: shippingCountry } = shippingAddress;
    if (!addressLine1 || !city || !state || !postalCode || !shippingCountry) {
      return res.status(400).json({
        success: false,
        message: 'Shipping Address is incomplete. Address Line 1, City, State/Province, Postal Code, and Country are required.',
      });
    }

    const productObj = await Product.findById(productId);
    if (!productObj) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Map address string for legacy admin fields compatibility
    const compiledLegacyAddress = `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${city}, ${state}, ${postalCode}`;

    const quoteRequest = await QuoteRequest.create({
      category,
      product: productId,
      requirementNote,
      containerSize,
      expectedDeliveryDate: expectedDeliveryDate || null,
      companyName: companyName || '',
      contactPerson,
      email,
      phone,
      country: shippingCountry || country,
      address: compiledLegacyAddress || address || '',
      shippingAddress: {
        addressLine1,
        addressLine2: addressLine2 || '',
        city,
        state,
        postalCode,
        country: shippingCountry,
      },
      quantity: quantity || '',
      status: 'NEW',
    });

    // Create corresponding Quote
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded.id;
      } catch (err) {
        // Ignore JWT verification errors for public route
      }
    }
    
    if (!userId && email) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        userId = user._id;
      }
    }

    // Automatically update Customer profile default shipping address if it differs
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        const currentAddr = user.defaultShippingAddress || {};
        const isDifferent =
          currentAddr.addressLine1 !== addressLine1 ||
          currentAddr.addressLine2 !== (addressLine2 || '') ||
          currentAddr.city !== city ||
          currentAddr.state !== state ||
          currentAddr.postalCode !== postalCode ||
          currentAddr.country !== shippingCountry;

        if (isDifferent) {
          user.defaultShippingAddress = {
            addressLine1,
            addressLine2: addressLine2 || '',
            city,
            state,
            postalCode,
            country: shippingCountry,
          };
          await user.save();
        }
      }
    }

    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const quoteNumber = `QT-${year}${month}${day}-${randomSuffix}`;

    await Quote.create({
      quoteNumber,
      rfq: quoteRequest._id,
      user: userId || null,
      email: email ? email.toLowerCase() : '',
      status: 'RFQ Submitted',
      quoteDate: new Date(),
      productDetails: {
        productId: productId,
        name: productObj.name,
        quantity: quantity || '',
        unitType: 'Tons',
        specifications: {
          ph: '',
          ec: '',
          moisture: '',
          notes: requirementNote || '',
        },
      },
      containerDetails: {
        containerSize: containerSize || '20 FT',
        quantity: 1,
      },
      shippingAddress: {
        addressLine1,
        addressLine2: addressLine2 || '',
        city,
        state,
        postalCode,
        country: shippingCountry,
      },
      currency: 'USD',
      exchangeRate: 83.33,
      convertedAmount: 0,
      originalInrAmount: 0,
      shippingTerms: '',
      estimatedProductionTime: '',
      commercialNotes: requirementNote || '',
    });

    // Send email to admin
    try {
      await sendAdminQuoteRequestEmail({
        category,
        productName: productObj.name,
        requirementNote,
        containerSize,
        expectedDeliveryDate: expectedDeliveryDate || null,
        companyName,
        contactPerson,
        email,
        phone,
        country,
        address: address || '',
        quantity: quantity || '',
        createdAt: quoteRequest.createdAt,
      });
    } catch (mailErr) {
      console.error('Failed to send admin notification email:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Your Quote Request has been submitted successfully.',
      data: quoteRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all quote requests (Admin only)
// @route   GET /api/admin/quote-requests
// @access  Private/Admin
export const getAdminQuoteRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, country, product, date } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

    // Apply Search (Contact Person, Company Name, Email)
    if (search) {
      query.$or = [
        { contactPerson: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Apply Filters
    if (status) {
      query.status = status;
    }
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }
    if (product) {
      query.product = product;
    }
    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const total = await QuoteRequest.countDocuments(query);
    const quoteRequests = await QuoteRequest.find(query)
      .populate('product', 'name category images packageSize')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: quoteRequests,
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

// @desc    Get single quote request (Admin only)
// @route   GET /api/admin/quote-requests/:id
// @access  Private/Admin
export const getAdminQuoteRequestById = async (req, res) => {
  try {
    const quoteRequest = await QuoteRequest.findById(req.params.id)
      .populate('product', 'name category images packageSize description');

    if (!quoteRequest) {
      return res.status(404).json({ success: false, message: 'Quote Request not found' });
    }

    res.status(200).json({ success: true, data: quoteRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update quote request status (Admin only)
// @route   PATCH /api/admin/quote-requests/:id
// @access  Private/Admin
export const updateQuoteRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['NEW', 'CONTACTED', 'QUOTED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const quoteRequest = await QuoteRequest.findById(req.params.id);
    if (!quoteRequest) {
      return res.status(404).json({ success: false, message: 'Quote Request not found' });
    }

    quoteRequest.status = status;
    await quoteRequest.save();

    // Update matching Quote status if state transitions
    let quoteStatus = 'Pending Review';
    if (status === 'CLOSED') {
      quoteStatus = 'Quote Rejected';
    } else if (status === 'NEW') {
      quoteStatus = 'RFQ Submitted';
    }
    await Quote.updateOne({ rfq: quoteRequest._id }, { status: quoteStatus });

    res.status(200).json({
      success: true,
      message: 'Status updated successfully.',
      data: quoteRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete quote request (Admin only)
// @route   DELETE /api/admin/quote-requests/:id
// @access  Private/Admin
export const deleteQuoteRequest = async (req, res) => {
  try {
    const quoteRequest = await QuoteRequest.findById(req.params.id);
    if (!quoteRequest) {
      return res.status(404).json({ success: false, message: 'Quote Request not found' });
    }

    await quoteRequest.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quote Request deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve quote request & send quotation email with attachment (Admin only)
// @route   POST /api/rfq/:id/approve or /api/admin/quote-requests/:id/approve
// @access  Private/Admin
export const approveQuoteRequest = async (req, res) => {
  try {
    const {
      price,
      currency = 'USD',
      shippingTerms = 'FOB',
      validity = 15,
      deliveryDate,
      subject,
      emailBody,
      additionalNotes,
      pdfBase64,
      pdfName,
    } = req.body;

    if (!price || isNaN(price)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid price.' });
    }

    const quoteRequest = await QuoteRequest.findById(req.params.id).populate('product', 'name category');
    if (!quoteRequest) {
      return res.status(404).json({ success: false, message: 'Quote Request not found.' });
    }

    // Construct PDF Attachment if supplied via file upload (multer) or base64
    let pdfAttachment = null;
    let pdfUrl = quoteRequest.quotationPDF || '';

    if (req.file) {
      pdfAttachment = {
        name: req.file.originalname || `Quotation_${quoteRequest._id.toString().slice(-6).toUpperCase()}.pdf`,
        content: req.file.buffer.toString('base64'),
      };
    } else if (pdfBase64) {
      pdfAttachment = {
        name: pdfName || `Quotation_${quoteRequest._id.toString().slice(-6).toUpperCase()}.pdf`,
        content: pdfBase64.includes('base64,') ? pdfBase64.split('base64,')[1] : pdfBase64,
      };
    }

    // Prepare email data payload
    const approvalData = {
      subject: subject || `Quote Request Approved - Cocoveera Export (Ref: #${quoteRequest._id.toString().slice(-6).toUpperCase()})`,
      category: quoteRequest.category,
      productName: quoteRequest.product?.name || 'Coco Substrates',
      containerSize: quoteRequest.containerSize,
      price,
      currency,
      shippingTerms,
      validity: Number(validity) || 15,
      deliveryDate: deliveryDate || (quoteRequest.expectedDeliveryDate ? new Date(quoteRequest.expectedDeliveryDate).toLocaleDateString() : 'As agreed'),
      emailBody,
      additionalNotes,
    };

    // REQUIREMENT 12: ROLLBACK TRANSACTION IF EMAIL DISPATCH FAILS
    try {
      await sendRFQApprovalEmail(quoteRequest.email, quoteRequest.contactPerson, approvalData, pdfAttachment);
    } catch (mailError) {
      console.error('Email dispatch failed during RFQ approval:', mailError);
      return res.status(500).json({
        success: false,
        message: `Failed to send approval email via Brevo: ${mailError.message || 'Email service error'}. Status was not updated.`,
      });
    }

    // Email dispatch succeeded -> update Database state
    quoteRequest.status = 'APPROVED';
    quoteRequest.approvedBy = req.user?._id;
    quoteRequest.approvedAt = new Date();
    quoteRequest.price = Number(price);
    quoteRequest.currency = currency;
    quoteRequest.shippingTerms = shippingTerms;
    quoteRequest.validity = Number(validity) || 15;
    quoteRequest.deliveryDate = deliveryDate || '';
    quoteRequest.additionalNotes = additionalNotes || '';
    quoteRequest.emailSent = true;
    quoteRequest.emailSentAt = new Date();
    quoteRequest.emailStatus = 'delivered';

    // Push timeline log
    quoteRequest.timeline.push({
      status: 'APPROVED',
      title: 'Approved by Admin',
      description: `Quote approved at ${currency} ${price} (${shippingTerms}). Official quotation email sent.`,
      timestamp: new Date(),
      updatedBy: req.user?._id,
    });

    await quoteRequest.save();

    // 1. Save PDF file if attached
    let pdfFilePath = '';
    let savedPdfName = '';
    if (pdfAttachment && pdfAttachment.content) {
      try {
        const uploadDir = path.join('uploads', 'quotes');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        savedPdfName = `quote_${quoteRequest._id}_${Date.now()}.pdf`;
        pdfFilePath = path.join(uploadDir, savedPdfName);
        fs.writeFileSync(pdfFilePath, Buffer.from(pdfAttachment.content, 'base64'));
      } catch (pdfErr) {
        console.error('Failed to save PDF on server:', pdfErr);
      }
    }

    // 2. Find or create Quote in database
    let quote = await Quote.findOne({ rfq: quoteRequest._id });
    if (!quote) {
      // Find User by email
      const user = await User.findOne({ email: quoteRequest.email.toLowerCase() });
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const day = String(new Date().getDate()).padStart(2, '0');
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const quoteNumber = `QT-${year}${month}${day}-${randomSuffix}`;
      
      quote = new Quote({
        quoteNumber,
        rfq: quoteRequest._id,
        user: user ? user._id : null,
        email: quoteRequest.email.toLowerCase(),
        productDetails: {
          productId: quoteRequest.product,
          name: quoteRequest.product?.name || 'Coco Substrates',
          quantity: quoteRequest.quantity || '',
          unitType: 'Tons',
          specifications: {
            ph: '',
            ec: '',
            moisture: '',
            notes: quoteRequest.requirementNote || '',
          },
        },
        containerDetails: {
          containerSize: quoteRequest.containerSize || '20 FT',
          quantity: 1,
        },
      });
    }

    // 3. Calculate INR base values
    const rates = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094 };
    const rateToInr = 1 / (rates[currency] || 1);
    const calculatedInrAmount = Number(price) * rateToInr;

    quote.status = 'Quote Approved';
    quote.quoteDate = new Date();
    quote.validUntil = new Date(Date.now() + (Number(validity) || 15) * 24 * 60 * 60 * 1000);
    quote.currency = currency;
    quote.exchangeRate = rateToInr;
    quote.convertedAmount = Number(price);
    quote.originalInrAmount = calculatedInrAmount;
    quote.shippingTerms = shippingTerms;
    quote.estimatedProductionTime = deliveryDate || '';
    quote.commercialNotes = additionalNotes || '';
    if (quoteRequest.shippingAddress) {
      quote.shippingAddress = {
        addressLine1: quoteRequest.shippingAddress.addressLine1 || '',
        addressLine2: quoteRequest.shippingAddress.addressLine2 || '',
        city: quoteRequest.shippingAddress.city || '',
        state: quoteRequest.shippingAddress.state || '',
        postalCode: quoteRequest.shippingAddress.postalCode || '',
        country: quoteRequest.shippingAddress.country || '',
      };
    }

    if (pdfFilePath) {
      quote.pdfPath = pdfFilePath;
      quote.pdfUrl = `/api/quotes/${quote._id}/view-pdf`;
    }

    await quote.save();

    res.status(200).json({
      success: true,
      message: 'Quote approved successfully and email sent.',
      data: quoteRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject quote request (Admin only)
// @route   POST /api/rfq/:id/reject or /api/admin/quote-requests/:id/reject
// @access  Private/Admin
export const rejectQuoteRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const quoteRequest = await QuoteRequest.findById(req.params.id).populate('product', 'name');

    if (!quoteRequest) {
      return res.status(404).json({ success: false, message: 'Quote Request not found.' });
    }

    // Attempt to send rejection notice
    try {
      await sendRFQRejectionEmail(quoteRequest.email, quoteRequest.contactPerson, quoteRequest.product?.name || 'Coco Substrates', reason);
    } catch (mailError) {
      console.warn('Rejection email error:', mailError.message);
    }

    quoteRequest.status = 'REJECTED';
    quoteRequest.timeline.push({
      status: 'REJECTED',
      title: 'Rejected by Admin',
      description: reason || 'Quote request was declined by export team.',
      timestamp: new Date(),
      updatedBy: req.user?._id,
    });

    await Quote.updateOne({ rfq: quoteRequest._id }, { status: 'Quote Rejected' });
    await quoteRequest.save();

    res.status(200).json({
      success: true,
      message: 'Quote request has been rejected.',
      data: quoteRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request more info from customer (Admin only)
// @route   POST /api/rfq/:id/request-info or /api/admin/quote-requests/:id/request-info
// @access  Private/Admin
export const requestInfoQuoteRequest = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message detailing required information.' });
    }

    const quoteRequest = await QuoteRequest.findById(req.params.id).populate('product', 'name');
    if (!quoteRequest) {
      return res.status(404).json({ success: false, message: 'Quote Request not found.' });
    }

    // Send email requesting info
    try {
      await sendRFQInfoRequestedEmail(quoteRequest.email, quoteRequest.contactPerson, quoteRequest.product?.name || 'Coco Substrates', message);
    } catch (mailError) {
      return res.status(500).json({ success: false, message: `Failed to send email: ${mailError.message}` });
    }

    quoteRequest.status = 'INFO_REQUESTED';
    quoteRequest.timeline.push({
      status: 'INFO_REQUESTED',
      title: 'Information Requested',
      description: message,
      timestamp: new Date(),
      updatedBy: req.user?._id,
    });

    await Quote.updateOne({ rfq: quoteRequest._id }, { status: 'Pending Review' });
    await quoteRequest.save();

    res.status(200).json({
      success: true,
      message: 'Information request sent to customer.',
      data: quoteRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Brevo Webhook listener for email logs (Delivered, Opened, Replied, Failed)
// @route   POST /api/rfq/webhook/brevo or /api/quote-requests/webhook/brevo
// @access  Public (Webhook)
export const handleBrevoWebhook = async (req, res) => {
  try {
    const eventData = req.body;
    const event = eventData.event;
    const email = eventData.email;

    if (!email) {
      return res.status(200).json({ success: true, message: 'No email in webhook payload' });
    }

    // Find latest RFQ for this customer email
    const quoteRequest = await QuoteRequest.findOne({ email }).sort({ createdAt: -1 });
    if (!quoteRequest) {
      return res.status(200).json({ success: true, message: 'No matching RFQ found' });
    }

    if (event === 'delivered') {
      quoteRequest.emailStatus = 'delivered';
      quoteRequest.timeline.push({
        status: 'MAIL_SENT',
        title: 'Mail Delivered',
        description: `Quotation email successfully delivered to ${email}.`,
        timestamp: new Date(),
      });
    } else if (event === 'opened' || event === 'unique_opened') {
      quoteRequest.emailStatus = 'opened';
      quoteRequest.timeline.push({
        status: 'MAIL_SENT',
        title: 'Mail Opened',
        description: `Customer opened quotation email.`,
        timestamp: new Date(),
      });
    } else if (event === 'reply' || event === 'inbound_email') {
      quoteRequest.emailStatus = 'replied';
      quoteRequest.status = 'CUSTOMER_REPLIED';
      quoteRequest.customerReply = eventData.subject || 'Customer replied to quote.';
      quoteRequest.replyDate = new Date();
      quoteRequest.timeline.push({
        status: 'CUSTOMER_REPLIED',
        title: 'Customer Replied',
        description: `Customer replied to email. Target admin: coirsystemadmin@gmail.com`,
        timestamp: new Date(),
      });
    } else if (event === 'hard_bounce' || event === 'soft_bounce' || event === 'error') {
      quoteRequest.emailStatus = 'failed';
      quoteRequest.timeline.push({
        status: 'MAIL_SENT',
        title: 'Mail Delivery Failed',
        description: `Email delivery to ${email} failed (${event}).`,
        timestamp: new Date(),
      });
    }

    await quoteRequest.save();

    res.status(200).json({ success: true, message: 'Webhook event processed' });
  } catch (error) {
    console.error('Brevo Webhook Error:', error);
    res.status(200).json({ success: false, message: error.message }); // Always 200 to prevent Brevo webhook retries storm
  }
};
