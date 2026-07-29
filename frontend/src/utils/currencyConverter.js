/**
 * File: frontend/src/utils/currencyConverter.js
 * Purpose: Frontend utility helper functions for dynamic multi-currency conversions.
 */
export const CURRENCY_RATES = {
  INR: 1,      // Base
  USD: 0.012,  // 1 INR = 0.012 USD
  EUR: 0.011,  // 1 INR = 0.011 EUR
  GBP: 0.0094, // 1 INR = 0.0094 GBP
  AED: 0.044,  // 1 INR = 0.044 AED
  AUD: 0.018,  // 1 INR = 0.018 AUD
  CAD: 0.016,  // 1 INR = 0.016 CAD
  SGD: 0.016,  // 1 INR = 0.016 SGD
  JPY: 1.85,   // 1 INR = 1.85 JPY
};

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  JPY: '¥',
};

export const convertCurrency = (amountInINR, targetCurrency) => {
  if (!amountInINR || isNaN(amountInINR)) {
    const symbol = CURRENCY_SYMBOLS[targetCurrency?.toUpperCase()] || '$';
    return { value: 0, symbol, formatted: `${symbol}0.00` };
  }
  
  const currency = targetCurrency?.toUpperCase() || 'USD';
  const rate = CURRENCY_RATES[currency] || 1;
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  
  const convertedAmount = amountInINR * rate;
  
  return {
    value: convertedAmount,
    symbol,
    formatted: `${symbol}${Number(convertedAmount.toFixed(2)).toLocaleString('en-US')}`
  };
};