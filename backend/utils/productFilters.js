/**
 * File: backend/utils/productFilters.js
 * Purpose: Defines database query filter for customer-facing product APIs.
 * Customer Marketplace should ONLY display products where:
 * - status = 'ACTIVE'
 * - isPublished = true
 * - isHidden = false
 * - isDeleted = false
 */

export const PUBLIC_PRODUCT_FILTER = {
  status: 'ACTIVE',
  isPublished: true,
  isHidden: false,
  isDeleted: false,
};

/**
 * Returns true if a product object satisfies all public visibility criteria.
 */
export const isProductPubliclyVisible = (product) => {
  if (!product) return false;
  return (
    product.status === 'ACTIVE' &&
    product.isPublished === true &&
    product.isHidden !== true &&
    product.isDeleted !== true
  );
};
