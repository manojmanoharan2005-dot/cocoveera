import mongoose from 'mongoose';

const RefundSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['full', 'partial', 'shipping_only', 'tax_only', 'product_level'],
      default: 'full',
    },
    status: {
      type: String,
      enum: [
        'requested',
        'pending_validation',
        'approved',
        'initiated',
        'processing',
        'completed',
        'failed',
        'rejected',
      ],
      default: 'requested',
    },
    reason: {
      type: String,
      required: true,
    },
    // Gateway Tracking
    gatewayName: {
      type: String,
      enum: ['stripe', 'razorpay', 'paypal', 'wire', 'mock', 'cod'],
      required: true,
    },
    transactionId: {
      type: String, // Original Payment ID
    },
    refundId: {
      type: String, // Refund ID from Gateway
    },
    processingTime: {
      type: Number, // Time taken to process in milliseconds
    },
    refundDate: {
      type: Date,
    },
    // Failure Handling
    retryCount: {
      type: Number,
      default: 0,
    },
    failureReason: {
      type: String,
    },
    // Wire Transfer Specifics
    bankDetails: {
      accountHolderName: String,
      bankName: String,
      accountNumber: String,
      ifscCode: String, // Or SWIFT
      branchName: String,
    },
    financeApprovalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    transferRefNo: {
      type: String,
    },
    // Audit Logs
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Refund', RefundSchema);
