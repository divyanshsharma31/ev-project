import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { io } from 'socket.io-client';
import "./homepage.css";

const containerStyle = {
  width: '100%',
  height: '73vh'
};
const initialCenter = { lat: 26.84386, lng: 75.56266 };
function formatStatus(status) {
  if (status === "working") return "Working";
  if (status === "maintenance") return "Under Maintenance";
  if (status === "busy") return "Busy";
  return "Unknown";
}
function HomePage() {
  const [markers, setMarkers] = useState([
    { id: 1, position: { lat: 26.84386, lng: 75.56266 } }
  ]);
  const [stations, setStations] = useState([]);
  const [stationError, setStationError] = useState(null);

  useEffect(() => {
    fetch('/api/stations')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stations: ' + res.status);
        return res.text();
      })
      .then(text => {
        try {
          // If response is empty, treat as empty array
          const data = text ? JSON.parse(text) : [];
          setStations(Array.isArray(data) ? data : []);
        } catch (err) {
          setStations([]);
          setStationError('Invalid JSON received from server.');
        }
      })
      .catch(err => {
        setStations([]);
        setStationError('Could not load stations: ' + err.message);
        console.error('Error fetching stations:', err);
      });
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });
    socket.on('updateMarkers', (data) => {
      setMarkers(data);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <header>
        <div className="header-content">
          <h1 className='home_title'><i className="fas fa-charging-station"></i> EV Station Monitor</h1>
          <div className="user-info">
            <div className="user-input-wrapper">
              <i className="fas fa-user"></i>
              <input type="text" id="username" placeholder="Enter your name" className="username-input" />
            </div>
          </div>
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
<div className="stations-section">
  <div className="stations-grid">
    {stations.map(station => (
      <div className={`station-card ${station.status}`} key={station._id || station.id}>
        <h3>{station.name || "Unnamed Station"}</h3>
        <p><strong>Coordinates:</strong> {station.coordinates || "N/A"}</p>
        <p><strong>Status:</strong> <span className="status-text">{formatStatus(station.status)}</span></p>

        <h4>Recent Updates</h4>
        <div className="reviews-list">
          {(station.reviews || []).slice(0, 3).map((review, index) => (
            <div className="review-item" key={index}>
              <span className={`status-badge ${review.status}`}>{formatStatus(review.status)}</span>
              <p>{review.comment}</p>
              <p className="review-user">{review.user}</p>
            </div>
          ))}
        </div>

        <div className="buttons-row">
          <button className="review-btn">Submit Review</button>
          <button className="update-btn">Update Status</button>
        </div>
      </div>
    ))}
  </div>
</div>

        <div className="modal">
          <div className="modal-content">
            <span className="close">&times;</span>
            <h2><i className="fas fa-star"></i> Submit Review</h2>
            <form id="reviewForm">
              <input type="hidden" id="stationId" />
              <div className="form-group">
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
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reviewText">Your Review:</label>
                <textarea id="reviewText" rows="4" placeholder="Share your experience with this station..."></textarea>
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

export default HomePage;
