const Mission = require('../models/Mission');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { getIO } = require('../config/socket');
const axios = require('axios');

// @desc    Get all missions with filters and pagination
// @route   GET /api/missions
// @access  Public
exports.getMissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      organization,
      status,
      missionType,
      search,
      sortBy = 'launchDate',
      sortOrder = 'asc',
      startDate,
      endDate,
    } = req.query;

    // Build filter object
    const filter = {};

    if (organization) filter.organization = organization;
    if (status) filter.status = status;
    if (missionType) filter.missionType = missionType;
    
    if (search) {
      filter.$text = { $search: search };
    }

    if (startDate || endDate) {
      filter.launchDate = {};
      if (startDate) filter.launchDate.$gte = new Date(startDate);
      if (endDate) filter.launchDate.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const missions = await Mission.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('comments.user', 'username profilePicture');

    // Get total count
    const total = await Mission.countDocuments(filter);

    // Update view counts (increment by 1 for each mission in this query)
    // This is just for analytics, we don't wait for it
    missions.forEach(mission => {
      mission.stats.viewCount += 1;
      mission.save().catch(err => console.error('Error updating view count:', err));
    });

    res.json({
      success: true,
      data: missions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get single mission by ID
// @route   GET /api/missions/:id
// @access  Public
exports.getMissionById = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('comments.user', 'username profilePicture')
      .populate('crew.image');

    if (!mission) {
      return res.status(404).json({ 
        success: false,
        message: 'Mission not found' 
      });
    }

    // Increment view count
    mission.stats.viewCount += 1;
    await mission.save();

    // Get real-time launch data if mission is upcoming
    let realtimeData = null;
    if (mission.status === 'Upcoming' && mission.organization === 'SpaceX') {
      try {
        // Fetch real-time data from SpaceX API
        const response = await axios.get(`https://api.spacexdata.com/v4/launches/next`);
        realtimeData = response.data;
      } catch (error) {
        console.error('Error fetching SpaceX data:', error);
      }
    }

    res.json({
      success: true,
      data: mission,
      realtimeData,
    });
  } catch (error) {
    console.error('Get mission by id error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Create new mission (Admin only)
// @route   POST /api/missions
// @access  Private/Admin
exports.createMission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const missionData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const mission = await Mission.create(missionData);

    // Emit socket event for new mission
    const io = getIO();
    io.emit('new-mission', mission);

    // Create notification for users who follow this organization
    const followers = await User.find({ 
      'watchlist.organization': mission.organization 
    });
    
    followers.forEach(user => {
      io.to(`user-${user._id}`).emit('mission-notification', {
        type: 'new_mission',
        mission: mission.name,
        organization: mission.organization,
      });
    });

    res.status(201).json({
      success: true,
      data: mission,
    });
  } catch (error) {
    console.error('Create mission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Update mission (Admin only)
// @route   PUT /api/missions/:id
// @access  Private/Admin
exports.updateMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({ 
        success: false,
        message: 'Mission not found' 
      });
    }

    const oldStatus = mission.status;
    const updatedMission = await Mission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Emit socket event for mission update
    const io = getIO();
    io.to(`mission-${mission._id}`).emit('mission-updated', updatedMission);

    // If status changed, notify watchers
    if (oldStatus !== updatedMission.status) {
      const watchers = await User.find({ 
        watchlist: mission._id 
      });
      
      watchers.forEach(user => {
        io.to(`user-${user._id}`).emit('mission-status-change', {
          missionId: mission._id,
          missionName: mission.name,
          oldStatus,
          newStatus: updatedMission.status,
        });
      });
    }

    res.json({
      success: true,
      data: updatedMission,
    });
  } catch (error) {
    console.error('Update mission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Delete mission (Admin only)
// @route   DELETE /api/missions/:id
// @access  Private/Admin
exports.deleteMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({ 
        success: false,
        message: 'Mission not found' 
      });
    }

    // Notify watchers before deletion
    const watchers = await User.find({ 
      watchlist: mission._id 
    });
    
    const io = getIO();
    watchers.forEach(user => {
      io.to(`user-${user._id}`).emit('mission-deleted', {
        missionId: mission._id,
        missionName: mission.name,
      });
    });

    await mission.deleteOne();

    res.json({
      success: true,
      message: 'Mission deleted successfully',
    });
  } catch (error) {
    console.error('Delete mission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Add mission to watchlist
// @route   POST /api/missions/:id/watch
// @access  Private
exports.addToWatchlist = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({ 
        success: false,
        message: 'Mission not found' 
      });
    }

    const user = await User.findById(req.user.id);

    if (user.watchlist.includes(mission._id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Mission already in watchlist' 
      });
    }

    user.watchlist.push(mission._id);
    mission.stats.watchlistCount += 1;
    
    await user.save();
    await mission.save();

    // Emit socket event
    const io = getIO();
    io.to(`mission-${mission._id}`).emit('watchlist-added', {
      userId: user._id,
      username: user.username,
    });

    res.json({
      success: true,
      message: 'Mission added to watchlist',
      watchlist: user.watchlist,
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Remove mission from watchlist
// @route   DELETE /api/missions/:id/watch
// @access  Private
exports.removeFromWatchlist = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({ 
        success: false,
        message: 'Mission not found' 
      });
    }

    const user = await User.findById(req.user.id);

    if (!user.watchlist.includes(mission._id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Mission not in watchlist' 
      });
    }

    user.watchlist = user.watchlist.filter(
      id => id.toString() !== mission._id.toString()
    );
    mission.stats.watchlistCount -= 1;
    
    await user.save();
    await mission.save();

    // Emit socket event
    const io = getIO();
    io.to(`mission-${mission._id}`).emit('watchlist-removed', {
      userId: user._id,
      username: user.username,
    });

    res.json({
      success: true,
      message: 'Mission removed from watchlist',
      watchlist: user.watchlist,
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Like/unlike mission
// @route   POST /api/missions/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({ 
        success: false,
        message: 'Mission not found' 
      });
    }

    const isLiked = mission.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike
      mission.likes = mission.likes.filter(
        id => id.toString() !== req.user.id
      );
    } else {
      // Like
      mission.likes.push(req.user.id);
    }

    await mission.save();

    // Emit socket event
    const io = getIO();
    io.to(`mission-${mission._id}`).emit('like-updated', {
      missionId: mission._id,
      likeCount: mission.likes.length,
      userId: req.user.id,
      action: isLiked ? 'unlike' : 'like',
    });

    res.json({
      success: true,
      isLiked: !isLiked,
      likeCount: mission.likes.length,
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Add comment to mission
// @route   POST /api/missions/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ 
        success: false,
        message: 'Comment text is required' 
      });
    }

    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({ 
        success: false,
        message: 'Mission not found' 
      });
    }

    const comment = {
      user: req.user.id,
      text,
      createdAt: new Date(),
    };

    mission.comments.push(comment);
    await mission.save();

    // Populate user data for the new comment
    await mission.populate('comments.user', 'username profilePicture');

    const newComment = mission.comments[mission.comments.length - 1];

    // Emit socket event
    const io = getIO();
    io.to(`mission-${mission._id}`).emit('new-comment', newComment);

    res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get upcoming launches
// @route   GET /api/missions/upcoming
// @access  Public
exports.getUpcomingLaunches = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const missions = await Mission.find({
      status: 'Upcoming',
      launchDate: { $gt: new Date() },
    })
      .sort({ launchDate: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: missions,
    });
  } catch (error) {
    console.error('Get upcoming launches error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get mission statistics
// @route   GET /api/missions/stats
// @access  Public
exports.getMissionStats = async (req, res) => {
  try {
    const stats = await Mission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalViews: { $sum: '$stats.viewCount' },
          totalLikes: { $sum: '$stats.likeCount' },
        },
      },
    ]);

    const orgStats = await Mission.aggregate([
      {
        $group: {
          _id: '$organization',
          count: { $sum: 1 },
          upcomingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Upcoming'] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        byOrganization: orgStats,
        totalMissions: await Mission.countDocuments(),
        upcomingMissions: await Mission.countDocuments({ status: 'Upcoming' }),
      },
    });
  } catch (error) {
    console.error('Get mission stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};
