/**
 * File: backend/models/Quote.js
 * Purpose: Defines the database schema and model for Quotations.
 */
import mongoose from 'mongoose';

const RevisionRequestSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
  },
  { _id: true }
);

const QuoteSchema = new mongoose.Schema(
  {
    quoteNumber: {
      type: String,
      required: true,
      unique: true,
    },
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuoteRequest',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'RFQ Submitted',
        'Pending Review',
        'Quote Approved',
        'Quote Rejected',
        'Quote Expired',
        'Quote Accepted',
        'Rejected by Customer',
      ],
      default: 'RFQ Submitted',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    quoteDate: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    exchangeRate: {
      type: Number,
      default: 83.33,
    },
    originalInrAmount: {
      type: Number,
      default: 0,
    },
    convertedAmount: {
      type: Number,
      default: 0,
    },
    shippingTerms: {
      type: String,
      default: '',
    },
    estimatedProductionTime: {
      type: String,
      default: '',
    },
    commercialNotes: {
      type: String,
      default: '',
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    pdfPath: {
      type: String,
      default: '',
    },
    productDetails: {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      name: String,
      quantity: String,
      unitType: String,
      specifications: {
        ph: String,
        ec: String,
        moisture: String,
        notes: String,
      },
    },
    containerDetails: {
      containerSize: {
        type: String,
        enum: ['20 FT', '40 FT', ''],
        default: '',
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
    shippingAddress: {
      addressLine1: { type: String, default: '' },
      addressLine2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: '' }
    },
    revisionRequests: [RevisionRequestSchema],
  },
  {
    timestamps: true,
  }
);

// Indexing for faster search/filter
QuoteSchema.index({ user: 1 });
QuoteSchema.index({ status: 1 });
QuoteSchema.index({ quoteNumber: 1 });
QuoteSchema.index({ email: 1 });
QuoteSchema.index({ createdAt: -1 });
QuoteSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Quote', QuoteSchema);
