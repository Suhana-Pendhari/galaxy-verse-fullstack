const mongoose = require('mongoose');

const satelliteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  noradId: {
    type: String,
    required: true,
    unique: true,
  },
  country: String,
  operator: String,
  purpose: String,
  launchDate: Date,
  launchVehicle: String,
  orbitType: {
    type: String,
    enum: ['LEO', 'MEO', 'GEO', 'Elliptical'],
  },
  orbitDetails: {
    perigee: Number, // in km
    apogee: Number, // in km
    inclination: Number, // in degrees
    period: Number, // in minutes
    eccentricity: Number,
  },
  currentPosition: {
    latitude: Number,
    longitude: Number,
    altitude: Number,
    velocity: Number,
    timestamp: Date,
  },
  path: [{
    latitude: Number,
    longitude: Number,
    altitude: Number,
    timestamp: Date,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  image: String,
  description: String,
  website: String,
  lastUpdated: Date,
}, {
  timestamps: true,
});

// Index for geospatial queries
satelliteSchema.index({ 'currentPosition': '2dsphere' });
satelliteSchema.index({ noradId: 1 });
satelliteSchema.index({ orbitType: 1 });

module.exports = mongoose.model('Satellite', satelliteSchema);
