const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  addToWatchlist,
  removeFromWatchlist,
  toggleLike,
  addComment,
  getUpcomingLaunches,
  getMissionStats,
} = require('../controllers/missionController');

const router = express.Router();

// Public routes
router.get('/', getMissions);
router.get('/stats', getMissionStats);
router.get('/upcoming', getUpcomingLaunches);
router.get('/:id', getMissionById);

// Protected routes
router.use(protect);

router.post('/:id/watchlist', addToWatchlist);
router.delete('/:id/watchlist', removeFromWatchlist);
router.post('/:id/like', toggleLike);
router.post('/:id/comments',
  [body('text').notEmpty().withMessage('Comment text is required')],
  addComment
);

// Admin only routes
router.post('/',
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Mission name is required'),
    body('organization').isIn(['NASA', 'SpaceX', 'ISRO', 'ESA', 'Roscosmos', 'Other']).withMessage('Invalid organization'),
    body('launchDate').isISO8601().withMessage('Valid launch date is required'),
  ],
  createMission
);

router.put('/:id',
  authorize('admin'),
  updateMission
);

router.delete('/:id',
  authorize('admin'),
  deleteMission
);

module.exports = router;
