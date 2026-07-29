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
  sendQuoteRequestEmail,
} from '../utils/mailer.js';
import { formatDateFriendly } from '../utils/dateFormatter.js';
import { generateAndStoreDocument } from '../utils/documentService.js';

// @desc    Submit a quote request (RFQ)
// @route   POST /api/quote-requests
// @access  Public
export const submitQuoteRequest = async (req, res) => {
  try {
    const {
      category,
      product: productId,
      requirementNote,
      containerSize: initialContainerSize,
      expectedDeliveryDate,
      companyName,
      contactPerson,
      email,
      phone,
      country,
      address,
      quantity,
      shippingAddress,
      shippingTerms,
      preferredPort,
      attachments,
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

    let products = req.body.products;
    if (!products || !Array.isArray(products) || products.length === 0) {
      if (productId) {
        const productObj = await Product.findById(productId);
        if (productObj) {
          products = [{
            product: productObj._id,
            productName: productObj.name,
            categoryName: productObj.category || category || 'Coco Substrates',
            quantity: parseFloat(quantity) || 1.00
          }];
        }
      }
    }

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one product must be selected.' });
    }

    let containerSize = initialContainerSize || req.body.containerType;
    if (containerSize) {
      if (containerSize.includes('40')) {
        containerSize = '40 FT';
      } else {
        containerSize = '20 FT';
      }
    } else {
      containerSize = '20 FT';
    }

    const totalContainers = products.reduce((acc, p) => acc + (parseFloat(p.quantity) || 0), 0);
    const quantityStr = `${totalContainers.toFixed(2)} Containers`;
    const categoryFallback = products[0]?.categoryName || category || 'Coco Substrates';
    const productFallback = products[0]?.product || productId || null;

    if (email && productFallback) {
      const activeDuplicate = await QuoteRequest.findOne({
        email: email.toLowerCase(),
        status: { $in: ['NEW', 'APPROVED', 'INFO_REQUESTED'] },
        $or: [
          { product: productFallback },
          { 'products.product': productFallback }
        ]
      });

      if (activeDuplicate) {
        return res.status(409).json({
          success: false,
          message: 'A quote request for this product is already in progress for your account.',
        });
      }
    }

    // Map address string for legacy admin fields compatibility
    const compiledLegacyAddress = `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${city}, ${state}, ${postalCode}`;

    const quoteRequest = await QuoteRequest.create({
      category: categoryFallback,
      product: productFallback,
      products,
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
      shippingTerms: shippingTerms || '',
      preferredPort: preferredPort || '',
      attachments: Array.isArray(attachments) ? attachments : [],
      quantity: quantityStr,
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
        productId: productFallback,
        name: products[0]?.productName || 'Coco Substrates',
        quantity: quantityStr,
        unitType: 'Containers',
        specifications: {
          ph: '',
          ec: '',
          moisture: '',
          notes: requirementNote || '',
        },
      },
      products: (products || []).map(p => ({
        product: p.product?._id || p.product || p.productId || productFallback,
        productName: p.productName || p.name || 'Coco Substrate Product',
        category: typeof p.category === 'string' && p.category ? p.category : (p.categoryName || categoryFallback || 'General Coir Products'),
        categoryName: p.categoryName || (typeof p.category === 'string' ? p.category : categoryFallback || 'General Coir Products'),
        quantity: Number(p.quantity) || 1,
        unit: p.unit || 'Containers',
        dimensions: p.dimensions || '',
        weight: Number(p.weight) || 0,
        volume: Number(p.volume) || 0,
        unitPrice: Number(p.unitPrice) || 0,
        pieces: Number(p.pieces) || 0,
        containerAllocation: Number(p.containerAllocation) || 0,
        discount: Number(p.discount) || 0,
        subtotal: Number(p.subtotal) || 0,
      })),
      containerDetails: {
        containerSize: containerSize || '20 FT',
        quantity: totalContainers || 1,
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
        category: categoryFallback,
        productName: products[0]?.productName || 'Coco Substrates',
        products,
        requirementNote,
        containerSize,
        expectedDeliveryDate: expectedDeliveryDate || null,
        companyName,
        contactPerson,
        email,
        phone,
        country,
        address: address || '',
        quantity: quantityStr,
        createdAt: quoteRequest.createdAt,
      });
    } catch (mailErr) {
      console.error('Failed to send admin notification email:', mailErr.message);
    }

    // Send RFQ confirmation email to customer
    try {
      await sendQuoteRequestEmail(email, contactPerson, {
        referenceId: quoteRequest._id.toString().slice(-6).toUpperCase(),
        date: new Date(quoteRequest.createdAt).toLocaleDateString(),
        expectedDeliveryDate: expectedDeliveryDate ? formatDateFriendly(expectedDeliveryDate) : 'N/A',
        products,
        containerSize,
        quantity: quantityStr,
        requirementNote,
      });
    } catch (mailErr) {
      console.error('Failed to send customer confirmation email:', mailErr.message);
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
      .populate('products.product', 'name category images packageSize')
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
      .populate('product', 'name category images packageSize description')
      .populate('products.product', 'name category images packageSize description');

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
      additionalNotes,
      
      // Extended fields
      discount = 0,
      freightCharges = 0,
      packingCharges = 0,
      handlingCharges = 0,
      insuranceCharges = 0,
      shippingCharges = 0,
      tax = 0,
      containerCount = 1,
      estimatedWeight = 0,
      estimatedVolume = 0,
      shippingMethod = '',
      originPort = '',
      destinationPort = '',
      incoterms = 'FOB',
      transitTime = '',
      expectedDelivery = '',
      paymentTerms = '',
      quoteValidity = 15,
      productionTime = '',
      grandTotal = 0,
      exchangeRate,
    } = req.body;

    let products = req.body.products;
    if (typeof products === 'string') {
      try {
        products = JSON.parse(products);
      } catch (err) {
        products = [];
      }
    }

    const quoteRequest = await QuoteRequest.findById(req.params.id).populate('product', 'name category');
    if (!quoteRequest) {
      return res.status(404).json({ success: false, message: 'Quote Request not found.' });
    }

    const approvalPrice = Number(grandTotal) || Number(price) || 0;

    // Update quote request in database
    quoteRequest.status = 'APPROVED';
    quoteRequest.approvedBy = req.user?._id;
    quoteRequest.approvedAt = new Date();
    quoteRequest.price = approvalPrice;
    quoteRequest.currency = currency;
    quoteRequest.shippingTerms = incoterms || shippingTerms || 'FOB';
    quoteRequest.validity = Number(validity || quoteValidity) || 15;
    quoteRequest.deliveryDate = expectedDelivery || deliveryDate || '';
    quoteRequest.additionalNotes = additionalNotes || '';
    quoteRequest.emailSent = true;
    quoteRequest.emailSentAt = new Date();
    quoteRequest.emailStatus = 'delivered';

    // Push timeline log
    quoteRequest.timeline.push({
      status: 'APPROVED',
      title: 'Approved by Admin',
      description: `Quote approved at ${currency} ${approvalPrice} (${incoterms || shippingTerms}). Official quotation generated.`,
      timestamp: new Date(),
      updatedBy: req.user?._id,
    });

    await quoteRequest.save();

    // Find or create Quote in database
    let quote = await Quote.findOne({ rfq: quoteRequest._id });
    if (!quote) {
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
          quantity: Number(containerCount) || 1,
        },
      });
    }

    // Save multiple products details with historical string categories
    const rawProducts = (products && products.length > 0) ? products : (quoteRequest.products || []);
    quote.products = rawProducts.map(p => {
      const prodId = p.product?._id || p.product || p.productId || quoteRequest.product?._id || quoteRequest.product;
      const prodName = p.productName || p.name || quoteRequest.product?.name || 'Coco Substrate Product';
      let catStr = 'General Coir Products';
      if (typeof p.category === 'string' && p.category) {
        catStr = p.category;
      } else if (p.category?.name) {
        catStr = p.category.name;
      } else if (p.categoryName) {
        catStr = p.categoryName;
      } else if (quoteRequest.category) {
        catStr = quoteRequest.category;
      }

      return {
        product: prodId,
        productName: prodName,
        category: catStr,
        categoryName: catStr,
        quantity: Number(p.quantity) || 1,
        unit: p.unit || 'Containers',
        dimensions: p.dimensions || '',
        weight: Number(p.weight) || 0,
        volume: Number(p.volume) || 0,
        unitPrice: Number(p.unitPrice) || 0,
        pieces: Number(p.pieces) || 0,
        containerAllocation: Number(p.containerAllocation) || 0,
        discount: Number(p.discount) || 0,
        subtotal: Number(p.subtotal) || 0,
      };
    });

    // Calculate INR base values
    const rates = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094 };
    const rateToInr = exchangeRate ? Number(exchangeRate) : (1 / (rates[currency] || 1));
    const calculatedInrAmount = approvalPrice * rateToInr;

    quote.status = 'Quote Approved';
    quote.quoteDate = new Date();
    quote.validUntil = new Date(Date.now() + (Number(validity || quoteValidity) || 15) * 24 * 60 * 60 * 1000);
    quote.currency = currency;
    quote.exchangeRate = rateToInr;
    quote.convertedAmount = approvalPrice;
    quote.originalInrAmount = calculatedInrAmount;
    
    // Admin editable fields
    quote.discount = Number(discount) || 0;
    quote.freightCharges = Number(freightCharges) || 0;
    quote.packingCharges = Number(packingCharges) || 0;
    quote.handlingCharges = Number(handlingCharges) || 0;
    quote.insuranceCharges = Number(insuranceCharges) || 0;
    quote.shippingCharges = Number(shippingCharges) || 0;
    quote.tax = Number(tax) || 0;
    quote.containerCount = Number(containerCount) || 1;
    quote.estimatedWeight = Number(estimatedWeight) || 0;
    quote.estimatedVolume = Number(estimatedVolume) || 0;
    quote.shippingMethod = shippingMethod || '';
    quote.originPort = originPort || '';
    quote.destinationPort = destinationPort || '';
    quote.incoterms = incoterms || shippingTerms || 'FOB';
    quote.transitTime = transitTime || '';
    quote.expectedDelivery = expectedDelivery || deliveryDate || '';
    quote.paymentTerms = paymentTerms || '';
    quote.quoteValidity = Number(validity || quoteValidity) || 15;
    quote.productionTime = productionTime || '';
    quote.grandTotal = approvalPrice;
    quote.shippingTerms = incoterms || shippingTerms || 'FOB';
    quote.estimatedProductionTime = productionTime || '';
    quote.commercialNotes = additionalNotes || '';

    // Save container details
    quote.containerDetails = {
      containerSize: quoteRequest.containerSize || '20 FT',
      quantity: Number(containerCount) || 1,
    };

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

    await quote.save();

    // Call documentService to automatically generate Official Quotation PDF and upload to Cloudinary + DB
    const docRecord = await generateAndStoreDocument({
      quoteId: quote._id,
      type: 'quotationPdf',
      user: quote.user,
    });

    // Sync URLs to quote
    quote.pdfUrl = docRecord.url;
    await quote.save();

    // Prepare Official_Quotation.pdf attachment for single branded email dispatch
    let pdfAttachment = null;
    try {
      if (quote.pdfPath && fs.existsSync(quote.pdfPath)) {
        const pdfBuffer = fs.readFileSync(quote.pdfPath);
        pdfAttachment = {
          name: 'Official_Quotation.pdf',
          content: pdfBuffer.toString('base64'),
          type: 'application/pdf'
        };
      }
    } catch (attError) {
      console.warn('[quoteRequestController] Could not attach PDF to email:', attError.message);
    }

    // Send single branded "Official Quotation Available" email
    try {
      await sendRFQApprovalEmail(
        quoteRequest.email,
        quoteRequest.contactPerson || quote.user?.name || 'Valued Partner',
        {
          subject: 'Official Quotation Available - Cocoveera Export',
          category: quoteRequest.category,
          productName: quoteRequest.product?.name,
          products: quote.products,
          containerSize: quote.containerDetails?.containerSize,
          price: quote.grandTotal || quote.convertedAmount,
          currency: quote.currency || 'USD',
          shippingTerms: quote.incoterms || quote.shippingTerms || 'FOB',
          validity: quote.quoteValidity || 15,
          deliveryDate: quote.expectedDelivery,
          emailBody: quote.commercialNotes,
          additionalNotes: quote.commercialNotes
        },
        pdfAttachment
      );
    } catch (mailError) {
      console.error('[quoteRequestController] Error sending quotation approval email:', mailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Quote approved successfully, PDF generated and email sent.',
      data: quoteRequest,
    });
  } catch (error) {
    console.error('Quote approval error:', error);
    if (error.name === 'ValidationError') {
      const fieldDetails = Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`).join(', ');
      return res.status(400).json({
        success: false,
        message: `Quote validation failed on fields: ${fieldDetails}`,
        errors: error.errors
      });
    }
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

// @desc    Check if customer has an active RFQ for a product
// @route   GET /api/quote-requests/active-check
// @access  Private
export const checkActiveRFQ = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const email = req.user.email.toLowerCase();

    // Check for NEW, APPROVED, or INFO_REQUESTED quote requests containing this product
    const activeDuplicate = await QuoteRequest.findOne({
      email,
      status: { $in: ['NEW', 'APPROVED', 'INFO_REQUESTED'] },
      $or: [
        { product: productId },
        { 'products.product': productId }
      ]
    });

    res.status(200).json({
      success: true,
      hasActiveRfq: !!activeDuplicate
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
