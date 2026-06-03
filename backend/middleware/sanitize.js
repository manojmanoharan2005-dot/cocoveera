/**
 * File: backend/middleware/sanitize.js
 * Purpose: Provides middleware functions for request interception and validation.
 */
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

// Combine commonly used sanitizers into a single exported array
export const securitySanitizers = [
  mongoSanitize(),
  xss(),
];

export default securitySanitizers;
