const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getQuizzes,
  getQuizById,
  startQuiz,
  submitQuiz,
  getLeaderboard,
  getUserHistory,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require('../controllers/quizController');

const router = express.Router();

// Public routes
router.get('/', getQuizzes);
router.get('/:id/leaderboard', getLeaderboard);

// Protected routes
router.use(protect);

router.get('/user/history', getUserHistory);
router.get('/:id', getQuizById);
router.post('/:id/start', startQuiz);
router.post('/:id/submit',
  [
    body('answers').isArray().withMessage('Answers must be an array'),
    body('timeSpent').isNumeric().withMessage('Time spent must be a number'),
  ],
  submitQuiz
);

// Admin only routes
router.post('/',
  authorize('admin'),
  [
    body('title').notEmpty().withMessage('Quiz title is required'),
    body('description').notEmpty().withMessage('Quiz description is required'),
    body('category').isIn([
      'Solar System',
      'Stars & Galaxies',
      'Space Missions',
      'Astronauts',
      'Space Technology',
      'Astronomy',
      'General Space',
    ]).withMessage('Invalid category'),
    body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
    body('timeLimit').isNumeric().withMessage('Time limit must be a number'),
    body('questions').isArray().withMessage('Questions must be an array'),
    body('passingScore').isNumeric().withMessage('Passing score must be a number'),
  ],
  createQuiz
);

router.put('/:id',
  authorize('admin'),
  updateQuiz
);

router.delete('/:id',
  authorize('admin'),
  deleteQuiz
);

module.exports = router;
