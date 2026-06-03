/**
 * File: backend/models/Payment.js
 * Purpose: Defines the database schema and model for Payment.
 */
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add a payment amount'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'refund_requested'],
      default: 'pending',
    },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'stripe', 'razorpay', 'mock', 'other'],
      required: [true, 'Please add a payment method'],
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    refundReason: {
      type: String,
    },
    refundRequestedAt: { type: Date },
    refundDecisionAt: { type: Date },
    refundDecisionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
    receiptUrl: {
      type: String,
    },
    refunds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Refund',
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Payment', PaymentSchema);
