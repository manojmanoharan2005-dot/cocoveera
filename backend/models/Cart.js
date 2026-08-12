/**
 * File: backend/models/Cart.js
 * Purpose: MongoDB Schema and Model for User Container Shopping Cart.
 */
import mongoose from 'mongoose';

const CartItemProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
}, { _id: false });

const CompletedContainerSchema = new mongoose.Schema({
  containerNumber: {
    type: Number,
    required: true,
  },
  containerType: {
    type: String,
    enum: ['20FT', '40FT'],
    default: '20FT',
  },
  totalLoad: {
    type: Number,
    required: true,
    default: 1.00,
  },
  items: [CartItemProductSchema],
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const CartItemSchema = new mongoose.Schema({
  mainProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  containerType: {
    type: String,
    enum: ['20FT', '40FT'],
    default: '20FT',
  },
  completedContainers: [CompletedContainerSchema],
  activeContainer: {
    containerType: { type: String, default: '20FT' },
    totalLoad: { type: Number, default: 0 },
    items: [CartItemProductSchema],
  },
  extraItems: [CartItemProductSchema],
  mainQuantity: {
    type: Number,
    default: 0,
  },
  totalContainers: {
    type: Number,
    required: true,
    default: 1,
  },
  configurationSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  items: [CartItemSchema],
}, { timestamps: true });

const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);
export default Cart;
