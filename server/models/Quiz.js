const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Quiz description is required'],
  },
  category: {
    type: String,
    enum: [
      'Solar System',
      'Stars & Galaxies',
      'Space Missions',
      'Astronauts',
      'Space Technology',
      'Astronomy',
      'General Space',
    ],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  timeLimit: {
    type: Number, // in minutes
    required: true,
    min: 1,
    max: 60,
  },
  questions: [{
    question: {
      type: String,
      required: true,
    },
    options: [{
      text: String,
      isCorrect: Boolean,
    }],
    explanation: String,
    points: {
      type: Number,
      default: 10,
    },
    image: {
      url: String,
      caption: String,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
  }],
  totalPoints: {
    type: Number,
    default: 0,
  },
  passingScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: 0,
  },
  bestScore: {
    type: Number,
    default: 0,
  },
  timeLimit: Number, // in minutes
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  certificateTemplate: {
    type: String,
    default: 'default',
  },
  leaderboard: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    score: Number,
    timeSpent: Number,
    completedAt: Date,
  }],
}, {
  timestamps: true,
});

// Calculate total points before saving
quizSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 10), 0);
  }
  next();
});

// Index for search
quizSchema.index({ title: 'text', description: 'text', tags: 'text' });
quizSchema.index({ category: 1, difficulty: 1 });
quizSchema.index({ isActive: 1, isFeatured: 1 });

// Virtual for question count
quizSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Virtual for estimated time
quizSchema.virtual('estimatedTime').get(function() {
  return this.questions.length * 1.5; // 1.5 minutes per question on average
});

quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Quiz', quizSchema);
