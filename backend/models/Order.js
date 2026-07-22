/**
 * File: backend/models/Order.js
 * Purpose: Defines the database schema and model for Order.
 */
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
      default: null,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    exchangeRate: {
      type: Number,
      default: 1.0,
    },
    commercialNotes: {
      type: String,
      default: '',
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: String,
        quantity: {
          type: Number,
          required: true,
        },
        pieces: {
          type: Number,
          default: 0,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingCharge: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'Awaiting Initial Payment', 'partially_paid'],
      default: 'pending',
    },
    paymentGateway: {
      type: String,
      enum: ['stripe', 'razorpay', 'paypal', 'mock', 'cod', 'wire'],
      required: true,
    },
    paymentId: {
      type: String,
      default: '',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'loaded', 'shipped', 'delivered', 'cancelled', 'Payment Pending'],
      default: 'pending',
    },
    paymentProgress: {
      type: Number,
      default: 0,
    },
    refunds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Refund',
      }
    ],
    refundedAmount: {
      type: Number,
      default: 0,
    },
    paymentMilestones: [
      {
        milestoneType: { type: String, required: true },
        percentage: { type: Number, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Paid', 'Locked'], default: 'Locked' },
        dueDate: { type: Date },
        paidAt: { type: Date },
        paymentId: { type: String, default: '' },
      }
    ],
    totalContainers: {
      type: Number,
      default: 0,
    },
    totalPieces: {
      type: Number,
      default: 0,
    },
    totalWeight: {
      type: Number,
      default: 0,
    },
    totalVolume: {
      type: Number,
      default: 0,
    },
    recommendedContainer: {
      type: String,
      default: null,
    },
    assignedContainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Container',
      default: null,
    },
    containerStatus: {
      type: String,
      default: null,
    },
    shippingAddress: {
      addressLine: String, // Legacy
      street: String, // Legacy
      zipCode: String, // Legacy
      addressLine1: { type: String, default: '' },
      addressLine2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: '' }
    },
    shippingDetails: {
      shippingMethod: String,
      portOfLoading: String,
      portOfDischarge: String,
      incoterms: { type: String, default: 'FOB' },
      transitTime: String,
      containerType: String,
    },
    trackingNumber: {
      type: String,
      default: null,
    },
    invoiceUrl: {
      type: String,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    shippingDate: {
      type: Date,
      default: null,
    },
    estimatedDeliveryDate: {
      type: Date,
      default: null,
    },
    cancellationCustomReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying
OrderSchema.index({ user: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Order', OrderSchema);
