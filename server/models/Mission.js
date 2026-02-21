const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Mission name is required'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Mission description is required'],
  },
  organization: {
    type: String,
    enum: ['NASA', 'SpaceX', 'ISRO', 'ESA', 'Roscosmos', 'Other'],
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
    index: true,
  },
  launchSite: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    country: String,
    timezone: String,
  },
  rocket: {
    name: String,
    type: String,
    stages: Number,
    height: Number,
    diameter: Number,
    mass: Number,
    thrust: Number,
  },
  payload: [{
    name: String,
    type: {
      type: String,
      enum: ['Satellite', 'Crew', 'Cargo', 'Rover', 'Other'],
    },
    mass: Number,
    destination: String,
    description: String,
  }],
  missionType: {
    type: String,
    enum: [
      'Satellite Deployment',
      'Crewed Mission',
      'Cargo Resupply',
      'Planetary Exploration',
      'Space Telescope',
      'Space Station',
      'Other',
    ],
  },
  status: {
    type: String,
    enum: ['Upcoming', 'In Progress', 'Completed', 'Aborted', 'Delayed'],
    default: 'Upcoming',
    index: true,
  },
  images: [{
    url: String,
    caption: String,
    credit: String,
  }],
  videos: [{
    url: String,
    title: String,
    platform: String, // YouTube, Vimeo, etc.
  }],
  livestreamUrl: String,
  countdown: Date,
  weatherConditions: {
    temperature: Number,
    windSpeed: Number,
    humidity: Number,
    condition: String,
    visibility: Number,
  },
  missionHighlights: [String],
  crew: [{
    name: String,
    role: String,
    bio: String,
    nationality: String,
    image: String,
  }],
  timeline: [{
    time: String, // T-minus format
    event: String,
    description: String,
  }],
  stats: {
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    watchlistCount: {
      type: Number,
      default: 0,
    },
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: String,
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  tags: [String],
}, {
  timestamps: true,
});

// Index for search functionality
missionSchema.index({ name: 'text', description: 'text' });
missionSchema.index({ organization: 1, status: 1, launchDate: 1 });
missionSchema.index({ 'launchSite.country': 1 });
missionSchema.index({ missionType: 1 });

// Update stats middleware
missionSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.stats.likeCount = this.likes.length;
  }
  if (this.isModified('comments')) {
    this.stats.commentCount = this.comments.length;
  }
  next();
});

// Virtual for countdown
missionSchema.virtual('countdownText').get(function() {
  const now = new Date();
  const launch = new Date(this.launchDate);
  
  if (launch < now) return 'Launched';
  
  const diff = launch - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${days}d ${hours}h ${minutes}m`;
});

// Virtual for status color
missionSchema.virtual('statusColor').get(function() {
  const colors = {
    'Upcoming': 'yellow',
    'In Progress': 'blue',
    'Completed': 'green',
    'Aborted': 'red',
    'Delayed': 'orange',
  };
  return colors[this.status] || 'gray';
});

missionSchema.set('toJSON', { virtuals: true });
missionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Mission', missionSchema);
