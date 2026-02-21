const User = require('../models/User');
const Post = require('../models/Post');
const Mission = require('../models/Mission');
const Quiz = require('../models/Quiz');
const Comment = require('../models/Comment');
const AdminLog = require('../models/AdminLog');
const { getIO } = require('../config/socket');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const thisWeek = new Date(now.setDate(now.getDate() - 7));
    const thisMonth = new Date(now.setMonth(now.getMonth() - 1));

    // User statistics
    const userStats = await User.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          newToday: [
            { $match: { createdAt: { $gte: today } } },
            { $count: 'count' },
          ],
          newThisWeek: [
            { $match: { createdAt: { $gte: thisWeek } } },
            { $count: 'count' },
          ],
          newThisMonth: [
            { $match: { createdAt: { $gte: thisMonth } } },
            { $count: 'count' },
          ],
          byRole: [
            { $group: { _id: '$role', count: { $sum: 1 } } },
          ],
          activeToday: [
            { $match: { lastLogin: { $gte: today } } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    // Post statistics
    const postStats = await Post.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          pendingModeration: [
            { $match: { moderationStatus: 'pending' } },
            { $count: 'count' },
          ],
          reported: [
            { $match: { reportCount: { $gt: 0 } } },
            { $count: 'count' },
          ],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
          ],
        },
      },
    ]);

    // Mission statistics
    const missionStats = await Mission.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          byOrganization: [
            { $group: { _id: '$organization', count: { $sum: 1 } } },
          ],
          upcoming: [
            { $match: { status: 'Upcoming' } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    // Comment statistics
    const commentStats = await Comment.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          pendingModeration: [
            { $match: { moderationStatus: 'pending' } },
            { $count: 'count' },
          ],
          reported: [
            { $match: { reportCount: { $gt: 0 } } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    // Quiz statistics
    const quizStats = await Quiz.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          totalAttempts: [{ $group: { _id: null, total: { $sum: '$attempts' } } }],
          averageScore: [{ $group: { _id: null, avg: { $avg: '$averageScore' } } }],
        },
      },
    ]);

    // Recent activity
    const recentActivity = await AdminLog.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('admin', 'username')
      .populate('targetId');

    res.json({
      success: true,
      data: {
        users: userStats[0],
        posts: postStats[0],
        missions: missionStats[0],
        comments: commentStats[0],
        quizzes: {
          total: quizStats[0]?.total[0]?.count || 0,
          totalAttempts: quizStats[0]?.totalAttempts[0]?.total || 0,
          averageScore: quizStats[0]?.averageScore[0]?.avg || 0,
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};
    
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (status === 'locked') filter.lockUntil = { $gt: new Date() };
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-password -resetPasswordToken -emailVerificationToken');

    const total = await User.countDocuments(filter);

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
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role' 
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Log admin action
    await AdminLog.create({
      admin: req.user.id,
      action: 'user_role_changed',
      targetType: 'user',
      targetId: user._id,
      changes: { oldRole, newRole: role },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Notify user
    const io = getIO();
    io.to(`user-${user._id}`).emit('role-updated', {
      newRole: role,
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user: { id: user._id, username: user.username, role: user.role } },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Toggle user status (ban/unban)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Don't allow banning other admins
    if (user.role === 'admin' && req.user.id !== id) {
      return res.status(403).json({ 
        success: false,
        message: 'Cannot ban another admin' 
      });
    }

    user.isActive = !user.isActive;
    if (!user.isActive) {
      user.lockUntil = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      user.lockUntil = undefined;
      user.loginAttempts = 0;
    }
    
    await user.save();

    // Log admin action
    await AdminLog.create({
      admin: req.user.id,
      action: user.isActive ? 'user_unbanned' : 'user_banned',
      targetType: 'user',
      targetId: user._id,
      reason,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Notify user
    const io = getIO();
    io.to(`user-${user._id}`).emit('status-updated', {
      isActive: user.isActive,
      reason,
    });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'banned'} successfully`,
      data: { isActive: user.isActive },
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get reported content
// @route   GET /api/admin/reported-content
// @access  Private/Admin
exports.getReportedContent = async (req, res) => {
  try {
    const { type = 'all' } = req.query;

    const results = {};

    // Get reported posts
    if (type === 'all' || type === 'posts') {
      results.posts = await Post.find({ reportCount: { $gt: 0 } })
        .sort({ reportCount: -1 })
        .limit(50)
        .populate('author', 'username')
        .populate('reports.user', 'username');
    }

    // Get reported comments
    if (type === 'all' || type === 'comments') {
      results.comments = await Comment.find({ reportCount: { $gt: 0 } })
        .sort({ reportCount: -1 })
        .limit(50)
        .populate('author', 'username')
        .populate('reports.user', 'username');
    }

    // Get content pending moderation
    if (type === 'all' || type === 'pending') {
      results.pendingPosts = await Post.find({ moderationStatus: 'pending' })
        .sort({ createdAt: 1 })
        .limit(50)
        .populate('author', 'username');

      results.pendingComments = await Comment.find({ moderationStatus: 'pending' })
        .sort({ createdAt: 1 })
        .limit(50)
        .populate('author', 'username');
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Get reported content error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Moderate content
// @route   POST /api/admin/moderate
// @access  Private/Admin
exports.moderateContent = async (req, res) => {
  try {
    const { type, id, action, reason } = req.body;

    let content;
    let Model;

    switch (type) {
      case 'post':
        Model = Post;
        break;
      case 'comment':
        Model = Comment;
        break;
      default:
        return res.status(400).json({ 
          success: false,
          message: 'Invalid content type' 
        });
    }

    content = await Model.findById(id);
    if (!content) {
      return res.status(404).json({ 
        success: false,
        message: `${type} not found` 
      });
    }

    const oldStatus = content.moderationStatus;

    switch (action) {
      case 'approve':
        content.moderationStatus = 'approved';
        content.isHidden = false;
        break;
      case 'reject':
        content.moderationStatus = 'rejected';
        content.isHidden = true;
        break;
      case 'delete':
        await content.deleteOne();
        break;
      default:
        return res.status(400).json({ 
          success: false,
          message: 'Invalid action' 
        });
    }

    if (action !== 'delete') {
      content.moderatedBy = req.user.id;
      content.moderationReason = reason;
      content.moderatedAt = new Date();
      await content.save();
    }

    // Log admin action
    await AdminLog.create({
      admin: req.user.id,
      action: `${type}_${action}`,
      targetType: type,
      targetId: id,
      changes: { oldStatus, newStatus: content.moderationStatus },
      reason,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Notify content author
    if (content.author) {
      const io = getIO();
      io.to(`user-${content.author}`).emit('content-moderated', {
        type,
        action,
        reason,
      });
    }

    res.json({
      success: true,
      message: `Content ${action}d successfully`,
    });
  } catch (error) {
    console.error('Moderate content error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getSystemLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      admin,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (action) filter.action = action;
    if (admin) filter.admin = admin;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AdminLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('admin', 'username')
      .populate('targetId');

    const total = await AdminLog.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const { period = 'week' } = req.query;

    let startDate;
    const endDate = new Date();
    const groupFormat = {};

    switch (period) {
      case 'day':
        startDate = new Date(endDate - 24 * 60 * 60 * 1000);
        groupFormat = { hour: { $hour: '$createdAt' } };
        break;
      case 'week':
        startDate = new Date(endDate - 7 * 24 * 60 * 60 * 1000);
        groupFormat = { day: { $dayOfMonth: '$createdAt' }, month: { $month: '$createdAt' } };
        break;
      case 'month':
        startDate = new Date(endDate - 30 * 24 * 60 * 60 * 1000);
        groupFormat = { day: { $dayOfMonth: '$createdAt' } };
        break;
      case 'year':
        startDate = new Date(endDate - 365 * 24 * 60 * 60 * 1000);
        groupFormat = { month: { $month: '$createdAt' } };
        break;
      default:
        startDate = new Date(endDate - 7 * 24 * 60 * 60 * 1000);
    }

    // User registrations over time
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Post creation over time
    const postCreation = await Post.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Most viewed missions
    const topMissions = await Mission.find()
      .sort({ 'stats.viewCount': -1 })
      .limit(10)
      .select('name organization stats.viewCount');

    // Most active users
    const activeUsers = await User.aggregate([
      {
        $project: {
          username: 1,
          profilePicture: 1,
          postCount: { $size: { $ifNull: ['$posts', []] } },
          commentCount: { $size: { $ifNull: ['$comments', []] } },
          lastLogin: 1,
        },
      },
      {
        $addFields: {
          totalActivity: { $add: ['$postCount', '$commentCount'] },
        },
      },
      { $sort: { totalActivity: -1 } },
      { $limit: 20 },
    ]);

    // Popular tags
    const popularTags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    res.json({
      success: true,
      data: {
        period,
        userRegistrations,
        postCreation,
        topMissions,
        activeUsers,
        popularTags,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};
