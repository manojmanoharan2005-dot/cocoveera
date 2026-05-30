import Quote from '../models/Quote.js';
import Product from '../models/Product.js';
import { sendQuoteResponseEmail } from '../utils/mailer.js';

// @desc    Submit a quote request
// @route   POST /api/quotes
// @access  Private
export const submitQuoteRequest = async (req, res) => {
  const { productId, quantity, unitType, ph, ec, moisture, notes, shippingAddress } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const quote = await Quote.create({
      user: req.user.id,
      product: productId,
      quantity,
      unitType: unitType || 'Tons',
      specificationsRequested: { ph, ec, moisture, notes },
      shippingAddress,
    });

    res.status(201).json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's quotes
// @route   GET /api/quotes/myquotes
// @access  Private
export const getMyQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({ user: req.user.id })
      .populate('product', 'name category price images')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
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
      .populate('product', 'name category price')
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
      .populate('product', 'name');

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    quote.pricingProposed = pricingProposed !== undefined ? Number(pricingProposed) : quote.pricingProposed;
    quote.replyMessage = replyMessage || quote.replyMessage;
    quote.status = status || 'replied';

    await quote.save();

    // Trigger Brevo Email notifying user of the proposal details
    await sendQuoteResponseEmail(
      quote.user.email,
      quote.user.name,
      quote.product.name,
      quote.pricingProposed,
      quote.replyMessage
    );

    res.status(200).json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
