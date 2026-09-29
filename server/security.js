import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import path from 'path';

/**
 * Timing-safe string comparison to protect against timing attacks on authentication
 */
export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Perform dummy comparison to keep constant execution time
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Escape regex special characters to prevent Regular Expression Denial of Service (ReDoS)
 */
export function escapeRegex(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Sanitize text input: strip dangerous HTML tags/scripts, normalize whitespace, enforce max length
 */
export function sanitizeText(val, maxLength = 255) {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  // Strip script, style, iframe, object, embed tags and content
  str = str.replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  // Strip any remaining HTML tags
  str = str.replace(/<[^>]+>/g, '');
  // Disallow javascript: pseudo-protocol strings
  str = str.replace(/javascript\s*:/gi, '');
  // Limit length
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }
  return str.trim();
}

/**
 * Verify URL safety (only allows http:// and https://, blocks javascript: / data: URI attacks)
 */
export function isValidHttpUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  // Reject dangerous schemes
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    // Also allow relative static asset paths starting with /
    return trimmed.startsWith('/') && !trimmed.startsWith('//');
  }
}

/**
 * Validate phone number format (digits, plus sign, spaces, hyphens)
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,16}$/.test(trimmed);
}

/**
 * Validate registration / roll number (alphanumeric, hyphens, underscores)
 */
export function isValidRollNumber(roll) {
  if (!roll || typeof roll !== 'string') return false;
  const trimmed = roll.trim();
  return /^[a-zA-Z0-9_\-\/]{2,50}$/.test(trimmed);
}

/**
 * Rate limiters to protect against DDoS, brute force, and spam flooding
 */

// Global API rate limiter: max 300 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Strict rate limiter for Admin Login: max 15 failed attempts per 15 minutes per IP (successful logins do not consume limit)
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many failed login attempts. Please wait 15 minutes before trying again.'
  }
});

// Write actions rate limiter (Registrations, Cheers, DJ requests): max 25 per 10 minutes per IP
export const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Submission limit reached. Please wait a few minutes before submitting again.'
  }
});

// Voting rate limiter (DJ upvotes, Royalty cheers): max 60 votes per 10 minutes per IP
export const voteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Voting limit reached. Please wait a moment before cheering or voting again.'
  }
});

/**
 * Multer image file filter: restricts uploads strictly to safe image formats
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export function imageFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error('Security violation: Only safe image files (.jpg, .jpeg, .png, .webp, .gif) are allowed.'), false);
  }
  
  cb(null, true);
}
