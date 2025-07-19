require('dotenv').config();
const mongoose = require('mongoose');
const Station = require('./models/Station');

const sampleStations = [
  {
    name: "Ajmer Road EV-Station",
    location: {
      type: "Point",
      coordinates: [75.7893, 26.9124]  // Ajmer Road, Jaipur coordinates
    },
    status: "working",
    reviews: []
  },
  {
    name: "Rambagh EV-Station",
    location: {
      type: "Point",
      coordinates: [75.8123, 26.9234]  // Mahapura, Jaipur coordinates
    },
    status: "working",
    reviews: []
  },
  {
    name: "Manipal University Jaipur EV-Station",
    location: {
      type: "Point",
      coordinates: [75.5627, 26.8439]  // Manipal University Jaipur coordinates
    },
    status: "working",
    reviews: []
  },
  {
    name: "WTP Malviya Nagar EV-station",
    location: {
      type: "Point",
      coordinates: [75.7637, 26.3459]  // Manipal University Jaipur coordinates
    },
    status: "working",
    reviews: []
  }
];

async function setup() {
  try {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/mongo--database');
    console.log('Connected to MongoDB');

    // Clear existing stations
    await Station.deleteMany({});
    console.log('Cleared existing stations');

    // Insert sample stations
    await Station.insertMany(sampleStations);
    console.log('Inserted sample stations');

    console.log('Setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setup(); 