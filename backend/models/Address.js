import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addressLine1: {
      type: String,
      required: [true, 'Please add address line 1'],
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
    },
    state: {
      type: String,
      required: [true, 'Please add a state'],
    },
    postalCode: {
      type: String,
      required: [true, 'Please add a postal code'],
    },
    country: {
      type: String,
      required: [true, 'Please add a country'],
    },
    phone: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['billing', 'shipping', 'both'],
      default: 'both',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Address', AddressSchema);
