const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getUserProfile,
  updateProfile,
  updateProfilePicture,
  updateCoverPicture,
  toggleFollow,
  getFollowers,
  getFollowing,
  getUserPosts,
  getWatchlist,
  getAchievements,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  searchUsers,
  getSuggestions,
  deleteAccount,
} = require('../controllers/userController');

const router = express.Router();

// Public routes
router.get('/search', searchUsers);
router.get('/:username', getUserProfile);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.get('/:id/posts', getUserPosts);

// Protected routes
router.use(protect);

router.get('/profile/watchlist', getWatchlist);
router.get('/profile/achievements', getAchievements);
router.get('/profile/notifications', getNotifications);
router.put('/profile/notifications/:id/read', markNotificationRead);
router.put('/profile/notifications/read-all', markAllNotificationsRead);
router.get('/suggestions/follow', getSuggestions);

router.put('/profile',
  [
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
    body('website').optional().isURL().withMessage('Please enter a valid URL'),
    body('location').optional().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  ],
  updateProfile
);

router.put('/profile-picture',
  upload.single('image'),
  updateProfilePicture
);

router.put('/cover-picture',
  upload.single('image'),
  updateCoverPicture
);

router.post('/:id/follow', toggleFollow);

router.delete('/account', deleteAccount);

module.exports = router;
