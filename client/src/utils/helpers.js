import { STORAGE_KEYS } from './constants';

// ===== STORAGE HELPERS =====

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 */
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Get data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Retrieved data
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * Clear all localStorage data
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// ===== AUTH HELPERS =====

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!getFromStorage(STORAGE_KEYS.TOKEN);
};

/**
 * Get auth token
 * @returns {string|null} Auth token
 */
export const getToken = () => {
  return getFromStorage(STORAGE_KEYS.TOKEN);
};

/**
 * Get current user
 * @returns {Object|null} User object
 */
export const getCurrentUser = () => {
  return getFromStorage(STORAGE_KEYS.USER);
};

/**
 * Check if user has role
 * @param {string} role - Role to check
 * @returns {boolean} Has role status
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user?.role === role;
};

/**
 * Check if user is admin
 * @returns {boolean} Is admin status
 */
export const isAdmin = () => {
  return hasRole('admin');
};

/**
 * Check if user is moderator
 * @returns {boolean} Is moderator status
 */
export const isModerator = () => {
  return hasRole('moderator');
};

// ===== URL HELPERS =====

/**
 * Get query parameters from URL
 * @returns {Object} Query parameters
 */
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

/**
 * Build URL with query parameters
 * @param {string} baseUrl - Base URL
 * @param {Object} params - Query parameters
 * @returns {string} URL with parameters
 */
export const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl, window.location.origin);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.pathname + url.search;
};

/**
 * Get URL path segments
 * @returns {Array} Path segments
 */
export const getPathSegments = () => {
  return window.location.pathname.split('/').filter(Boolean);
};

// ===== COPY HELPERS =====

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback copy error:', fallbackError);
      return false;
    }
  }
};

// ===== DEBOUNCE & THROTTLE =====

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in ms
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// ===== OBJECT HELPERS =====

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Error cloning object:', error);
    return obj;
  }
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} Is empty status
 */
export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Merge objects deeply
 * @param {...Object} objects - Objects to merge
 * @returns {Object} Merged object
 */
export const deepMerge = (...objects) => {
  const result = {};
  
  objects.forEach(obj => {
    if (!obj) return;
    
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          result[key] = obj[key].slice();
        } else {
          result[key] = deepMerge(result[key] || {}, obj[key]);
        }
      } else {
        result[key] = obj[key];
      }
    });
  });
  
  return result;
};

/**
 * Pick specific keys from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to pick
 * @returns {Object} Picked object
 */
export const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj && obj.hasOwnProperty(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

/**
 * Omit specific keys from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to omit
 * @returns {Object} Omitted object
 */
export const omit = (obj, keys) => {
  return Object.keys(obj).reduce((acc, key) => {
    if (!keys.includes(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

// ===== ARRAY HELPERS =====

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Unique array by key
 * @param {Array} array - Array to filter
 * @param {string} key - Key to check uniqueness
 * @returns {Array} Filtered array
 */
export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Chunked array
 */
export const chunk = (array, size) => {
  return array.reduce((chunks, item, index) => {
    const chunkIndex = Math.floor(index / size);
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }
    chunks[chunkIndex].push(item);
    return chunks;
  }, []);
};

// ===== STRING HELPERS =====

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string} Random string
 */
export const randomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Mask email address
 * @param {string} email - Email to mask
 * @returns {string} Masked email
 */
export const maskEmail = (email) => {
  if (!email) return '';
  const [local, domain] = email.split('@');
  const maskedLocal = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1);
  return `${maskedLocal}@${domain}`;
};

/**
 * Mask phone number
 * @param {string} phone - Phone to mask
 * @returns {string} Masked phone
 */
export const maskPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const last4 = cleaned.slice(-4);
  return '*'.repeat(cleaned.length - 4) + last4;
};

// ===== VALIDATION HELPERS =====

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid
 */
export const isValidPhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}$/;
  return re.test(phone);
};

// ===== COLOR HELPERS =====

/**
 * Generate random color
 * @returns {string} Random hex color
 */
export const randomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Lighten or darken color
 * @param {string} color - Hex color
 * @param {number} percent - Percentage to change (-100 to 100)
 * @returns {string} Modified color
 */
export const lightenDarkenColor = (color, percent) => {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);

  R = Math.min(255, Math.max(0, R + R * percent / 100));
  G = Math.min(255, Math.max(0, G + G * percent / 100));
  B = Math.min(255, Math.max(0, B + B * percent / 100));

  return `#${(R < 16 ? '0' : '') + R.toString(16)}${(G < 16 ? '0' : '') + G.toString(16)}${(B < 16 ? '0' : '') + B.toString(16)}`;
};

// ===== SCROLL HELPERS =====

/**
 * Smooth scroll to element
 * @param {string|HTMLElement} element - Element or selector
 * @param {Object} options - Scroll options
 */
export const scrollToElement = (element, options = {}) => {
  const target = typeof element === 'string' ? document.querySelector(element) : element;
  if (!target) return;
  
  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    ...options,
  });
};

/**
 * Scroll to top
 * @param {boolean} smooth - Use smooth scrolling
 */
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  });
};

// ===== DEVICE HELPERS =====

/**
 * Check if device is mobile
 * @returns {boolean} Is mobile
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Check if device is iOS
 * @returns {boolean} Is iOS
 */
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Check if device is Android
 * @returns {boolean} Is Android
 */
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};
