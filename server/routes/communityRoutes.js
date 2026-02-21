const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  togglePostLike,
  toggleSavePost,
  reportPost,
} = require('../controllers/communityController');

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/:id', getPostById);

// Protected routes
router.use(protect);

router.post('/',
  upload.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('content').notEmpty().withMessage('Content is required').isLength({ max: 5000 }),
    body('category').isIn([
      'Space News',
      'Mission Update',
      'Astronomy',
      'Technology',
      'Education',
      'Discussion',
      'Other',
    ]).withMessage('Invalid category'),
  ],
  createPost
);

router.put('/:id',
  upload.single('image'),
  updatePost
);

router.delete('/:id', deletePost);
router.post('/:id/like', togglePostLike);
router.post('/:id/save', toggleSavePost);
router.post('/:id/report',
  [
    body('reason').notEmpty().withMessage('Reason is required'),
    body('description').optional(),
  ],
  reportPost
);

module.exports = router;
