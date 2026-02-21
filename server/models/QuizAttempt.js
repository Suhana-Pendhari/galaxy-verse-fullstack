const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    selectedOption: Number,
    isCorrect: Boolean,
    timeSpent: Number, // in seconds
  }],
  score: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  passed: {
    type: Boolean,
    default: false,
  },
  timeSpent: {
    type: Number, // in seconds
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  certificateGenerated: {
    type: Boolean,
    default: false,
  },
  certificateUrl: String,
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

// Index for efficient querying
quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ quiz: 1, score: -1 });
quizAttemptSchema.index({ completedAt: -1 });

// Calculate percentage before saving
quizAttemptSchema.pre('save', function(next) {
  if (this.isModified('score') && this.quiz) {
    // Percentage will be calculated when quiz is populated
    this.passed = this.percentage >= 60; // 60% passing score
  }
  next();
});

// Virtual for ranking position
quizAttemptSchema.virtual('ranking').get(function() {
  return this.constructor
    .find({ quiz: this.quiz, score: { $gt: this.score } })
    .countDocuments() + 1;
});

quizAttemptSchema.set('toJSON', { virtuals: true });
quizAttemptSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
