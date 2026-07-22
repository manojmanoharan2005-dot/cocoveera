/**
 * File: backend/models/QuoteRequest.js
 * Purpose: Defines the database schema and model for Quote Requests (RFQs).
 */
import mongoose from 'mongoose';

const TimelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: true }
);

const QuoteRequestSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please add a product reference'],
    },
    requirementNote: {
      type: String,
      required: [true, 'Please add requirement notes'],
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    containerSize: {
      type: String,
      required: [true, 'Please select a container size'],
      enum: ['20 FT', '40 FT'],
    },
    quantity: {
      type: String,
      default: '',
    },
    expectedDeliveryDate: {
      type: Date,
      required: false,
    },
    companyName: {
      type: String,
      default: '',
    },
    contactPerson: {
      type: String,
      required: [true, 'Please specify contact person name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone/whatsapp number'],
    },
    country: {
      type: String,
      required: [true, 'Please provide country'],
    },
    address: {
      type: String,
      required: false,
      default: '',
    },
    shippingAddress: {
      addressLine1: { type: String, default: '' },
      addressLine2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: [
        'NEW',
        'PENDING',
        'APPROVED',
        'REJECTED',
        'INFO_REQUESTED',
        'MAIL_SENT',
        'CUSTOMER_REPLIED',
        'NEGOTIATION',
        'CONFIRMED',
        'COMPLETED',
        'CONTACTED',
        'QUOTED',
        'CLOSED',
      ],
      default: 'NEW',
    },
    // Approval & Proposal Data
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    price: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    shippingTerms: {
      type: String,
      enum: ['FOB', 'CIF', 'EXW', ''],
      default: '',
    },
    deliveryDate: {
      type: String,
      default: '',
    },
    validity: {
      type: Number,
      default: 15,
    },
    quotationPDF: {
      type: String,
      default: '',
    },
    additionalNotes: {
      type: String,
      default: '',
    },
    // Email Logs & Status
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    emailStatus: {
      type: String,
      enum: ['none', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'failed'],
      default: 'none',
    },
    customerReply: {
      type: String,
      default: '',
    },
    replyDate: {
      type: Date,
    },
    // Timeline Audit Log
    timeline: [TimelineEventSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying
QuoteRequestSchema.index({ status: 1 });
QuoteRequestSchema.index({ createdAt: -1 });

export default mongoose.model('QuoteRequest', QuoteRequestSchema);
