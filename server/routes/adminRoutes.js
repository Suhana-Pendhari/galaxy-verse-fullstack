const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  getReportedContent,
  moderateContent,
  getSystemLogs,
  getAnalytics,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/reported-content', getReportedContent);
router.post('/moderate', moderateContent);
router.get('/logs', getSystemLogs);
router.get('/analytics', getAnalytics);

module.exports = router;
