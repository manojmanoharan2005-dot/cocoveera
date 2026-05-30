import mongoose from 'mongoose';

const TestingReportSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    productName: {
      type: String,
      required: true,
    },
    batchNumber: {
      type: String,
      required: true,
      unique: true,
    },
    ecValue: {
      type: String,
      required: true, // e.g. "0.35 mS/cm"
    },
    phValue: {
      type: String,
      required: true, // e.g. "6.1"
    },
    moisturePercent: {
      type: String,
      required: true, // e.g. "14.2%"
    },
    compressionRatio: {
      type: String,
      required: true, // e.g. "5:1"
    },
    fiberContent: {
      type: String,
      required: true, // e.g. "4.5%"
    },
    testerName: {
      type: String,
      required: true,
    },
    testDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reportPdfUrl: {
      type: String,
      default: '',
    },
    remarks: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvalDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('TestingReport', TestingReportSchema);
