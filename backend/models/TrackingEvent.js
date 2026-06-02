import mongoose from 'mongoose';

const TrackingEventSchema = new mongoose.Schema(
  {
    shippingOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingOrder', required: true },
    status: { type: String, required: true },
    location: { type: String, default: '' },
    notes: { type: String, default: '' },
    occurredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TrackingEventSchema.index({ shippingOrder: 1, occurredAt: -1 });

export default mongoose.model('TrackingEvent', TrackingEventSchema);
