/**
 * File: backend/models/Document.js
 * Purpose: Defines database schema for tracking generated export documents.
 */
import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
    },
    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    }, // e.g., "Official Quotation", "Proforma Invoice", "Packing List"
    type: {
      type: String,
      required: true,
      enum: [
        'quotationPdf',
        'proformaInvoicePdf',
        'commercialInvoicePdf',
        'packingListPdf',
        'certificateOfOriginPdf',
        'billOfLadingPdf',
        'qualityReportPdf',
        'loadingReportPdf',
        'phytosanitaryPdf',
        'receiptPdf',
        'fumigationPdf',
        'weightPdf',
        'inspectionPdf',
        'exportDeclarationPdf',
      ],
    },
    url: {
      type: String,
      default: '',
    }, // Cloudinary secure URL
    publicId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Available', 'Pending'],
      default: 'Pending',
    },
    generatedBy: {
      type: String,
      default: 'Cocoveera System',
    },
    generatedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
DocumentSchema.index({ user: 1 });
DocumentSchema.index({ order: 1 });
DocumentSchema.index({ quote: 1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ type: 1 });

export default mongoose.model('Document', DocumentSchema);
