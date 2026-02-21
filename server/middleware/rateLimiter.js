const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after an hour',
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Mission routes rate limiter
const missionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: {
    success: false,
    message: 'Too many mission requests, please slow down',
  },
});

// Comment creation rate limiter
const commentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 comments per minute
  message: {
    success: false,
    message: 'Too many comments, please wait a moment',
  },
});

// Post creation rate limiter
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 posts per hour
  message: {
    success: false,
    message: 'Too many posts created, please wait an hour',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  missionLimiter,
  commentLimiter,
  postLimiter,
};
