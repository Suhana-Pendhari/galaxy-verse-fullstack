const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { getIO } = require('../config/socket');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Create a new post
// @route   POST /api/community/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { title, content, tags, category } = req.body;

    // Handle image upload if present
    let featuredImage = null;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, 'posts');
      featuredImage = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };
    }

    const post = await Post.create({
      title,
      content,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category,
      author: req.user.id,
      featuredImage,
    });

    // Populate author details
    await post.populate('author', 'username profilePicture');

    // Emit socket event for new post
    const io = getIO();
    io.emit('new-post', post);

    // Award achievement if first post
    const userPosts = await Post.countDocuments({ author: req.user.id });
    if (userPosts === 1) {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          achievements: {
            name: 'First Post',
            description: 'Created your first community post',
            earnedAt: new Date(),
          },
        },
      });

      io.to(`user-${req.user.id}`).emit('achievement-unlocked', {
        name: 'First Post',
        description: 'Created your first community post',
      });
    }

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get all posts with filters and pagination
// @route   GET /api/community/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      author,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter
    const filter = { isPublished: true, moderationStatus: 'approved' };
    
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (author) filter.author = author;
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const posts = await Post.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('author', 'username profilePicture')
      .populate({
        path: 'comments',
        options: { limit: 3, sort: { createdAt: -1 } },
        populate: { path: 'user', select: 'username profilePicture' },
      });

    const total = await Post.countDocuments(filter);

    // Get trending tags
    const trendingTags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: posts,
      trendingTags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get single post by ID
// @route   GET /api/community/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePicture bio followers following')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: [
          { path: 'user', select: 'username profilePicture' },
          { 
            path: 'replies',
            populate: { path: 'user', select: 'username profilePicture' }
          }
        ],
      });

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    // Increment view count
    post.stats.views += 1;
    await post.save();

    // Check if current user liked the post
    let isLiked = false;
    let isSaved = false;
    
    if (req.user) {
      isLiked = post.likes.includes(req.user.id);
      const user = await User.findById(req.user.id);
      isSaved = user.savedPosts?.includes(post._id);
    }

    res.json({
      success: true,
      data: post,
      userInteraction: {
        isLiked,
        isSaved,
      },
    });
  } catch (error) {
    console.error('Get post by id error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Update post
// @route   PUT /api/community/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    // Check ownership or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this post' 
      });
    }

    const { title, content, tags, category } = req.body;

    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      if (post.featuredImage?.publicId) {
        await deleteFromCloudinary(post.featuredImage.publicId);
      }
      
      const uploadResult = await uploadToCloudinary(req.file.path, 'posts');
      post.featuredImage = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags ? tags.split(',').map(tag => tag.trim()) : post.tags;
    post.category = category || post.category;
    post.isEdited = true;
    post.editHistory.push({
      content: post.content,
      editedAt: new Date(),
    });

    await post.save();

    // Emit socket event
    const io = getIO();
    io.emit('post-updated', post);

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/community/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    // Check ownership or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this post' 
      });
    }

    // Delete featured image from cloudinary
    if (post.featuredImage?.publicId) {
      await deleteFromCloudinary(post.featuredImage.publicId);
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ targetId: post._id, targetType: 'post' });

    await post.deleteOne();

    // Emit socket event
    const io = getIO();
    io.emit('post-deleted', { postId: req.params.id });

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Like/unlike post
// @route   POST /api/community/posts/:id/like
// @access  Private
exports.togglePostLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    const isLiked = post.likes.includes(req.user.id);
    const io = getIO();

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
      post.stats.likes -= 1;
      
      // Remove notification if exists
      await Notification.findOneAndDelete({
        recipient: post.author,
        sender: req.user.id,
        type: 'like',
        'data.entityId': post._id,
      });
    } else {
      // Like
      post.likes.push(req.user.id);
      post.stats.likes += 1;

      // Create notification for post author
      if (post.author.toString() !== req.user.id) {
        await Notification.create({
          recipient: post.author,
          sender: req.user.id,
          type: 'like',
          title: 'New Like',
          message: `${req.user.username} liked your post "${post.title.substring(0, 50)}..."`,
          data: {
            entityId: post._id,
            entityType: 'post',
          },
        });

        io.to(`user-${post.author}`).emit('notification', {
          type: 'like',
          from: req.user.username,
          postTitle: post.title,
        });
      }
    }

    await post.save();

    // Emit like update
    io.to(`post-${post._id}`).emit('like-updated', {
      postId: post._id,
      likeCount: post.likes.length,
      userId: req.user.id,
      action: isLiked ? 'unlike' : 'like',
    });

    res.json({
      success: true,
      isLiked: !isLiked,
      likeCount: post.likes.length,
    });
  } catch (error) {
    console.error('Toggle post like error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Save/unsave post
// @route   POST /api/community/posts/:id/save
// @access  Private
exports.toggleSavePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user.savedPosts) {
      user.savedPosts = [];
    }

    const isSaved = user.savedPosts.includes(post._id);

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== post._id.toString());
    } else {
      user.savedPosts.push(post._id);
    }

    await user.save();

    res.json({
      success: true,
      isSaved: !isSaved,
      savedCount: user.savedPosts.length,
    });
  } catch (error) {
    console.error('Toggle save post error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Report post
// @route   POST /api/community/posts/:id/report
// @access  Private
exports.reportPost = async (req, res) => {
  try {
    const { reason, description } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    // Check if user already reported
    const alreadyReported = post.reports.some(
      report => report.user.toString() === req.user.id
    );

    if (alreadyReported) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already reported this post' 
      });
    }

    post.reports.push({
      user: req.user.id,
      reason,
      description,
    });
    post.reportCount += 1;

    // Auto-hide post if multiple reports
    if (post.reportCount >= 5) {
      post.moderationStatus = 'pending';
      
      // Notify admins
      const admins = await User.find({ role: 'admin' });
      const io = getIO();
      admins.forEach(admin => {
        io.to(`user-${admin._id}`).emit('moderation-needed', {
          type: 'post',
          postId: post._id,
          reportCount: post.reportCount,
        });
      });
    }

    await post.save();

    res.json({
      success: true,
      message: 'Post reported successfully',
    });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};
