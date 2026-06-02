import mongoose from 'mongoose';

const ShippingZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    originCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    destinationCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    states: [{ type: mongoose.Schema.Types.ObjectId, ref: 'State' }],
    ports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Port' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

ShippingZoneSchema.index({ originCountry: 1, destinationCountry: 1 }, { unique: true });

export default mongoose.model('ShippingZone', ShippingZoneSchema);
