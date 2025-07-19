import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { io } from 'socket.io-client';
import "./homepage.css";

const containerStyle = {
  width: '100%',
  height: '60vh'
};

const initialCenter = { lat: 26.84386, lng: 75.56266 };

function HomePage() {
  const [stations, setStations] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    const socket = io(`http://${window.location.hostname}:3000`);
    socket.on('stationUpdated', loadStations);
    return () => socket.disconnect();
  }, []);

  const loadStations = () => {
    fetch('/api/stations')
      .then(res => res.json())
      .then(data => {
        setStations(data || []);
        setMarkers(data.map(station => ({
          id: station._id,
          position: {
            lat: station.location?.coordinates[1] || 75.78519822471735,
            lng: station.location?.coordinates[0] || 26.912455350001334
          }
        })));
      })
      .catch(() => setStations([]));
  };

  const openModal = (station) => {
    setSelectedStation(station);
    setModalVisible(true);
    setSelectedStatus('');
    setReviewText('');
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!selectedStation || !selectedStatus || !username.trim()) {
      alert("All fields are required.");
      return;
    }
    const socket = io(`http://${window.location.hostname}:3000`);
    socket.emit('updateStationStatus', {
      stationId: selectedStation._id,
      status: selectedStatus,
      text: reviewText,
      username: username.trim()
    });
    setModalVisible(false);
  };

  return (
    <>

      <header>
        <div className="header-content">
    <div className="logo-container">
      <img src="/image/logo.png" alt="LiveCharge Logo" className="header-logo" />
    </div>
    <h1 className='home_title'>
      <i className="fas fa-charging-station"></i> EV Station Monitor
    </h1>
        </div>
        <div className="status-legend">
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

      <div className="map-container">
        <LoadScript googleMapsApiKey="AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{lat: 26.9124, lng: 75.7873}}
            zoom={13.5}
          >
            {markers.map(marker => (
              <Marker key={marker.id} position={marker.position} />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="stations-section">
        <div className="stations-grid">
          {stations.map(station => (
            <div className={`station-card ${station.status}`} key={station._id}>
              <h3>{station.name}</h3>
              <p><strong>Location:</strong> {station.location?.type || 'Point'}</p>
              <p><strong>Coordinates:</strong> {station.location?.coordinates?.join(", ")}</p>
              <p><strong>Status:</strong> {station.status}</p>

              <h4>Recent Reviews</h4>
              <div className="reviews-list">
                {(station.reviews || []).slice(0, 3).map((review, index) => (
                  <div className="review-item" key={index}>
                    <p><strong>{review.username}</strong></p>
                    <p>{review.text}</p>
                    <p>{new Date(review.timestamp).toLocaleString()}</p>
                    <span className={`status-badge ${review.status}`}>{review.status}</span>
                  </div>
                ))}
              </div>

              <div className="buttons-row">
                <button className="review-btn" onClick={() => openModal(station)}>Submit Review</button>
              </div>
            </div>
          ))}
        </div>
      </div>

     {modalVisible && (
  <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={() => setModalVisible(false)}>&times;</span>
      <h2>🚗 Submit Your Review</h2>

      <div className="form-group">
        <label className="modal-label">Your Name:</label>
        <input
          type="text"
          className="modal-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      <div className="form-group">
        <label className="modal-label">Select Station Status:</label>
        <div className="status-options-row">
          {['working', 'maintenance', 'busy'].map(status => (
            <button
  key={status}
  type="button"
  className={`status-select-btn ${status} ${selectedStatus === status ? 'selected' : ''}`}
  onClick={() => setSelectedStatus(status)}
>
  {status.charAt(0).toUpperCase() + status.slice(1)}
</button>

          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="modal-label">Your Review:</label>
        <textarea
          className="modal-textarea"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows="4"
          placeholder="Share your experience..."
        ></textarea>
      </div>

      <button onClick={submitReview} className="modal-submit-btn">
         Submit Review
      </button>
    </div>
  </div>
)}
    </>
  );
}

export default HomePage;
