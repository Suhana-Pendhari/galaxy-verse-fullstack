const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const QuizAttempt = require('../models/QuizAttempt');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { getIO } = require('../config/socket');
const { validationResult } = require('express-validator');

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select('-password -email -resetPasswordToken -emailVerificationToken -loginAttempts -lockUntil')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Get user's posts
    const posts = await Post.find({ author: user._id, isPublished: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'username profilePicture');

    // Get user's quiz stats
    const quizAttempts = await QuizAttempt.find({ user: user._id })
      .populate('quiz', 'title category difficulty')
      .sort({ completedAt: -1 })
      .limit(5);

    // Calculate statistics
    const totalPosts = await Post.countDocuments({ author: user._id });
    const totalComments = await Comment.countDocuments({ author: user._id });
    const totalQuizAttempts = await QuizAttempt.countDocuments({ user: user._id });
    const avgQuizScore = await QuizAttempt.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, avg: { $avg: '$percentage' } } }
    ]);

    // Check if current user is following this user
    let isFollowing = false;
    let isOwnProfile = false;
    
    if (req.user) {
      isOwnProfile = req.user.id === user._id.toString();
      if (!isOwnProfile) {
        const currentUser = await User.findById(req.user.id);
        isFollowing = currentUser.following.includes(user._id);
      }
    }

    res.json({
      success: true,
      data: {
        user,
        posts,
        quizAttempts,
        stats: {
          totalPosts,
          totalComments,
          totalQuizAttempts,
          avgQuizScore: avgQuizScore[0]?.avg || 0,
          followersCount: user.followers.length,
          followingCount: user.following.length,
        },
        interaction: {
          isFollowing,
          isOwnProfile,
        },
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { bio, location, website, dateOfBirth } = req.body;

    const user = await User.findById(req.user.id);

    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;

    await user.save();

    // Emit profile update event
    const io = getIO();
    io.to(`user-${user._id}`).emit('profile-updated', {
      userId: user._id,
      updates: { bio, location, website },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        bio: user.bio,
        location: user.location,
        website: user.website,
        dateOfBirth: user.dateOfBirth,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Update profile picture
// @route   PUT /api/users/profile-picture
// @access  Private
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No image file provided' 
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old profile picture if not default
    if (user.profilePicture && !user.profilePicture.includes('default-avatar')) {
      const publicId = user.profilePicture.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId).catch(err => console.error('Error deleting old image:', err));
    }

    // Upload new image
    const uploadResult = await uploadToCloudinary(req.file.path, 'profiles');
    
    user.profilePicture = uploadResult.url;
    await user.save();

    // Emit profile picture update
    const io = getIO();
    io.emit('user-profile-picture-updated', {
      userId: user._id,
      profilePicture: user.profilePicture,
    });

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: { profilePicture: user.profilePicture },
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Update cover picture
// @route   PUT /api/users/cover-picture
// @access  Private
exports.updateCoverPicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No image file provided' 
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old cover picture if not default
    if (user.coverPicture && !user.coverPicture.includes('default-cover')) {
      const publicId = user.coverPicture.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId).catch(err => console.error('Error deleting old image:', err));
    }

    // Upload new image
    const uploadResult = await uploadToCloudinary(req.file.path, 'covers');
    
    user.coverPicture = uploadResult.url;
    await user.save();

    res.json({
      success: true,
      message: 'Cover picture updated successfully',
      data: { coverPicture: user.coverPicture },
    });
  } catch (error) {
    console.error('Update cover picture error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
exports.toggleFollow = async (req, res) => {
  try {
    const { id } = req.params;

    // Can't follow yourself
    if (id === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot follow yourself' 
      });
    }

    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const currentUser = await User.findById(req.user.id);

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        userId => userId.toString() !== id
      );
      userToFollow.followers = userToFollow.followers.filter(
        userId => userId.toString() !== req.user.id
      );
    } else {
      // Follow
      currentUser.following.push(id);
      userToFollow.followers.push(req.user.id);

      // Create notification
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: userToFollow._id,
        sender: req.user.id,
        type: 'follow',
        title: 'New Follower',
        message: `${currentUser.username} started following you`,
        data: {
          entityId: currentUser._id,
          entityType: 'user',
        },
      });

      // Emit socket notification
      const io = getIO();
      io.to(`user-${userToFollow._id}`).emit('notification', {
        type: 'follow',
        from: currentUser.username,
        message: `${currentUser.username} started following you`,
      });
    }

    await currentUser.save();
    await userToFollow.save();

    // Emit follow/unfollow event
    const io = getIO();
    io.to(`user-${id}`).emit('follow-updated', {
      userId: req.user.id,
      action: isFollowing ? 'unfollow' : 'follow',
      followerCount: userToFollow.followers.length,
    });

    res.json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: userToFollow.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
exports.getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(id)
      .populate({
        path: 'followers',
        select: 'username profilePicture bio',
        options: {
          limit: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit),
        },
      });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const total = user.followers.length;

    res.json({
      success: true,
      data: user.followers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
exports.getFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(id)
      .populate({
        path: 'following',
        select: 'username profilePicture bio',
        options: {
          limit: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit),
        },
      });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const total = user.following.length;

    res.json({
      success: true,
      data: user.following,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/users/:id/posts
// @access  Public
exports.getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ 
      author: id, 
      isPublished: true,
      moderationStatus: 'approved',
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('author', 'username profilePicture');

    const total = await Post.countDocuments({ 
      author: id, 
      isPublished: true,
      moderationStatus: 'approved',
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get user's watchlist
// @route   GET /api/users/watchlist
// @access  Private
exports.getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'watchlist',
        populate: {
          path: 'organization',
        },
      });

    res.json({
      success: true,
      data: user.watchlist,
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get user's achievements
// @route   GET /api/users/achievements
// @access  Private
exports.getAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('achievements');

    // Define all possible achievements
    const allAchievements = [
      { name: 'First Login', description: 'Logged in for the first time', icon: '🎮', condition: 'login' },
      { name: 'Profile Complete', description: 'Completed your profile', icon: '👤', condition: 'profile' },
      { name: 'First Mission Watch', description: 'Added a mission to watchlist', icon: '🚀', condition: 'watchlist' },
      { name: 'First Post', description: 'Created your first post', icon: '📝', condition: 'post' },
      { name: 'First Comment', description: 'Left your first comment', icon: '💬', condition: 'comment' },
      { name: 'Quiz Master', description: 'Passed your first quiz', icon: '🎯', condition: 'quiz' },
      { name: 'Space Explorer', description: 'Viewed 10 different space data items', icon: '🌌', condition: 'space_data' },
      { name: 'Social Butterfly', description: 'Gained 10 followers', icon: '🦋', condition: 'followers' },
      { name: 'Content Creator', description: 'Created 5 posts', icon: '✍️', condition: 'posts_5' },
      { name: 'Quiz Champion', description: 'Scored 100% on a quiz', icon: '🏆', condition: 'perfect_quiz' },
    ];

    // Mark which ones are unlocked
    const achievements = allAchievements.map(achievement => ({
      ...achievement,
      unlocked: user.achievements.some(a => a.name === achievement.name),
      earnedAt: user.achievements.find(a => a.name === achievement.name)?.earnedAt,
    }));

    res.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get user's notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const user = await User.findById(req.user.id)
      .populate({
        path: 'notifications',
        match: unreadOnly === 'true' ? { read: false } : {},
        options: {
          sort: { createdAt: -1 },
          limit: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit),
        },
        populate: {
          path: 'sender',
          select: 'username profilePicture',
        },
      });

    const total = unreadOnly === 'true'
      ? user.notifications.filter(n => !n.read).length
      : user.notifications.length;

    res.json({
      success: true,
      data: user.notifications,
      unreadCount: user.notifications.filter(n => !n.read).length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    
    const notification = user.notifications.id(id);
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id },
      { 
        $set: { 
          'notifications.$[elem].read': true,
          'notifications.$[elem].readAt': new Date(),
        } 
      },
      { 
        arrayFilters: [{ 'elem.read': false }],
        multi: true,
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
exports.searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ 
        success: false,
        message: 'Search query is required' 
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
      ],
      isActive: true,
    })
      .select('username profilePicture bio followers following')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
      ],
      isActive: true,
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get suggested users to follow
// @route   GET /api/users/suggestions
// @access  Private
exports.getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    // Get users that current user is not following
    const suggestions = await User.aggregate([
      {
        $match: {
          _id: { $ne: currentUser._id, $nin: currentUser.following },
          isActive: true,
        },
      },
      { $sample: { size: 10 } },
      {
        $project: {
          username: 1,
          profilePicture: 1,
          bio: 1,
          followersCount: { $size: '$followers' },
        },
      },
    ]);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Password is incorrect' 
      });
    }

    // Delete user's posts
    await Post.deleteMany({ author: user._id });

    // Delete user's comments
    await Comment.deleteMany({ author: user._id });

    // Remove user from followers/following lists
    await User.updateMany(
      { followers: user._id },
      { $pull: { followers: user._id } }
    );
    
    await User.updateMany(
      { following: user._id },
      { $pull: { following: user._id } }
    );

    // Delete profile pictures from cloudinary
    if (user.profilePicture && !user.profilePicture.includes('default-avatar')) {
      const profilePublicId = user.profilePicture.split('/').pop().split('.')[0];
      await deleteFromCloudinary(profilePublicId).catch(err => console.error('Error deleting profile picture:', err));
    }

    if (user.coverPicture && !user.coverPicture.includes('default-cover')) {
      const coverPublicId = user.coverPicture.split('/').pop().split('.')[0];
      await deleteFromCloudinary(coverPublicId).catch(err => console.error('Error deleting cover picture:', err));
    }

    // Delete user
    await user.deleteOne();

    // Emit user deleted event
    const io = getIO();
    io.emit('user-deleted', {
      userId: user._id,
      username: user.username,
    });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};
