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

export const CURRENCY_LOCALES = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  AED: 'en-AE',
  AUD: 'en-AU',
  CAD: 'en-CA',
  SGD: 'en-SG',
  JPY: 'ja-JP',
};

export const formatCurrency = (amount, currencyCode, locale) => {
  const code = (currencyCode || 'USD').toUpperCase();
  const loc = locale || CURRENCY_LOCALES[code] || 'en-US';
  const symbol = CURRENCY_SYMBOLS[code] || '$';
  
  try {
    return new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch (err) {
    return `${symbol}${Number((amount || 0).toFixed(2)).toLocaleString(loc)}`;
  }
};

export const convertCurrency = (amountInINR, targetCurrency, userRegisteredCurrency) => {
  const activeCurrency = (targetCurrency || userRegisteredCurrency || 'USD').toUpperCase();
  
  if (!amountInINR || isNaN(amountInINR)) {
    const symbol = CURRENCY_SYMBOLS[activeCurrency] || '$';
    return { value: 0, symbol, currencyCode: activeCurrency, formatted: `${symbol}0.00` };
  }
  
  const rate = CURRENCY_RATES[activeCurrency] || 1;
  const symbol = CURRENCY_SYMBOLS[activeCurrency] || '$';
  const convertedAmount = amountInINR * rate;
  const locale = CURRENCY_LOCALES[activeCurrency] || 'en-US';

  return {
    value: convertedAmount,
    symbol,
    currencyCode: activeCurrency,
    locale,
    formatted: formatCurrency(convertedAmount, activeCurrency, locale)
  };
};