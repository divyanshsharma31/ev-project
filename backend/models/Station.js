const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['working', 'busy', 'maintenance'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  voters: [{
    username: String,
    voteType: {
      type: String,
      enum: ['upvote', 'downvote']
    }
  }]
});

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['working', 'busy', 'maintenance'],
    default: 'working'
  },
  reviews: [reviewSchema]
});

// Create a 2dsphere index for geospatial queries
stationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Station', stationSchema); 