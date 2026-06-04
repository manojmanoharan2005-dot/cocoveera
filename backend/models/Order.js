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
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
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
      enum: ['pending', 'confirmed', 'production', 'packed', 'loaded', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
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
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String, // Legacy
      zipCode: String,
    },
    trackingNumber: {
      type: String,
      default: null,
    },
    invoiceUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Order', OrderSchema);
