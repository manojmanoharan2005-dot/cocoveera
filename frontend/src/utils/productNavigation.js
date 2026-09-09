/**
 * File: frontend/src/utils/productNavigation.js
 * Purpose: Centralized, security-hardened product navigation & post-login return handler.
 *          Works across all public landing pages, search results, category pages, and product grids.
 */

/**
 * Validates whether a route is a safe internal application path to prevent open redirect vulnerabilities.
 * @param {string} path - The candidate redirect path
 * @returns {boolean} True if path is a valid internal relative route
 */
export const isSafeInternalRoute = (path) => {
  if (!path || typeof path !== 'string') return false;
  const trimmed = path.trim();
  // Must start with '/' but NOT '//' or '/\'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return false;
  }
  // Reject protocol schemes like javascript:, data:, http:, etc.
  if (/^\/[a-z0-9]+:/i.test(trimmed)) {
    return false;
  }
  return true;
};

/**
 * Checks whether the current user token is valid in sessionStorage.
 * @returns {boolean} True if user is authenticated
 */
export const checkIsAuthenticated = () => {
  try {
    const token = sessionStorage.getItem('cocoveera_token');
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const payload = JSON.parse(atob(parts[1]));
    return Boolean(payload && payload.exp && payload.exp * 1000 > Date.now());
  } catch (e) {
    return false;
  }
};

/**
 * Centralized product navigation helper.
 * If user is authenticated, navigates directly to the target product details page.
 * If user is unauthenticated, safely stores the exact target product route in sessionStorage
 * and redirects to /login.
 *
 * @param {Object} product - Product object containing slug or _id
 * @param {Function} navigate - React Router navigate function
 * @param {boolean} [userAuthOverride] - Optional explicit auth boolean from useAuth()
 * @param {Event} [e] - Optional click event to prevent default link action
 */
export const navigateToProduct = (product, navigate, userAuthOverride, e) => {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  if (!product) {
    navigate('/products');
    return;
  }

  const slugOrId = product.slug || product._id || product.id;
  if (!slugOrId) {
    navigate('/products');
    return;
  }

  const targetPath = `/dashboard/product/${slugOrId}`;
  let isAuthenticated = false;
  if (typeof userAuthOverride === 'boolean') {
    isAuthenticated = userAuthOverride;
  } else if (userAuthOverride && typeof userAuthOverride === 'object') {
    isAuthenticated = Boolean(userAuthOverride._id || userAuthOverride.email || userAuthOverride.role);
  } else {
    isAuthenticated = checkIsAuthenticated();
  }

  if (isAuthenticated) {
    navigate(targetPath);
  } else {
    // Safely store intended product route for post-login return
    sessionStorage.setItem('postLoginRedirect', targetPath);
    navigate(`/login?returnUrl=${encodeURIComponent(targetPath)}`, { state: { from: targetPath } });
  }
};

/**
 * Retrieves and sanitizes any stored post-login redirect path.
 * Checks sessionStorage, router location state, and URL query params.
 * Returns null if no safe internal redirect path exists.
 *
 * @param {Object} location - React Router location object
 * @returns {string|null} Safe relative path or null
 */
export const getPostLoginRedirect = (location) => {
  // 1. Check sessionStorage postLoginRedirect
  const stored = sessionStorage.getItem('postLoginRedirect');
  if (stored && isSafeInternalRoute(stored)) {
    sessionStorage.removeItem('postLoginRedirect');
    return stored;
  }

  // 2. Check React Router location state from
  const fromState = location?.state?.from;
  let statePath = null;
  if (typeof fromState === 'string') {
    statePath = fromState;
  } else if (fromState && typeof fromState === 'object' && fromState.pathname) {
    statePath = `${fromState.pathname}${fromState.search || ''}`;
  }

  if (statePath && isSafeInternalRoute(statePath) && !statePath.startsWith('/login')) {
    return statePath;
  }

  // 3. Check URL search query param ?returnUrl= or ?redirect=
  try {
    const params = new URLSearchParams(window.location.search);
    const paramRedirect = params.get('returnUrl') || params.get('redirect');
    if (paramRedirect) {
      const decoded = decodeURIComponent(paramRedirect);
      const candidate = decoded.startsWith('/') ? decoded : `/${decoded}`;
      if (isSafeInternalRoute(candidate) && !candidate.startsWith('/login')) {
        return candidate;
      }
    }
  } catch (e) {
    // Fallthrough
  }

  return null;
};
