/**
 * File: backend/models/User.js
 * Purpose: Defines the database schema and model for User.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'manager', 'support'],
      default: 'user',
    },
    adminRole: {
      type: String,
      enum: ['super_admin', 'manager', 'support', null],
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    country: {
      type: String,
      default: null,
    },
    countryCode: {
      type: String,
      default: null,
    },
    currency: {
      type: String,
      default: null,
    },
    companyName: {
      type: String,
      default: 'N/A',
    },
    profileImage: {
      type: String,
      default: null,
    },
    defaultShippingAddress: {
      addressLine1: { type: String, default: '' },
      addressLine2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: '' }
    },
    addresses: [
      {
        name: String,
        company: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        isDefault: { type: Boolean, default: false }
      }
    ],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 }
      }
    ],
    wishlist: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
    ],
    otpCode: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    failedKeyAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    sessions: [
      {
        sessionId: String,
        ip: String,
        browser: String,
        device: String,
        lastActive: Date
      }
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  if (this.email === 'coirsystemadmin@gmail.com') {
    this.role = 'admin';
  } else {
    this.role = 'user';
  }

  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
