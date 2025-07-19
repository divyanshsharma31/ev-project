const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const Station = require('./models/Station');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection with error handling
mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/livecharge',
 {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Successfully connected to MongoDB.');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('updateStationStatus', async (data) => {
    try {
      const { stationId, status, text, username } = data;

      // Validate input
      if (!stationId || !status || !username) {
        throw new Error('Missing required fields');
      }

      const station = await Station.findById(stationId);
      if (!station) {
        throw new Error('Station not found');
      }

      // Update station status and add review
      station.status = status;
      station.reviews.push({
        username,
        status,
        text: text || '',
        timestamp: new Date()
      });

      await station.save();
      
      // Emit update to all connected clients
      io.emit('stationUpdated', {
        stationId: station._id,
        status: station.status,
        reviews: station.reviews
      });

      // Send success confirmation to the sender
      socket.emit('reviewSubmitted', {
        success: true,
        message: 'Review submitted successfully'
      });
    } catch (error) {
      console.error('Error updating station:', error);
      socket.emit('error', {
        message: error.message || 'Error updating station status'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// API Routes with error handling
app.get('/api/stations', async (req, res) => {
  try {
    const stations = await Station.find();
    if (!stations || stations.length === 0) {
      console.warn('No stations found in the database.');
    }
    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    // Always return valid JSON (empty array) on error
    res.status(500).json([]);
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/stations/:id', async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }
    res.json(station);
  } catch (error) {
    console.error('Error fetching station:', error);
    res.status(500).json({ error: 'Error fetching station' });
  }
});

// Serve frontend static files correctly
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve index.html for all non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
