require('dotenv').config();
const mongoose = require('mongoose');
const Station = require('./models/Station');

const sampleStations = [
  {
    name: "Ajmer Road (DCM) EV-Station",
    location: {
      type: "Point",
      coordinates: [75.7462, 26.8936]  // Ajmer Road, Jaipur coordinates
    },
    status: "working",
    reviews: []
  },
  {
    name: "Rambagh EV-Station",
    location: {
      type: "Point",
      coordinates: [75.8145, 26.8930]  // Mahapura, Jaipur coordinates
    },
    status: "working",
    reviews: []
  },
  {
    name: "Manipal University Jaipur EV-Station",
    location: {
      type: "Point",
      coordinates: [75.5657, 26.8403]  // Manipal University Jaipur coordinates
    },
    status: "working",
    reviews: []
  },
  {
    name: "WTP Malviya Nagar EV-Station",
    location: {
      type: "Point",
      coordinates: [75.8050, 26.8546]  // WTP Malviya Nagar coordinates
    },
    status: "working",
    reviews: []
  },
  {
    name: "Mansarovar EV-Station",
    location: {
      type: "Point",
      coordinates: [75.7571, 26.8577]  // Mansarovar coordinates
    },
    status: "working",
    reviews: []
  },
  {
    name: "Sodala EV-Station",
    location: {
      type: "Point",
      coordinates: [78.7728, 26.9024]  // Sodala coordinates
    },
    status: "working",
    reviews: []
  },
  {
    name: "Raja Park EV-Station",
    location: {
      type: "Point",
      coordinates: [75.8373, 26.9032]  // Raja Park coordinates
    },
    status: "working",
    reviews: []
  },
  {
    name: "Gurjar ki Thadi EV-Station",
    location: {
      type: "Point",
      coordinates: [75.766768, 26.880985]  // Gurjar ki Thadi coordinates
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