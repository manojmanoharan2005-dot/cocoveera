import mongoose from 'mongoose';

const TestingOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestingPackage',
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Payment Pending', 'Completed', 'Failed'],
      default: 'Payment Pending',
    },
    testingStatus: {
      type: String,
      enum: ['Payment Pending', 'Testing Requested', 'In Progress', 'Completed', 'Report Available'],
      default: 'Payment Pending',
    },
    reportUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('TestingOrder', TestingOrderSchema);
