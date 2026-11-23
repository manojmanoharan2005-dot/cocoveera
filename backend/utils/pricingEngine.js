/**
 * File: backend/utils/pricingEngine.js
 * Purpose: Centralized quotation and order pricing calculation engine for Cocoveera.
 * Ensures 100% mathematical accuracy, decimal safety, consistent currency handling,
 * and unified totals across Admin Portal, Customer Portal, PDF Generation, and Email Notifications.
 */

export const STANDARD_EXCHANGE_RATES = {
  INR: 1.0,
  USD: 83.33,   // 1 USD = 83.33 INR
  EUR: 90.50,   // 1 EUR = 90.50 INR
  GBP: 106.38,  // 1 GBP = 106.38 INR
  AED: 22.68,   // 1 AED = 22.68 INR
  AUD: 54.50,   // 1 AUD = 54.50 INR
  CAD: 61.20,   // 1 CAD = 61.20 INR
  SGD: 62.10,   // 1 SGD = 62.10 INR
  JPY: 0.55,    // 1 JPY = 0.55 INR
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

/**
 * Calculates complete, synchronized pricing for a quotation or order.
 * 
 * Formula:
 * For each item:
 *   Item Subtotal = (Quantity * Unit Price) - Item Discount
 * Items Total = sum(Item Subtotals)
 * Grand Total = Items Total + Freight + Packing + Handling + Insurance + Shipping + Tax - Overall Discount
 * 
 * Currency Rules:
 * - If currency === 'INR':
 *     exchangeRate = 1.0
 *     originalInrAmount = Grand Total
 *     convertedAmount = Grand Total
 * - If currency !== 'INR' (e.g. 'USD'):
 *     exchangeRate = exchangeRate || STANDARD_EXCHANGE_RATES[currency] || 83.33
 *     convertedAmount = Grand Total (in quote currency)
 *     originalInrAmount = round(Grand Total * exchangeRate) (in INR)
 */
export function calculateQuotePricing({
  products = [],
  currency = 'USD',
  exchangeRate,
  freightCharges = 0,
  packingCharges = 0,
  handlingCharges = 0,
  insuranceCharges = 0,
  shippingCharges = 0,
  tax = 0,
  discount = 0,
}) {
  const normCurrency = (currency || 'USD').toUpperCase();
  
  // Decimal-safe rounding helper (2 decimal places)
  const round2 = (num) => Math.round((Number(num) || 0) * 100) / 100;

  // Calculate items subtotal
  const calculatedProducts = (products || []).map((item) => {
    const qty = Number(item.quantity) || 1;
    const unitPrice = round2(item.unitPrice || 0);
    const itemDiscount = round2(item.discount || 0);
    const subtotal = round2((qty * unitPrice) - itemDiscount);

    return {
      ...item,
      quantity: qty,
      unitPrice,
      discount: itemDiscount,
      subtotal,
    };
  });

  const itemsSubtotal = round2(
    calculatedProducts.reduce((sum, item) => sum + item.subtotal, 0)
  );

  const fCharges = round2(freightCharges);
  const pCharges = round2(packingCharges);
  const hCharges = round2(handlingCharges);
  const iCharges = round2(insuranceCharges);
  const sCharges = round2(shippingCharges);
  const taxAmount = round2(tax);
  const overallDiscount = round2(discount);

  // Grand Total in active quote currency
  const grandTotal = round2(
    itemsSubtotal + fCharges + pCharges + hCharges + iCharges + sCharges + taxAmount - overallDiscount
  );

  // Exchange rate & INR conversion
  let effectiveExchangeRate = 1.0;
  let originalInrAmount = grandTotal;
  let convertedAmount = grandTotal;

  if (normCurrency === 'INR') {
    effectiveExchangeRate = 1.0;
    originalInrAmount = grandTotal;
    convertedAmount = grandTotal;
  } else {
    // 1 [currency] = [rate] INR
    effectiveExchangeRate = Number(exchangeRate) > 0
      ? Number(exchangeRate)
      : (STANDARD_EXCHANGE_RATES[normCurrency] || 83.33);
    
    convertedAmount = grandTotal;
    originalInrAmount = round2(grandTotal * effectiveExchangeRate);
  }

  return {
    products: calculatedProducts,
    itemsSubtotal,
    freightCharges: fCharges,
    packingCharges: pCharges,
    handlingCharges: hCharges,
    insuranceCharges: iCharges,
    shippingCharges: sCharges,
    tax: taxAmount,
    discount: overallDiscount,
    grandTotal,
    currency: normCurrency,
    exchangeRate: effectiveExchangeRate,
    convertedAmount,
    originalInrAmount,
    currencySymbol: CURRENCY_SYMBOLS[normCurrency] || normCurrency,
  };
}

export function formatQuotePrice(amount, currency = 'USD') {
  const norm = (currency || 'USD').toUpperCase();
  const sym = CURRENCY_SYMBOLS[norm] || `${norm} `;
  const num = Number(amount) || 0;
  return `${sym}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Decimal-safe four-milestone payment calculation.
 * Ensures sum of all 4 milestones strictly equals totalAmount by adjusting
 * the final installment for any rounding remainder.
 */
export function calculatePaymentMilestones(totalAmount, currency = 'USD') {
  const total = Math.round((Number(totalAmount) || 0) * 100) / 100;
  const m1 = Math.round(total * 0.40 * 100) / 100;
  const m2 = Math.round(total * 0.20 * 100) / 100;
  const m3 = Math.round(total * 0.20 * 100) / 100;
  // Remainder-safe adjustment on final installment
  const m4 = Math.round((total - m1 - m2 - m3) * 100) / 100;

  return [
    {
      milestoneType: '40% Advance Payment',
      percentage: 40,
      amount: m1,
      currency: currency || 'USD',
      status: 'Pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      milestoneType: '60% Payment Unlocked',
      percentage: 20,
      amount: m2,
      currency: currency || 'USD',
      status: 'Locked',
    },
    {
      milestoneType: '80% Payment Unlocked',
      percentage: 20,
      amount: m3,
      currency: currency || 'USD',
      status: 'Locked',
    },
    {
      milestoneType: '100% Final Payment',
      percentage: 20,
      amount: m4,
      currency: currency || 'USD',
      status: 'Locked',
    },
  ];
}
