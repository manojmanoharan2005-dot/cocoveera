import mongoose from 'mongoose';

const ExportChargeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    feeType: { type: String, enum: ['export_documentation', 'certificate', 'customs_handling', 'inspection', 'other'], default: 'other' },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', default: null },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model('ExportCharge', ExportChargeSchema);
