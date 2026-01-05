/**
 * SwiftCheckout - Helper Utilities
 */
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Deep clone object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Group array by key
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {});
}

/**
 * Sum array by key
 */
export function sumBy(array, key) {
  return array.reduce((sum, item) => {
    const value = typeof key === 'function' ? key(item) : item[key];
    return sum + (Number(value) || 0);
  }, 0);
}

/**
 * Unique array values
 */
export function unique(array) {
  return [...new Set(array)];
}

/**
 * Sleep utility
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function
 */
export async function retry(fn, maxAttempts = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(delay * attempt);
      }
    }
  }
  
  throw lastError;
}

/**
 * Safe JSON parse
 */
export function safeJSONParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Safe number conversion
 */
export function toNumber(value, fallback = 0) {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

/**
 * Check if object is empty
 */
export function isEmpty(obj) {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      toast.success('Copied to clipboard');
      return true;
    } catch (err) {
      toast.error('Failed to copy');
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Download data as file
 */
export function downloadFile(data, filename, mimeType = 'text/plain') {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value, total) {
  if (!total || total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
}

/**
 * Clamp number between min and max
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}