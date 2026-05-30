import mongoose from 'mongoose';

const ContainerSchema = new mongoose.Schema(
  {
    containerNumber: {
      type: String,
      required: true,
      unique: true,
    },
    containerType: {
      type: String,
      enum: ['20FT', '40FT'],
      required: true,
    },
    capacity: {
      type: Number,
      required: true, // in MT
    },
    currentLoad: {
      type: Number,
      default: 0, // in MT
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
      },
    ],
    destination: {
      type: String,
      default: null,
    },
    eta: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['preparing', 'loaded', 'at_port', 'exported', 'delivered'],
      default: 'preparing',
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
    departureDate: {
      type: Date,
      default: null,
    },
    deliveryDate: {
      type: Date,
      default: null,
    },
    trackingHistory: [
      {
        status: String,
        location: String,
        date: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Container', ContainerSchema);
