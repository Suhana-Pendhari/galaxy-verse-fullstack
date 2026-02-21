const validator = require('validator');

// Validate username
const isValidUsername = (username) => {
  return username && 
         username.length >= 3 && 
         username.length <= 30 && 
         /^[a-zA-Z0-9_]+$/.test(username);
};

// Validate email
const isValidEmail = (email) => {
  return email && validator.isEmail(email);
};

// Validate password strength
const isStrongPassword = (password) => {
  return password && 
         password.length >= 6 && 
         /^(?=.*[A-Za-z])(?=.*\d)/.test(password);
};

// Validate URL
const isValidUrl = (url) => {
  if (!url) return true; // Optional
  return validator.isURL(url);
};

// Validate date
const isValidDate = (date) => {
  return date && validator.isISO8601(date);
};

// Validate object ID
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(id);
};

// Validate pagination parameters
const isValidPagination = (page, limit) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  return !isNaN(pageNum) && pageNum > 0 &&
         !isNaN(limitNum) && limitNum > 0 && limitNum <= 100;
};

// Validate coordinates
const isValidCoordinates = (lat, lng) => {
  return lat && lng &&
         !isNaN(parseFloat(lat)) && 
         !isNaN(parseFloat(lng)) &&
         parseFloat(lat) >= -90 && parseFloat(lat) <= 90 &&
         parseFloat(lng) >= -180 && parseFloat(lng) <= 180;
};

// Validate mission status
const isValidMissionStatus = (status) => {
  const validStatuses = ['Upcoming', 'In Progress', 'Completed', 'Aborted', 'Delayed'];
  return validStatuses.includes(status);
};

// Validate organization
const isValidOrganization = (org) => {
  const validOrgs = ['NASA', 'SpaceX', 'ISRO', 'ESA', 'Roscosmos', 'Other'];
  return validOrgs.includes(org);
};

// Validate quiz difficulty
const isValidQuizDifficulty = (difficulty) => {
  const validDifficulties = ['easy', 'medium', 'hard'];
  return validDifficulties.includes(difficulty);
};

// Validate quiz category
const isValidQuizCategory = (category) => {
  const validCategories = [
    'Solar System',
    'Stars & Galaxies',
    'Space Missions',
    'Astronauts',
    'Space Technology',
    'Astronomy',
    'General Space',
  ];
  return validCategories.includes(category);
};

// Validate role
const isValidRole = (role) => {
  const validRoles = ['user', 'moderator', 'admin'];
  return validRoles.includes(role);
};

// Sanitize HTML content
const sanitizeHtml = (content) => {
  if (!content) return content;
  
  // Remove potentially dangerous tags and attributes
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');
};

// Validate file type
const isValidFileType = (filename, allowedTypes) => {
  const ext = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(ext);
};

// Validate file size
const isValidFileSize = (size, maxSize) => {
  return size <= maxSize;
};

// Validate color hex
const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

module.exports = {
  isValidUsername,
  isValidEmail,
  isStrongPassword,
  isValidUrl,
  isValidDate,
  isValidObjectId,
  isValidPagination,
  isValidCoordinates,
  isValidMissionStatus,
  isValidOrganization,
  isValidQuizDifficulty,
  isValidQuizCategory,
  isValidRole,
  sanitizeHtml,
  isValidFileType,
  isValidFileSize,
  isValidHexColor,
};
