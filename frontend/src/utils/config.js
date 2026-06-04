/**
 * File: frontend/src/utils/config.js
 * Purpose: Centrally handles API URLs and environment configurations,
 *          automatically detecting local network or production hostnames
 *          and normalizing the base path to prevent missing /api route errors.
 */

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const { hostname } = window.location;

  // Regex to detect local development hostnames/IPs (including LAN IPs)
  const isLocalHost = /^localhost$|^127\.\d+\.\d+\.\d+$|^192\.168\.\d+\.\d+$|^10\.\d+\.\d+\.\d+$|^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$|\.local$/i.test(hostname);

  if (isLocalHost) {
    // In local development/testing, connect to port 5000 of the current host
    return `http://${hostname}:5000/api`;
  }

  // In production deployment (Vercel, Render, etc.):
  // If the built bundle has a valid non-localhost env URL, normalize and use it
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.endsWith('/api')) {
      return `${cleanUrl}/api`;
    }
    return cleanUrl;
  }

  // Otherwise, default to the production backend URL on Render
  return 'https://cocoveera.onrender.com/api';
};

export const API_URL = getApiUrl();
