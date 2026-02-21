const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: [
      'user_banned',
      'user_unbanned',
      'user_role_changed',
      'post_deleted',
      'post_approved',
      'post_rejected',
      'mission_created',
      'mission_updated',
      'mission_deleted',
      'quiz_created',
      'quiz_updated',
      'quiz_deleted',
      'settings_changed',
      'report_resolved',
    ],
    required: true,
  },
  targetType: {
    type: String,
    enum: ['user', 'post', 'mission', 'quiz', 'comment', 'setting'],
  },
  targetId: mongoose.Schema.Types.ObjectId,
  changes: mongoose.Schema.Types.Mixed,
  reason: String,
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

// Index for efficient querying
adminLogSchema.index({ admin: 1, createdAt: -1 });
adminLogSchema.index({ action: 1 });
adminLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);
