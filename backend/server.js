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
