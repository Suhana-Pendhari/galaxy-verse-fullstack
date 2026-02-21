const User = require('../models/User');

// Check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    console.error('Role check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in role check',
    });
  }
};

// Check if user is moderator or admin
const isModeratorOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!['moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Moderator or admin access required',
      });
    }

    next();
  } catch (error) {
    console.error('Role check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in role check',
    });
  }
};

// Check if user owns the resource or is admin
const isOwnerOrAdmin = (model) => async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Admin can do anything
    if (req.user.role === 'admin') {
      return next();
    }

    const resourceId = req.params.id;
    const resource = await model.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Check if user owns the resource
    if (resource.author && resource.author.toString() === req.user.id) {
      return next();
    }

    if (resource.user && resource.user.toString() === req.user.id) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  } catch (error) {
    console.error('Owner check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in ownership check',
    });
  }
};

// Check if user has specific role
const hasRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Required roles: ${roles.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in role check',
      });
    }
  };
};

// Check if user has minimum role level
const hasMinRoleLevel = (requiredRole) => {
  const roleLevels = {
    user: 1,
    moderator: 2,
    admin: 3,
  };

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const userLevel = roleLevels[req.user.role];
      const requiredLevel = roleLevels[requiredRole];

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          success: false,
          message: `Insufficient privileges. Required role: ${requiredRole}`,
        });
      }

      next();
    } catch (error) {
      console.error('Role level check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in role level check',
      });
    }
  };
};

// Check if user can moderate content
const canModerate = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user is moderator or admin
    if (!['moderator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Moderation privileges required',
      });
    }

    // Check if moderator has been active for a certain time (optional)
    if (req.user.role === 'moderator') {
      const accountAge = Date.now() - new Date(req.user.createdAt).getTime();
      const daysOld = accountAge / (1000 * 60 * 60 * 24);
      
      // Moderators need to have account for at least 30 days
      if (daysOld < 30) {
        return res.status(403).json({
          success: false,
          message: 'Moderator account must be at least 30 days old',
        });
      }
    }

    next();
  } catch (error) {
    console.error('Moderation check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in moderation check',
    });
  }
};

// Check if user can access admin panel
const canAccessAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Only admins can access admin panel
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    // Additional security checks for admin access
    // Check if IP is whitelisted (optional)
    const whitelistedIPs = process.env.ADMIN_IP_WHITELIST?.split(',') || [];
    if (whitelistedIPs.length > 0 && !whitelistedIPs.includes(req.ip)) {
      return res.status(403).json({
        success: false,
        message: 'Access from this IP is not allowed',
      });
    }

    // Log admin access attempt
    console.log(`Admin access: ${req.user.username} (${req.user.email}) from IP ${req.ip}`);

    next();
  } catch (error) {
    console.error('Admin access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in admin access check',
    });
  }
};

module.exports = {
  isAdmin,
  isModeratorOrAdmin,
  isOwnerOrAdmin,
  hasRole,
  hasMinRoleLevel,
  canModerate,
  canAccessAdmin,
};
