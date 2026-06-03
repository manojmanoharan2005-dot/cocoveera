/**
 * File: backend/models/ContainerCharge.js
 * Purpose: Defines the database schema and model for ContainerCharge.
 */
import mongoose from 'mongoose';

const ContainerChargeSchema = new mongoose.Schema(
  {
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    destinationCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    containerType: { type: String, enum: ['20FT FCL', '40FT FCL', 'LCL'], required: true },
    baseFreightCost: { type: Number, required: true, default: 0 },
    portHandlingCharges: { type: Number, required: true, default: 0 },
    documentationCharges: { type: Number, required: true, default: 0 },
    customClearanceCharges: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

ContainerChargeSchema.index({ country: 1, destinationCountry: 1, containerType: 1 }, { unique: true });

export default mongoose.model('ContainerCharge', ContainerChargeSchema);
