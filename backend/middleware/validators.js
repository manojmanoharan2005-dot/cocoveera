/**
 * File: backend/middleware/validators.js
 * Purpose: Provides middleware functions for request interception and validation.
 */
import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('name').isLength({ min: 2 }).withMessage('Name too short'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

export const validateLogin = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').exists().withMessage('Password required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

export const validateRefundRequest = [
  body('paymentId').isMongoId().withMessage('Invalid payment id'),
  body('reason').isLength({ min: 10 }).withMessage('Provide a longer reason'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

export const validateOrder = [
  body('items').optional().isArray().withMessage('Items must be an array'),
  body('shippingAddress').optional().isObject().withMessage('Invalid shipping address object'),
  body('paymentGateway').optional().isString().withMessage('Payment gateway must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

export const validateAddress = [
  body('line1').isLength({ min: 3 }).withMessage('Address line1 too short'),
  body('city').isLength({ min: 2 }).withMessage('City required'),
  body('postalCode').isLength({ min: 3 }).withMessage('Postal code required'),
  body('country').isLength({ min: 2 }).withMessage('Country required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

export const validateContact = [
  body('name').isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('message').isLength({ min: 10 }).withMessage('Message too short'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

export const validateIdParam = [
  (req, res, next) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'Missing id parameter' });
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).json({ success: false, message: 'Invalid id' });
    next();
  }
];
export const validateQuote = [
  body('name').isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('items').isArray({ min: 1 }).withMessage('Provide at least one item for quote'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

export const validateQuoteRequest = [
  body('category').notEmpty().withMessage('Category is required'),
  body('product').isMongoId().withMessage('Valid Product ID is required'),
  body('requirementNote')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Requirement notes must be between 1 and 2000 characters'),
  body('containerSize')
    .isIn(['20 FT', '40 FT'])
    .withMessage('Container size must be either 20 FT or 40 FT'),
  body('expectedDeliveryDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Expected delivery date must be a valid date')
    .custom((value) => {
      if (!value) return true;
      const deliveryDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deliveryDate <= today) {
        throw new Error('Expected delivery date must be a future date only');
      }
      return true;
    }),
  body('quantity')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Quantity must be a string'),
  body('companyName')
    .optional({ checkFalsy: true })
    .isString(),
  body('contactPerson').notEmpty().withMessage('Contact person is required'),
  body('email').isEmail().withMessage('A valid email address is required'),
  body('phone')
    .matches(/^\+?[0-9\s-]{8,20}$/)
    .withMessage('A valid phone number is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('address')
    .optional({ checkFalsy: true })
    .isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

export default {};
