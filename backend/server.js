// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const Station = require('./models/Station');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/mongo--database', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected')).catch(err => { console.error(err); process.exit(1); });

// API Routes
app.get('/api/stations', async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

// Vote on a review
app.post('/api/stations/:stationId/reviews/:reviewId/vote', async (req, res) => {
  try {
    const { stationId, reviewId } = req.params;
    const { username, voteType } = req.body;

    if (!username || !voteType || !['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote data' });
    }

    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const review = station.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user has already voted
    const existingVoteIndex = review.voters.findIndex(voter => voter.username === username);
    
    if (existingVoteIndex !== -1) {
      const existingVote = review.voters[existingVoteIndex];
      
      // If user is voting the same way, remove their vote
      if (existingVote.voteType === voteType) {
        review.voters.splice(existingVoteIndex, 1);
        if (voteType === 'upvote') {
          review.upvotes = Math.max(0, review.upvotes - 1);
        } else {
          review.downvotes = Math.max(0, review.downvotes - 1);
        }
      } else {
        // User is changing their vote
        review.voters[existingVoteIndex].voteType = voteType;
        if (voteType === 'upvote') {
          review.upvotes += 1;
          review.downvotes = Math.max(0, review.downvotes - 1);
        } else {
          review.downvotes += 1;
          review.upvotes = Math.max(0, review.upvotes - 1);
        }
      }
    } else {
      // New vote
      review.voters.push({ username, voteType });
      if (voteType === 'upvote') {
        review.upvotes += 1;
      } else {
        review.downvotes += 1;
      }
    }

    await station.save();
    
    // Emit the updated station data to all clients
    io.emit('stationUpdated', {
      stationId: station._id,
      status: station.status,
      reviews: station.reviews
    });

    res.json({ 
      success: true, 
      upvotes: review.upvotes, 
      downvotes: review.downvotes,
      userVote: review.voters.find(voter => voter.username === username)?.voteType || null
    });

  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

// Serve Frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// WebSocket (Socket.IO)
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('updateStationStatus', async (data) => {
    try {
      const { stationId, status, text, username } = data;

      if (!stationId || !status || !username) {
        throw new Error('Missing fields');
      }

      const station = await Station.findById(stationId);
      if (!station) throw new Error('Station not found');

      station.status = status;
      station.reviews.push({
        username,
        status,
        text: text || '',
        timestamp: new Date()
      });

      await station.save();

      io.emit('stationUpdated', {
        stationId: station._id,
        status: station.status,
        reviews: station.reviews
      });

    } catch (error) {
      console.error(error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => console.log('Client disconnected'));
});

server.listen(3000, () => console.log('Server running on port 3000'));
