/**
 * API Configuration Module
 * 
 * In local development, defaults to empty string so requests go to '/api/...'
 * and are proxied by Vite dev server to http://localhost:5000.
 * 
 * In production (e.g. Vercel frontend + Render backend), set VITE_API_URL
 * to your backend domain (e.g. https://astra26-backend.onrender.com).
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default apiUrl;
