import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { io } from 'socket.io-client';
import "./homepage.css";

<<<<<<< HEAD
const containerStyle = {
  width: '100%',
  height: '60vh'
};

=======
const containerStyle = { width: '100%', height: '60vh' };
>>>>>>> 81a68438d7eaed30238e329b45a9e4366b803163
const initialCenter = { lat: 26.84386, lng: 75.56266 };

function HomePage() {
  const [markers, setMarkers] = useState([
<<<<<<< HEAD
    { id: 1, position: { lat: 26.84386, lng: 75.56266 } }
  ]);
  const [stations, setStations] = useState([]);

  useEffect(() => {
=======
    // Example marker; you can update this array in real-time
    { id: 1, position: { lat: 26.84386, lng: 75.56266 } }
  ]);
  const [stations, setStations] = useState([]); // <-- New state for stations

  useEffect(() => {
    // Fetch stations from backend API
>>>>>>> 81a68438d7eaed30238e329b45a9e4366b803163
    fetch('/api/stations')
      .then(res => res.json())
      .then(data => setStations(data))
      .catch(err => console.error('Error fetching stations:', err));
  }, []);

  useEffect(() => {
<<<<<<< HEAD
=======
    // Replace with your Socket.IO server URL
>>>>>>> 81a68438d7eaed30238e329b45a9e4366b803163
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

<<<<<<< HEAD
    socket.on('updateMarkers', (data) => {
      setMarkers(data);
=======
    // Example: Listen for marker updates from the server
    socket.on('updateMarkers', (data) => {
      setMarkers(data); // data should be an array of marker objects
>>>>>>> 81a68438d7eaed30238e329b45a9e4366b803163
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <header>
        <div className="header-content">
<<<<<<< HEAD
          <h1 className='home_title'>
            <i className="fas fa-charging-station"></i> EV Station Monitor
          </h1>
          <div className="user-info">
            <div className="user-input-wrapper">
              <i className="fas fa-user"></i>
              <input type="text" placeholder="Enter your name" className="username-input" />
=======
          <h1 className='home_title'><i className="fas fa-charging-station"></i> EV Station Monitor</h1>
          <div className="user-info">
            <div className="user-input-wrapper">
              <i className="fas fa-user"></i>
              <input type="text" id="username" placeholder="Enter your name" className="username-input" />
>>>>>>> 81a68438d7eaed30238e329b45a9e4366b803163
            </div>
          </div>
        </div>
        <div className="status-legend">
<<<<<<< HEAD
          <div className="legend-item"><span className="status-dot working"></span><span>Working</span></div>
          <div className="legend-item"><span className="status-dot maintenance"></span><span>Maintenance</span></div>
          <div className="legend-item"><span className="status-dot busy"></span><span>Busy</span></div>
        </div>
      </header>

      <div className='container'>
        <div className="map-container">
          <LoadScript googleMapsApiKey="AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg">

            <GoogleMap
              mapContainerStyle={containerStyle}
              center={initialCenter}
              zoom={15}
            >
              {markers.map(marker => (
                <Marker key={marker.id} position={marker.position} />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>

        <div className="all-stations">
=======
          <div className="legend-item">
            <span className="status-dot working"></span>
            <span>Working</span>
          </div>
          <div className="legend-item">
            <span className="status-dot maintenance"></span>
            <span>Maintenance</span>
          </div>
          <div className="legend-item">
            <span className="status-dot busy"></span>
            <span>Busy</span>
          </div>
        </div>
      </header>
      <div className='container'>
        <div className="map-container">
          <div id="map">
            <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={initialCenter}
                zoom={15}
              >
                {markers.map(marker => (
                  <Marker key={marker.id} position={marker.position} />
                ))}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>
        <div className="all-stations">
          {/* You can render station info here */}
>>>>>>> 81a68438d7eaed30238e329b45a9e4366b803163
          <h2>All Stations</h2>
          <ul>
            {stations.map(station => (
              <li key={station._id || station.id}>
                {station.name || station._id || station.id}
              </li>
            ))}
          </ul>
        </div>

<<<<<<< HEAD
=======
        {/* Review Modal */}
>>>>>>> 81a68438d7eaed30238e329b45a9e4366b803163
        <div className="modal">
          <div className="modal-content">
            <span className="close">&times;</span>
            <h2><i className="fas fa-star"></i> Submit Review</h2>
            <form id="reviewForm">
              <input type="hidden" id="stationId" />
              <div className="form-group">
<<<<<<< HEAD
                <label>Station Status:</label>
                <div className="status-selector">
                  <div className="status-option" data-status="working">
                    <i className="fas fa-check-circle"></i><span>Working</span>
                  </div>
                  <div className="status-option" data-status="maintenance">
                    <i className="fas fa-tools"></i><span>Maintenance</span>
                  </div>
                  <div className="status-option" data-status="busy">
                    <i className="fas fa-clock"></i><span>Busy</span>
=======
                <label htmlFor="reviewStatus">Station Status:</label>
                <div className="status-selector">
                  <div className="status-option" data-status="working">
                    <i className="fas fa-check-circle"></i>
                    <span>Working</span>
                  </div>
                  <div className="status-option" data-status="maintenance">
                    <i className="fas fa-tools"></i>
                    <span>Maintenance</span>
                  </div>
                  <div className="status-option" data-status="busy">
                    <i className="fas fa-clock"></i>
                    <span>Busy</span>
>>>>>>> 81a68438d7eaed30238e329b45a9e4366b803163
                  </div>
                </div>
              </div>
              <div className="form-group">
<<<<<<< HEAD
                <label>Your Review:</label>
                <textarea rows="4" placeholder="Share your experience..."></textarea>
=======
                <label htmlFor="reviewText">Your Review:</label>
                <textarea id="reviewText" rows="4" placeholder="Share your experience with this station..."></textarea>
>>>>>>> 81a68438d7eaed30238e329b45a9e4366b803163
              </div>
              <button type="submit" className="submit-btn">
                <i className="fas fa-paper-plane"></i> Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

<<<<<<< HEAD
export default HomePage;
=======
export default HomePage;
>>>>>>> 81a68438d7eaed30238e329b45a9e4366b803163
