module.exports = {
  ROLES: {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
  },

  MISSION_STATUS: {
    UPCOMING: 'Upcoming',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    ABORTED: 'Aborted',
  },

  ORGANIZATIONS: {
    NASA: 'NASA',
    SPACEX: 'SpaceX',
    ISRO: 'ISRO',
    ESA: 'ESA',
    ROSCOSMOS: 'Roscosmos',
    OTHER: 'Other',
  },

  MISSION_TYPES: {
    SATELLITE_DEPLOYMENT: 'Satellite Deployment',
    CREWED_MISSION: 'Crewed Mission',
    CARGO_RESUPPLY: 'Cargo Resupply',
    PLANETARY_EXPLORATION: 'Planetary Exploration',
    SPACE_TELESCOPE: 'Space Telescope',
    OTHER: 'Other',
  },

  QUIZ_DIFFICULTY: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
  },

  ACHIEVEMENTS: {
    FIRST_LOGIN: 'First Login',
    PROFILE_COMPLETE: 'Profile Complete',
    FIRST_MISSION_WATCH: 'First Mission Watch',
    FIRST_POST: 'First Post',
    QUIZ_MASTER: 'Quiz Master',
    SPACE_EXPLORER: 'Space Explorer',
    COMMUNITY_STAR: 'Community Star',
  },

  CACHE_KEYS: {
    MISSIONS: 'missions',
    APOD: 'apod',
    MARS_ROVER: 'mars_rover',
    ASTEROIDS: 'asteroids',
    LEADERBOARD: 'leaderboard',
  },

  CACHE_TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
  },

  UPLOAD_LIMITS: {
    IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  },
};
