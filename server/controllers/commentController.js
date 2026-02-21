const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Mission = require('../models/Mission');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const { getIO } = require('../config/socket');

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { content, targetType, targetId, parentComment } = req.body;

    // Validate target exists
    let targetModel;
    let target;
    
    switch (targetType) {
      case 'post':
        target = await Post.findById(targetId);
        targetModel = 'Post';
        break;
      case 'mission':
        target = await Mission.findById(targetId);
        targetModel = 'Mission';
        break;
      case 'comment':
        target = await Comment.findById(targetId);
        targetModel = 'Comment';
        break;
      default:
        return res.status(400).json({ 
          success: false,
          message: 'Invalid target type' 
        });
    }

    if (!target) {
      return res.status(404).json({ 
        success: false,
        message: `${targetType} not found` 
      });
    }

    // Create comment
    const comment = await Comment.create({
      content,
      author: req.user.id,
      targetType,
      targetId,
      targetModel,
      parentComment,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Add to parent's replies if it's a reply
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (parent) {
        parent.replies.push(comment._id);
        parent.replyCount += 1;
        await parent.save();
      }
    }

    // Update target's comment count
    if (targetType === 'post') {
      target.stats.comments += 1;
      await target.save();
    } else if (targetType === 'mission') {
      target.stats.commentCount += 1;
      await target.save();
    }

    // Populate author details
    await comment.populate('author', 'username profilePicture');

    // Create notification for target owner
    if (target.author && target.author.toString() !== req.user.id) {
      await Notification.create({
        recipient: target.author,
        sender: req.user.id,
        type: 'comment',
        title: 'New Comment',
        message: `${req.user.username} commented on your ${targetType}`,
        data: {
          entityId: target._id,
          entityType: targetType,
          commentId: comment._id,
        },
      });

      // Emit socket notification
      const io = getIO();
      io.to(`user-${target.author}`).emit('notification', {
        type: 'comment',
        from: req.user.username,
        content: content.substring(0, 50),
        targetType,
      });
    }

    // Emit socket event for new comment
    const io = getIO();
    io.to(`${targetType}-${targetId}`).emit('new-comment', comment);

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get comments for a target
// @route   GET /api/comments/:targetType/:targetId
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get top-level comments only (no parent)
    const filter = {
      targetType,
      targetId,
      parentComment: null,
      moderationStatus: 'approved',
      isHidden: false,
    };

    const comments = await Comment.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('author', 'username profilePicture')
      .populate({
        path: 'replies',
        options: { limit: 3, sort: { createdAt: -1 } },
        populate: { path: 'author', select: 'username profilePicture' },
      });

    const total = await Comment.countDocuments(filter);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      });
    }

    // Check ownership
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this comment' 
      });
    }

    // Save edit history
    comment.editHistory.push({
      content: comment.content,
      editedAt: new Date(),
    });

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    // Emit socket event
    const io = getIO();
    io.to(`${comment.targetType}-${comment.targetId}`).emit('comment-updated', comment);

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      });
    }

    // Check ownership or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this comment' 
      });
    }

    // Delete all replies recursively
    const deleteReplies = async (commentId) => {
      const replies = await Comment.find({ parentComment: commentId });
      for (const reply of replies) {
        await deleteReplies(reply._id);
        await reply.deleteOne();
      }
    };

    await deleteReplies(comment._id);

    // Update target's comment count
    if (comment.targetType === 'post') {
      await Post.findByIdAndUpdate(comment.targetId, {
        $inc: { 'stats.comments': -1 },
      });
    } else if (comment.targetType === 'mission') {
      await Mission.findByIdAndUpdate(comment.targetId, {
        $inc: { 'stats.commentCount': -1 },
      });
    }

    // Remove from parent's replies if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id },
        $inc: { replyCount: -1 },
      });
    }

    await comment.deleteOne();

    // Emit socket event
    const io = getIO();
    io.to(`${comment.targetType}-${comment.targetId}`).emit('comment-deleted', {
      commentId: comment._id,
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Like/unlike comment
// @route   POST /api/comments/:id/like
// @access  Private
exports.toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      });
    }

    const isLiked = comment.likes.includes(req.user.id);

    if (isLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
      comment.likeCount -= 1;
    } else {
      comment.likes.push(req.user.id);
      comment.likeCount += 1;

      // Create notification for comment author
      if (comment.author.toString() !== req.user.id) {
        await Notification.create({
          recipient: comment.author,
          sender: req.user.id,
          type: 'like',
          title: 'New Like',
          message: `${req.user.username} liked your comment`,
          data: {
            entityId: comment.targetId,
            entityType: comment.targetType,
            commentId: comment._id,
          },
        });

        const io = getIO();
        io.to(`user-${comment.author}`).emit('notification', {
          type: 'like',
          from: req.user.username,
          targetType: 'comment',
        });
      }
    }

    await comment.save();

    res.json({
      success: true,
      isLiked: !isLiked,
      likeCount: comment.likeCount,
    });
  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Report comment
// @route   POST /api/comments/:id/report
// @access  Private
exports.reportComment = async (req, res) => {
  try {
    const { reason, description } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ 
        success: false,
        message: 'Comment not found' 
      });
    }

    // Check if user already reported
    const alreadyReported = comment.reports.some(
      report => report.user.toString() === req.user.id
    );

    if (alreadyReported) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already reported this comment' 
      });
    }

    comment.reports.push({
      user: req.user.id,
      reason,
      description,
    });
    comment.reportCount += 1;

    // Auto-hide comment if multiple reports
    if (comment.reportCount >= 3) {
      comment.moderationStatus = 'pending';
      comment.isHidden = true;
    }

    await comment.save();

    res.json({
      success: true,
      message: 'Comment reported successfully',
    });
  } catch (error) {
    console.error('Report comment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};
