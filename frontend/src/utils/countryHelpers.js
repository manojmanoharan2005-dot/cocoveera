export const COUNTRIES_LIST = [
  { name: 'India', code: 'IN', currency: 'INR' },
  { name: 'USA', code: 'US', currency: 'USD' },
  { name: 'Germany', code: 'DE', currency: 'EUR' },
  { name: 'UK', code: 'GB', currency: 'GBP' },
  { name: 'Australia', code: 'AU', currency: 'AUD' },
  { name: 'Canada', code: 'CA', currency: 'CAD' },
  { name: 'Japan', code: 'JP', currency: 'JPY' },
  { name: 'Netherlands', code: 'NL', currency: 'EUR' },
  { name: 'UAE', code: 'AE', currency: 'AED' },
  { name: 'Singapore', code: 'SG', currency: 'SGD' },
  { name: 'New Zealand', code: 'NZ', currency: 'NZD' },
  { name: 'France', code: 'FR', currency: 'EUR' },
  { name: 'Italy', code: 'IT', currency: 'EUR' },
  { name: 'Spain', code: 'ES', currency: 'EUR' },
  { name: 'Mexico', code: 'MX', currency: 'MXN' },
  { name: 'Brazil', code: 'BR', currency: 'BRL' },
  { name: 'South Africa', code: 'ZA', currency: 'ZAR' }
];

/**
 * Checks if the user is from India based on countryCode or countryName.
 */
export const isIndianUser = (countryCode, countryName) => {
  if (countryCode && countryCode.trim().toUpperCase() === 'IN') return true;
  if (countryName && countryName.trim().toLowerCase() === 'india') return true;
  return false;
};

/**
 * Returns the available payment methods for a given country.
 */
export const getAvailablePaymentMethods = (countryCode, countryName) => {
  if (isIndianUser(countryCode, countryName)) {
    return ['razorpay', 'cod'];
  }
  return ['stripe', 'paypal'];
};

/**
 * Returns the country code format needed by react-phone-input-2 (lowercase iso-2).
 */
export const getPhoneCountry = (countryCode) => {
  if (!countryCode) return '';
  return countryCode.toLowerCase();
};
