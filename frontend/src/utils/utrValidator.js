/**
 * Utility: frontend/src/utils/utrValidator.js
 * Purpose: Strict validation for Indian Bank UTRs and International Wire References.
 * 
 * Standard Formats:
 * - UPI / IMPS Ref: 12 numeric digits (e.g. 432712345678)
 * - NEFT UTR: 16 alphanumeric characters (e.g. HDFCN24327000123)
 * - RTGS UTR: 22 alphanumeric characters (e.g. HDFCR24327000000000123)
 * - SWIFT / Wire / MT103: 8 to 22 alphanumeric characters
 */

export const validateUTRNumber = (utr) => {
  if (!utr || typeof utr !== 'string') {
    return {
      isValid: false,
      error: 'Please enter your Transaction Reference / UTR Number.',
    };
  }

  const trimmed = utr.trim();
  const cleanUtr = trimmed.toUpperCase();

  if (cleanUtr.length === 0) {
    return {
      isValid: false,
      error: 'UTR Number cannot be empty.',
    };
  }

  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      error: 'UTR Number cannot contain spaces. Please remove any spaces.',
    };
  }

  // Only letters and numbers allowed
  if (!/^[A-Z0-9]+$/.test(cleanUtr)) {
    return {
      isValid: false,
      error: 'UTR Number must only contain alphanumeric characters (no special symbols).',
    };
  }

  // Minimum 8 characters, maximum 22 characters
  if (cleanUtr.length < 8) {
    return {
      isValid: false,
      error: `UTR Number is too short (${cleanUtr.length}/8 chars min). Standard UTRs are 12 digits (UPI/IMPS), 16 characters (NEFT), or 22 characters (RTGS).`,
    };
  }

  if (cleanUtr.length > 22) {
    return {
      isValid: false,
      error: `UTR Number exceeds maximum allowed length (${cleanUtr.length}/22 chars max).`,
    };
  }

  // Check for repetitive characters (e.g. 000000000000, 111111111111, XXXXXXXXXXXX)
  if (/^(.)\1+$/.test(cleanUtr)) {
    return {
      isValid: false,
      error: 'Invalid UTR: Repetitive character strings are not valid bank references.',
    };
  }

  // Check for obvious sequential or dummy test strings
  const dummyPatterns = [
    '123456789',
    '987654321',
    '876543210',
    '012345678',
    'TEST',
    'DUMMY',
    'SAMPLE',
    'QWERTY',
    'DEFAULT',
    'ABCDEFGH',
    'NOTAPPLICABLE',
  ];

  if (dummyPatterns.some(p => cleanUtr.includes(p)) || cleanUtr === '12345678' || cleanUtr === '87654321') {
    return {
      isValid: false,
      error: 'Please enter a genuine bank-issued UTR reference. Dummy or test text is not permitted.',
    };
  }

  return {
    isValid: true,
    error: '',
    cleanUtr,
  };
};
