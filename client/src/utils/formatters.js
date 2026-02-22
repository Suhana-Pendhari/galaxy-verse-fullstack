import { format, formatDistance, formatRelative, formatDistanceToNow } from 'date-fns';
import { DATE_FORMATS, NUMBER_FORMATS } from './constants';

// ===== DATE FORMATTERS =====

/**
 * Format date with custom format
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatStr = DATE_FORMATS.DEFAULT) => {
  if (!date) return '';
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @param {Object} options - Format options
 * @returns {string} Relative time
 */
export const formatRelativeTime = (date, options = { addSuffix: true }) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), options);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '';
  }
};

/**
 * Format date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  try {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  } catch (error) {
    console.error('Date range formatting error:', error);
    return '';
  }
};

/**
 * Get time ago string
 * @param {Date|string} date - Date to compare
 * @returns {string} Time ago string
 */
export const timeAgo = (date) => {
  return formatRelativeTime(date, { addSuffix: true });
};

/**
 * Format countdown time
 * @param {number} seconds - Seconds remaining
 * @returns {string} Formatted countdown
 */
export const formatCountdown = (seconds) => {
  if (seconds < 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ===== NUMBER FORMATTERS =====

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format number with K/M/B suffix
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted number
 */
export const formatCompactNumber = (num, decimals = 1) => {
  if (num === null || num === undefined) return '0';
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(decimals)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(decimals)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(decimals)}K`;
  }
  return num.toString();
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, total, decimals = 1) => {
  if (!total) return '0%';
  return `${((value / total) * 100).toFixed(decimals)}%`;
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format scientific notation
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Scientific notation
 */
export const formatScientific = (num, decimals = 2) => {
  return num.toExponential(decimals);
};

// ===== TEXT FORMATTERS =====

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize each word in string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Truncate text with ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated string
 */
export const truncateText = (str, length = 100, suffix = '...') => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

/**
 * Slugify string
 * @param {string} str - String to slugify
 * @returns {string} Slugified string
 */
export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

/**
 * Format credit card number
 * @param {string} cardNumber - Card number
 * @returns {string} Formatted card number
 */
export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const cleaned = cardNumber.replace(/\D/g, '');
  const match = cleaned.match(/(\d{4})(\d{4})(\d{4})(\d{4})/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  return cardNumber;
};

// ===== COORDINATE FORMATTERS =====

/**
 * Format coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted coordinates
 */
export const formatCoordinates = (lat, lng, decimals = 4) => {
  if (lat === undefined || lng === undefined) return '';
  return `${lat.toFixed(decimals)}°, ${lng.toFixed(decimals)}°`;
};

/**
 * Format DMS coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} DMS formatted coordinates
 */
export const formatDMS = (lat, lng) => {
  const formatDMS = (coord, type) => {
    const absolute = Math.abs(coord);
    const degrees = Math.floor(absolute);
    const minutes = Math.floor((absolute - degrees) * 60);
    const seconds = ((absolute - degrees - minutes / 60) * 3600).toFixed(2);
    
    const direction = type === 'lat' 
      ? coord >= 0 ? 'N' : 'S'
      : coord >= 0 ? 'E' : 'W';
    
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  return `${formatDMS(lat, 'lat')} ${formatDMS(lng, 'lng')}`;
};

// ===== DURATION FORMATTERS =====

/**
 * Format duration in seconds
 * @param {number} seconds - Duration in seconds
 * @param {boolean} includeSeconds - Include seconds in output
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds, includeSeconds = true) => {
  if (seconds < 0) return '';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (includeSeconds && (secs > 0 || parts.length === 0)) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

/**
 * Format milliseconds to time string
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time
 */
export const formatMs = (ms) => {
  const seconds = Math.floor(ms / 1000);
  return formatDuration(seconds);
};

// ===== ARRAY FORMATTERS =====

/**
 * Format list with commas and 'and'
 * @param {Array} items - Items to format
 * @returns {string} Formatted list
 */
export const formatList = (items) => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  
  const last = items.pop();
  return `${items.join(', ')}, and ${last}`;
};

// ===== ADDRESS FORMATTERS =====

/**
 * Format address object
 * @param {Object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  const parts = [];
  if (address.line1) parts.push(address.line1);
  if (address.line2) parts.push(address.line2);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zip) parts.push(address.zip);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
};

// ===== TEMPERATURE FORMATTERS =====

/**
 * Format temperature
 * @param {number} temp - Temperature
 * @param {string} unit - Unit (C or F)
 * @returns {string} Formatted temperature
 */
export const formatTemperature = (temp, unit = 'C') => {
  if (temp === undefined || temp === null) return '';
  return `${temp.toFixed(1)}°${unit}`;
};

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
export const celsiusToFahrenheit = (celsius) => {
  return (celsius * 9/5) + 32;
};

// ===== DISTANCE FORMATTERS =====

/**
 * Format distance
 * @param {number} km - Distance in kilometers
 * @param {string} unit - Unit (km or mi)
 * @returns {string} Formatted distance
 */
export const formatDistance = (km, unit = 'km') => {
  if (km === undefined || km === null) return '';
  
  if (unit === 'mi') {
    const miles = km * 0.621371;
    if (miles >= 1000) {
      return `${(miles / 1000).toFixed(2)}k mi`;
    }
    return `${miles.toFixed(1)} mi`;
  }
  
  if (km >= 1000000) {
    return `${(km / 1000000).toFixed(2)}M km`;
  }
  if (km >= 1000) {
    return `${(km / 1000).toFixed(2)}k km`;
  }
  return `${km.toFixed(1)} km`;
};

// ===== VELOCITY FORMATTERS =====

/**
 * Format velocity
 * @param {number} kmh - Velocity in km/h
 * @param {string} unit - Unit (kmh or mph)
 * @returns {string} Formatted velocity
 */
export const formatVelocity = (kmh, unit = 'kmh') => {
  if (kmh === undefined || kmh === null) return '';
  
  if (unit === 'mph') {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }
  
  return `${Math.round(kmh)} km/h`;
};

// ===== MASS FORMATTERS =====

/**
 * Format mass
 * @param {number} kg - Mass in kilograms
 * @returns {string} Formatted mass
 */
export const formatMass = (kg) => {
  if (kg === undefined || kg === null) return '';
  
  if (kg >= 1000000) {
    return `${(kg / 1000000).toFixed(2)} tonnes`;
  }
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} t`;
  }
  return `${kg} kg`;
};
