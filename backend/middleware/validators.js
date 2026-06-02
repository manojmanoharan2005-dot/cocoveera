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
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('total').isFloat({ gt: 0 }).withMessage('Total must be a positive number'),
  body('shippingAddress').optional().isMongoId().withMessage('Invalid shipping address id'),
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

export default {};
