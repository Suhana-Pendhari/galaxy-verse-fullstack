import { VALIDATION } from './constants';

// ===== REQUIRED VALIDATORS =====

/**
 * Check if value is present
 * @param {any} value - Value to check
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const required = (value, fieldName = 'This field') => {
  if (value === undefined || value === null || value === '') {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    };
  }
  return { isValid: true };
};

// ===== STRING VALIDATORS =====

/**
 * Validate minimum length
 * @param {string} value - String to validate
 * @param {number} min - Minimum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const minLength = (value, min, fieldName = 'This field') => {
  if (value && value.length < min) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${min} characters`,
    };
  }
  return { isValid: true };
};

/**
 * Validate maximum length
 * @param {string} value - String to validate
 * @param {number} max - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const maxLength = (value, max, fieldName = 'This field') => {
  if (value && value.length > max) {
    return {
      isValid: false,
      message: `${fieldName} cannot exceed ${max} characters`,
    };
  }
  return { isValid: true };
};

/**
 * Validate exact length
 * @param {string} value - String to validate
 * @param {number} length - Exact length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const exactLength = (value, length, fieldName = 'This field') => {
  if (value && value.length !== length) {
    return {
      isValid: false,
      message: `${fieldName} must be exactly ${length} characters`,
    };
  }
  return { isValid: true };
};

/**
 * Validate matches pattern
 * @param {string} value - String to validate
 * @param {RegExp} pattern - Regex pattern
 * @param {string} message - Error message
 * @returns {Object} Validation result
 */
export const matches = (value, pattern, message) => {
  if (value && !pattern.test(value)) {
    return {
      isValid: false,
      message: message || 'Invalid format',
    };
  }
  return { isValid: true };
};

// ===== EMAIL VALIDATORS =====

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export const email = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address',
    };
  }
  return { isValid: true };
};

// ===== PASSWORD VALIDATORS =====

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const password = (password) => {
  const errors = [];
  
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.push(`at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('one special character (!@#$%^&*)');
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      message: `Password must contain ${errors.join(', ')}`,
    };
  }
  
  return { isValid: true };
};

/**
 * Validate password match
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirm password
 * @returns {Object} Validation result
 */
export const passwordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'Passwords do not match',
    };
  }
  return { isValid: true };
};

// ===== USERNAME VALIDATORS =====

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} Validation result
 */
export const username = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  
  if (username.length < VALIDATION.USERNAME_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`,
    };
  }
  
  if (username.length > VALIDATION.USERNAME_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Username cannot exceed ${VALIDATION.USERNAME_MAX_LENGTH} characters`,
    };
  }
  
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      message: 'Username can only contain letters, numbers, and underscores',
    };
  }
  
  return { isValid: true };
};

// ===== URL VALIDATORS =====

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {Object} Validation result
 */
export const url = (url) => {
  if (!url) return { isValid: true };
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      message: 'Please enter a valid URL',
    };
  }
};

// ===== NUMBER VALIDATORS =====

/**
 * Validate number range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const range = (value, min, max, fieldName = 'This field') => {
  if (value && (value < min || value > max)) {
    return {
      isValid: false,
      message: `${fieldName} must be between ${min} and ${max}`,
    };
  }
  return { isValid: true };
};

/**
 * Validate minimum value
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const min = (value, min, fieldName = 'This field') => {
  if (value && value < min) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${min}`,
    };
  }
  return { isValid: true };
};

/**
 * Validate maximum value
 * @param {number} value - Number to validate
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const max = (value, max, fieldName = 'This field') => {
  if (value && value > max) {
    return {
      isValid: false,
      message: `${fieldName} cannot exceed ${max}`,
    };
  }
  return { isValid: true };
};

/**
 * Validate integer
 * @param {number} value - Number to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const integer = (value, fieldName = 'This field') => {
  if (value && !Number.isInteger(Number(value))) {
    return {
      isValid: false,
      message: `${fieldName} must be an integer`,
    };
  }
  return { isValid: true };
};

/**
 * Validate positive number
 * @param {number} value - Number to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const positive = (value, fieldName = 'This field') => {
  if (value && value <= 0) {
    return {
      isValid: false,
      message: `${fieldName} must be a positive number`,
    };
  }
  return { isValid: true };
};

// ===== DATE VALIDATORS =====

/**
 * Validate date format
 * @param {string} date - Date string
 * @returns {Object} Validation result
 */
export const date = (date) => {
  if (!date) return { isValid: true };
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return {
      isValid: false,
      message: 'Please enter a valid date',
    };
  }
  return { isValid: true };
};

/**
 * Validate date range
 * @param {string} date - Date string
 * @param {Date} minDate - Minimum date
 * @param {Date} maxDate - Maximum date
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const dateRange = (date, minDate, maxDate, fieldName = 'This field') => {
  if (!date) return { isValid: true };
  
  const parsedDate = new Date(date);
  
  if (minDate && parsedDate < minDate) {
    return {
      isValid: false,
      message: `${fieldName} must be after ${minDate.toLocaleDateString()}`,
    };
  }
  
  if (maxDate && parsedDate > maxDate) {
    return {
      isValid: false,
      message: `${fieldName} must be before ${maxDate.toLocaleDateString()}`,
    };
  }
  
  return { isValid: true };
};

// ===== PHONE VALIDATORS =====

/**
 * Validate phone number
 * @param {string} phone - Phone number
 * @returns {Object} Validation result
 */
export const phone = (phone) => {
  if (!phone) return { isValid: true };
  
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}$/;
  if (!phoneRegex.test(phone)) {
    return {
      isValid: false,
      message: 'Please enter a valid phone number',
    };
  }
  return { isValid: true };
};

// ===== FILE VALIDATORS =====

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum size in bytes
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const fileSize = (file, maxSize, fieldName = 'File') => {
  if (file && file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      isValid: false,
      message: `${fieldName} size cannot exceed ${maxSizeMB}MB`,
    };
  }
  return { isValid: true };
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const fileType = (file, allowedTypes, fieldName = 'File') => {
  if (file && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: `${fieldName} type is not supported`,
    };
  }
  return { isValid: true };
};

// ===== ARRAY VALIDATORS =====

/**
 * Validate array minimum length
 * @param {Array} array - Array to validate
 * @param {number} min - Minimum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const arrayMinLength = (array, min, fieldName = 'This field') => {
  if (array && array.length < min) {
    return {
      isValid: false,
      message: `${fieldName} must have at least ${min} items`,
    };
  }
  return { isValid: true };
};

/**
 * Validate array maximum length
 * @param {Array} array - Array to validate
 * @param {number} max - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const arrayMaxLength = (array, max, fieldName = 'This field') => {
  if (array && array.length > max) {
    return {
      isValid: false,
      message: `${fieldName} cannot have more than ${max} items`,
    };
  }
  return { isValid: true };
};

// ===== COMPOUND VALIDATORS =====

/**
 * Validate multiple rules
 * @param {any} value - Value to validate
 * @param {Array} rules - Array of validation rules
 * @returns {Object} Validation result
 */
export const validate = (value, rules) => {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
};

/**
 * Create validator for form field
 * @param {string} fieldName - Field name
 * @param {Array} validators - Array of validator functions
 * @returns {Function} Validator function
 */
export const createFieldValidator = (fieldName, validators) => {
  return (value) => {
    for (const validator of validators) {
      const result = validator(value, fieldName);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  };
};

/**
 * Validate form object
 * @param {Object} values - Form values
 * @param {Object} validators - Validators object
 * @returns {Object} Validation results
 */
export const validateForm = (values, validators) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validators).forEach(field => {
    const result = validators[field](values[field]);
    if (!result.isValid) {
      errors[field] = result.message;
      isValid = false;
    }
  });
  
  return { isValid, errors };
};
