import mongoose from 'mongoose';

const ShippingOrderSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', default: null },
    destinationCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    shippingMethod: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingMethod', default: null },
    containerType: { type: String, enum: ['20FT FCL', '40FT FCL', 'LCL', null], default: null },
    shippingCost: { type: Number, default: 0 },
    containerCost: { type: Number, default: 0 },
    exportCharges: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalShippingCost: { type: Number, default: 0 },
    estimatedDispatchDate: { type: Date, default: null },
    estimatedArrivalDate: { type: Date, default: null },
    transitTimeDays: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['created', 'confirmed', 'processing', 'packed', 'ready_for_dispatch', 'dispatched', 'in_transit', 'arrived_at_port', 'custom_clearance', 'out_for_delivery', 'delivered'],
      default: 'created',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ShippingOrder', ShippingOrderSchema);
