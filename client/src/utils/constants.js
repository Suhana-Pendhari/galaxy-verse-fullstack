// API Constants
export const API = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  FAVORITES: 'favorites',
  WATCHLIST: 'watchlist',
  SETTINGS: 'settings',
  CART: 'cart',
  RECENT_SEARCHES: 'recent_searches',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  MISSIONS: '/missions',
  MISSION_DETAILS: '/missions/:id',
  SPACE_DATA: '/space-data',
  SOLAR_SYSTEM: '/solar-system',
  COMMUNITY: '/community',
  POST_DETAILS: '/community/post/:id',
  CREATE_POST: '/community/create',
  QUIZ: '/quiz',
  QUIZ_TAKE: '/quiz/:id',
  QUIZ_RESULTS: '/quiz/:id/results',
  SATELLITE: '/satellite',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_MISSIONS: '/admin/missions',
  ADMIN_POSTS: '/admin/posts',
  ADMIN_MODERATION: '/admin/moderation',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_SETTINGS: '/admin/settings',
  NOT_FOUND: '/404',
};

// User Roles
export const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

// Mission Status
export const MISSION_STATUS = {
  UPCOMING: 'Upcoming',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ABORTED: 'Aborted',
  DELAYED: 'Delayed',
};

// Mission Organizations
export const ORGANIZATIONS = {
  NASA: 'NASA',
  SPACEX: 'SpaceX',
  ISRO: 'ISRO',
  ESA: 'ESA',
  ROSCOSMOS: 'Roscosmos',
  CNSA: 'CNSA',
  JAXA: 'JAXA',
  OTHER: 'Other',
};

// Mission Types
export const MISSION_TYPES = {
  SATELLITE_DEPLOYMENT: 'Satellite Deployment',
  CREWED_MISSION: 'Crewed Mission',
  CARGO_RESUPPLY: 'Cargo Resupply',
  PLANETARY_EXPLORATION: 'Planetary Exploration',
  SPACE_TELESCOPE: 'Space Telescope',
  SPACE_STATION: 'Space Station',
  TEST_FLIGHT: 'Test Flight',
  OTHER: 'Other',
};

// Quiz Categories
export const QUIZ_CATEGORIES = {
  SOLAR_SYSTEM: 'Solar System',
  STARS_GALAXIES: 'Stars & Galaxies',
  SPACE_MISSIONS: 'Space Missions',
  ASTRONAUTS: 'Astronauts',
  SPACE_TECHNOLOGY: 'Space Technology',
  ASTRONOMY: 'Astronomy',
  GENERAL_SPACE: 'General Space',
};

// Quiz Difficulties
export const QUIZ_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

// Community Categories
export const COMMUNITY_CATEGORIES = {
  SPACE_NEWS: 'Space News',
  MISSION_UPDATE: 'Mission Update',
  ASTRONOMY: 'Astronomy',
  TECHNOLOGY: 'Technology',
  EDUCATION: 'Education',
  DISCUSSION: 'Discussion',
  OTHER: 'Other',
};

// Satellite Orbit Types
export const ORBIT_TYPES = {
  LEO: 'LEO',
  MEO: 'MEO',
  GEO: 'GEO',
  ELLIPTICAL: 'Elliptical',
};

// Theme Options
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  COSMIC: 'cosmic',
  AURORA: 'aurora',
  NEBULA: 'nebula',
  MIDNIGHT: 'midnight',
  SUNSET: 'sunset',
  GALAXY: 'galaxy',
};

// Languages
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  HI: 'hi',
  ZH: 'zh',
  JA: 'ja',
  RU: 'ru',
};

// Date Formats
export const DATE_FORMATS = {
  DEFAULT: 'PPP',
  SHORT: 'PP',
  LONG: 'PPPP',
  TIME: 'p',
  DATETIME: 'PPP p',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  FILENAME: 'yyyy-MM-dd-HH-mm-ss',
};

// Number Formats
export const NUMBER_FORMATS = {
  DECIMAL: '0,0.00',
  INTEGER: '0,0',
  PERCENTAGE: '0.00%',
  CURRENCY: '$0,0.00',
  SCIENTIFIC: '0.[00]E+0',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [10, 20, 50, 100],
  MAX_LIMIT: 100,
};

// File Upload
export const UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'text/plain'],
};

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: 'Operation completed successfully!',
  ERROR: 'An error occurred. Please try again.',
  WARNING: 'Please check your input and try again.',
  INFO: 'Processing your request...',
  LOGIN_SUCCESS: 'Welcome back! 🚀',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTER_SUCCESS: 'Account created successfully! Please check your email.',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
  POST_CREATED: 'Post created successfully!',
  POST_UPDATED: 'Post updated successfully',
  POST_DELETED: 'Post deleted successfully',
  COMMENT_ADDED: 'Comment added successfully',
  COMMENT_DELETED: 'Comment deleted successfully',
  MISSION_ADDED_TO_WATCHLIST: 'Mission added to watchlist',
  MISSION_REMOVED_FROM_WATCHLIST: 'Mission removed from watchlist',
  QUIZ_STARTED: 'Quiz started! Good luck!',
  QUIZ_SUBMITTED: 'Quiz submitted successfully',
  FAVORITE_ADDED: 'Added to favorites',
  FAVORITE_REMOVED: 'Removed from favorites',
  FOLLOW_SUCCESS: 'Now following user',
  UNFOLLOW_SUCCESS: 'Unfollowed user',
  REPORT_SENT: 'Report sent successfully',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please login to continue',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already exists',
  USERNAME_EXISTS: 'Username already exists',
  WEAK_PASSWORD: 'Password is too weak',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_TOKEN: 'Invalid or expired token',
  SESSION_EXPIRED: 'Session expired. Please login again',
  RATE_LIMIT: 'Too many requests. Please try again later',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'File type not supported',
};

// Validation Rules
export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
  TITLE_MAX_LENGTH: 200,
  CONTENT_MAX_LENGTH: 5000,
  COMMENT_MAX_LENGTH: 1000,
  TAG_MAX_LENGTH: 50,
  MAX_TAGS: 10,
};

// Cache Keys
export const CACHE_KEYS = {
  MISSIONS: 'missions',
  MISSION: 'mission',
  POSTS: 'posts',
  POST: 'post',
  COMMENTS: 'comments',
  QUIZZES: 'quizzes',
  QUIZ: 'quiz',
  LEADERBOARD: 'leaderboard',
  APOD: 'apod',
  MARS_ROVER: 'mars_rover',
  ASTEROIDS: 'asteroids',
  SATELLITES: 'satellites',
  ISS: 'iss',
  USER: 'user',
  USERS: 'users',
  STATS: 'stats',
  TRENDING: 'trending',
  NOTIFICATIONS: 'notifications',
};

// Socket Events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  JOIN_MISSION: 'join-mission',
  LEAVE_MISSION: 'leave-mission',
  JOIN_QUIZ: 'join-quiz',
  LEAVE_QUIZ: 'leave-quiz',
  MISSION_UPDATED: 'mission-updated',
  MISSION_COMMENT: 'mission-comment',
  QUIZ_STARTED: 'quiz-started',
  QUIZ_ANSWER: 'quiz-answer',
  QUIZ_SUBMITTED: 'quiz-submitted',
  NEW_POST: 'new-post',
  NEW_COMMENT: 'new-comment',
  LIKE_UPDATED: 'like-updated',
  NOTIFICATION: 'notification',
  ISS_POSITION: 'iss-position-update',
  SATELLITE_UPDATED: 'satellite-data-updated',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  TYPING: 'typing',
  STOP_TYPING: 'stop-typing',
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#6b21a5',
  SECONDARY: '#3b0764',
  ACCENT: '#f59e0b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  GRAY: '#6b7280',
  LIGHT: '#9ca3af',
  DARK: '#1f2937',
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRADIENT: ['#6b21a5', '#f59e0b', '#3b0764'],
};

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
};

// Breakpoints (Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Z-Index Levels
export const Z_INDEX = {
  BASE: 0,
  ABOVE: 10,
  HEADER: 50,
  DROPDOWN: 100,
  MODAL: 1000,
  TOOLTIP: 1500,
  TOAST: 2000,
  LOADER: 9999,
};
