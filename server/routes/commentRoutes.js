const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike,
  reportComment,
} = require('../controllers/commentController');

const router = express.Router();

// Public routes
router.get('/:targetType/:targetId', getComments);

// Protected routes
router.use(protect);

router.post('/',
  [
    body('content').notEmpty().withMessage('Comment content is required').isLength({ max: 1000 }),
    body('targetType').isIn(['post', 'mission', 'comment']).withMessage('Invalid target type'),
    body('targetId').notEmpty().withMessage('Target ID is required'),
  ],
  createComment
);

router.put('/:id',
  [
    body('content').notEmpty().withMessage('Comment content is required'),
  ],
  updateComment
);

router.delete('/:id', deleteComment);
router.post('/:id/like', toggleCommentLike);
router.post('/:id/report',
  [
    body('reason').notEmpty().withMessage('Reason is required'),
  ],
  reportComment
);

module.exports = router;
