/**
 * File: backend/middleware/limiters.js
 * Purpose: Provides middleware functions for request interception and validation.
 */
import rateLimit from 'express-rate-limit';

export const createLimiter = ({ windowMs = 60 * 60 * 1000, max = 100, message } = {}) =>
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message });

export const contactLimiter = createLimiter({ windowMs: 60 * 60 * 1000, max: 10, message: { success: false, message: 'Too many contact attempts, try later.' } });
export const paymentInitiateLimiter = createLimiter({ windowMs: 10 * 60 * 1000, max: 5, message: { success: false, message: 'Too many payment attempts, try again later.' } });
export const orderCreateLimiter = createLimiter({ windowMs: 60 * 60 * 1000, max: 30, message: { success: false, message: 'Too many order creations, try later.' } });

export default { createLimiter };
