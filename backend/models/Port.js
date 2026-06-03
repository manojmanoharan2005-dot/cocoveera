/**
 * File: backend/models/Port.js
 * Purpose: Defines the database schema and model for Port.
 */
import mongoose from 'mongoose';

const PortSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

PortSchema.index({ country: 1, status: 1 });

export default mongoose.model('Port', PortSchema);
