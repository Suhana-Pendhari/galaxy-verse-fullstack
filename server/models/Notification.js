const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: [
      'like',
      'comment',
      'follow',
      'mission_update',
      'quiz_result',
      'achievement',
      'mention',
      'system',
      'moderation',
    ],
    required: true,
  },
  title: String,
  message: {
    type: String,
    required: true,
  },
  data: {
    entityId: mongoose.Schema.Types.ObjectId,
    entityType: String,
    action: String,
    additionalInfo: mongoose.Schema.Types.Mixed,
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  delivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  expiresAt: Date,
}, {
  timestamps: true,
});

// Index for efficient querying
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read method
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
