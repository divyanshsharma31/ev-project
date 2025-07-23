import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow} from '@react-google-maps/api';
import { io } from 'socket.io-client';
import "./homepage.css";

const containerStyle = {
  width: '100%',
  height: '60vh'
};

const initialCenter = { lat: 26.84386, lng: 75.56266 };

function HomePage() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [stations, setStations] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [username, setUsername] = useState('');
  const [currentUser, setCurrentUser] = useState('Guest'); // Track current user for voting
  const [selectedMarker, setSelectedMarker] = useState(null);
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
        setMarkers(data.map(station => {
  const coords = station.location?.coordinates;
  const lng = (coords && typeof coords[0] === 'number') ? coords[0] : 75.766768;
  const lat = (coords && typeof coords[1] === 'number') ? coords[1] : 26.880985;

  return {
    id: station._id,
    position: { lat, lng }
  };
}));
      })
      .catch(() => setStations([]));
  };

  const openModal = (station) => {
    setSelectedStation(station);
    setModalVisible(true);
    setSelectedStatus('');
    setReviewText('');
    // Pre-fill username if current user is set and not Guest
    if (currentUser && currentUser !== 'Guest') {
      setUsername(currentUser);
    } else {
      setUsername('');
    }
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!selectedStation || !selectedStatus || !username.trim()) {
      alert("All fields are required.");
      return;
    }
    setCurrentUser(username.trim()); // Set the current user
    const socket = io(`http://${window.location.hostname}:3000`);
    socket.emit('updateStationStatus', {
      stationId: selectedStation._id,
      status: selectedStatus,
      text: reviewText,
      username: username.trim()
    });
    setModalVisible(false);
  };

  const handleVote = async (stationId, reviewId, voteType) => {
    if (!currentUser || currentUser === 'Guest') {
      alert('Please submit a review first to vote on reviews!');
      return;
    }

    try {
      const response = await fetch(`/api/stations/${stationId}/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser,
          voteType: voteType
        })
      });

      const result = await response.json();
      if (!result.success) {
        alert(result.error || 'Failed to vote');
      }
      // The socket.io update will refresh the UI automatically
    } catch (error) {
      console.error('Vote error:', error);
      alert('Failed to vote');
    }
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
    <div className="user-info">
      <span className="current-user">User: {currentUser}</span>
      <button 
        className="change-user-btn" 
        onClick={() => {
          const newUser = prompt('Enter your username:', currentUser);
          if (newUser && newUser.trim()) {
            setCurrentUser(newUser.trim());
          }
        }}
      >
        Change User
      </button>
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

      <div className="map-container">
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{lat: 26.9124, lng: 75.7873}}
            zoom={13.5}
          >
            {markers.map(marker => {
  const stationDetails = stations.find(s => s._id === marker.id);

  return (
    <Marker
      key={marker.id}
      position={marker.position}
        onClick={() => setSelectedMarker({ position: marker.position, station: stationDetails })}
        onMouseOver={() => setSelectedMarker({ position: marker.position, station: stationDetails })}
         onCloseClick={() => setSelectedMarker(null)}
         onMouseOut={() => {
  setTimeout(() => {
    setSelectedMarker(null);
  }, 1000);  // 500ms delay before hiding
}}
    />
  );
})}
{selectedMarker && (
  <InfoWindow
    position={selectedMarker.position}
  options={{ disableAutoPan: true, closeBoxURL: '' }}  // Optional: remove close button
  >
    <div>
      <h3>{selectedMarker.station?.name}</h3>
      <p><strong>Status:</strong> {selectedMarker.station?.status}</p>
      <p><strong>Coordinates:</strong> {selectedMarker.station?.location?.coordinates?.join(", ")}</p>
    </div>
  </InfoWindow>
)}
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
                {(station.reviews || []).slice(0, 3).map((review, index) => {
                  const userVote = review.voters?.find(voter => voter.username === currentUser)?.voteType;
                  return (
                    <div className="review-item" key={review._id || index}>
                      <p><strong>{review.username}</strong></p>
                      <p>{review.text}</p>
                      <p>{new Date(review.timestamp).toLocaleString()}</p>
                      <span className={`status-badge ${review.status}`}>{review.status}</span>
                      
                      <div className="vote-section">
                        <button 
                          className={`vote-btn upvote ${userVote === 'upvote' ? 'active' : ''}`}
                          onClick={() => handleVote(station._id, review._id, 'upvote')}
                          title="Upvote this review"
                        >
                          👍 {review.upvotes || 0}
                        </button>
                        <button 
                          className={`vote-btn downvote ${userVote === 'downvote' ? 'active' : ''}`}
                          onClick={() => handleVote(station._id, review._id, 'downvote')}
                          title="Downvote this review"
                        >
                          👎 {review.downvotes || 0}
                        </button>
                      </div>
                    </div>
                  );
                })}
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
