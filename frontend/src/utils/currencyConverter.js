export const CURRENCY_RATES = {
  INR: 1, // Base
  USD: 0.012, // 1 INR = 0.012 USD
  EUR: 0.011, // 1 INR = 0.011 EUR
  GBP: 0.0094, // 1 INR = 0.0094 GBP
};

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const convertCurrency = (amountInINR, targetCurrency) => {
  if (!amountInINR || isNaN(amountInINR)) return 0;
  
  const currency = targetCurrency?.toUpperCase() || 'INR';
  const rate = CURRENCY_RATES[currency] || 1;
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  
  const convertedAmount = amountInINR * rate;
  
  return {
    value: convertedAmount,
    symbol,
    formatted: `${symbol}${convertedAmount.toFixed(2)}`
  };
};