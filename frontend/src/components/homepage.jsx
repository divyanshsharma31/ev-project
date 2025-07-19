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
  const [markers, setMarkers] = useState([]);
  const [stations, setStations] = useState([]);
  const [stationError, setStationError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [username, setUsername] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetch('/api/stations')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stations: ' + res.status);
        return res.text();
      })
      .then(text => {
        try {
          const data = text ? JSON.parse(text) : [];
          const stationsData = Array.isArray(data) ? data : [];
          setStations(stationsData);
          
          // Convert stations to markers for the map
          const mapMarkers = stationsData.map(station => ({
            id: station._id,
            position: {
              lat: station.location?.coordinates?.[1] || 26.84386,
              lng: station.location?.coordinates?.[0] || 75.56266
            },
            title: station.name,
            status: station.status
          }));
          setMarkers(mapMarkers);
        } catch (err) {
          setStations([]);
          setMarkers([]);
          setStationError('Invalid JSON received from server.');
        }
      })
      .catch(err => {
        setStations([]);
        setMarkers([]);
        setStationError('Could not load stations: ' + err.message);
        console.error('Error fetching stations:', err);
      });
  }, []);

  useEffect(() => {
    const newSocket = io('http://127.0.0.1:3000');
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });
    
    newSocket.on('stationUpdated', (data) => {
      setStations(prevStations => {
        const updatedStations = prevStations.map(station => 
          station._id === data.stationId 
            ? { ...station, status: data.status, reviews: data.reviews }
            : station
        );
        
        // Update markers as well
        const updatedMarkers = updatedStations.map(station => ({
          id: station._id,
          position: {
            lat: station.location?.coordinates?.[1] || 26.84386,
            lng: station.location?.coordinates?.[0] || 75.56266
          },
          title: station.name,
          status: station.status
        }));
        setMarkers(updatedMarkers);
        
        return updatedStations;
      });
    });

    newSocket.on('reviewSubmitted', (data) => {
      if (data.success) {
        alert('Review submitted successfully!');
        setIsModalOpen(false);
        setSelectedStatus('');
        setReviewText('');
      }
    });

    newSocket.on('error', (data) => {
      alert('Error: ' + data.message);
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleReviewClick = (station) => {
    setSelectedStation(station);
    setIsModalOpen(true);
  };

  const handleUpdateStatusClick = (station) => {
    setSelectedStation(station);
    setIsModalOpen(true);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      alert('Please enter your name in the header');
      return;
    }
    
    if (!selectedStatus) {
      alert('Please select a status');
      return;
    }

    if (!selectedStation) {
      alert('No station selected');
      return;
    }

    const reviewData = {
      stationId: selectedStation._id,
      status: selectedStatus,
      text: reviewText.trim(),
      username: username.trim()
    };

    socket.emit('updateStationStatus', reviewData);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStation(null);
    setSelectedStatus('');
    setReviewText('');
  };

  return (
    <>
      <header>
        <div className="header-content">
          <h1 className='home_title'><i className="fas fa-charging-station"></i> EV Station Monitor</h1>
          <div className="user-info">
            <div className="user-input-wrapper">
              <i className="fas fa-user"></i>
              <input 
                type="text" 
                placeholder="Enter your name" 
                className="username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
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
          {stationError && (
            <div style={{ color: 'red', padding: '20px' }}>
              Error: {stationError}
            </div>
          )}
          {stations.length === 0 && !stationError && (
            <div style={{ padding: '20px' }}>
              Loading stations...
            </div>
          )}
          {stations.length > 0 && (
            <div style={{ marginBottom: '10px', padding: '10px', background: '#e8f5e8' }}>
              ✅ Found {stations.length} stations - Map should show {markers.length} markers
            </div>
          )}
          <LoadScript googleMapsApiKey="AIzaSyCx2YagW6Y-u3eCoHwL9fGc8931c-kNNTI">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={initialCenter}
              zoom={13}
            >
              {markers.map(marker => (
                <Marker 
                  key={marker.id} 
                  position={marker.position}
                  title={marker.title}
                  icon={{
                    url: marker.status === 'working' 
                      ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                      : marker.status === 'maintenance'
                      ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                      : 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                  }}
                  onClick={() => {
                    const station = stations.find(s => s._id === marker.id);
                    if (station) handleReviewClick(station);
                  }}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
<div className="stations-section">
  <div className="stations-grid">
    {stations.map(station => (
      <div className={`station-card ${station.status}`} key={station._id || station.id}>
        <h3>{station.name || "Unnamed Station"}</h3>
        <p><strong>Location:</strong> {station.location?.coordinates ? `${station.location.coordinates[1]}, ${station.location.coordinates[0]}` : "N/A"}</p>
        <p><strong>Status:</strong> <span className="status-text">{formatStatus(station.status)}</span></p>

        <h4>Recent Updates</h4>
        <div className="reviews-list">
          {(station.reviews || []).slice(-3).map((review, index) => (
            <div className="review-item" key={index}>
              <span className={`status-badge ${review.status}`}>{formatStatus(review.status)}</span>
              <p>{review.text}</p>
              <p className="review-user">- {review.username}</p>
            </div>
          ))}
        </div>

        <div className="buttons-row">
          <button 
            className="review-btn"
            onClick={() => handleReviewClick(station)}
          >
            Submit Review
          </button>
          <button 
            className="update-btn"
            onClick={() => handleUpdateStatusClick(station)}
          >
            Update Status
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

        {isModalOpen && (
          <div className="modal" style={{ display: 'block' }}>
            <div className="modal-content">
              <span className="close" onClick={closeModal}>&times;</span>
              <h2><i className="fas fa-star"></i> Submit Review for {selectedStation?.name}</h2>
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label>Station Status:</label>
                  <div className="status-selector">
                    <div 
                      className={`status-option ${selectedStatus === 'working' ? 'selected' : ''}`}
                      onClick={() => handleStatusSelect('working')}
                    >
                      <i className="fas fa-check-circle"></i>
                      <span>Working</span>
                    </div>
                    <div 
                      className={`status-option ${selectedStatus === 'maintenance' ? 'selected' : ''}`}
                      onClick={() => handleStatusSelect('maintenance')}
                    >
                      <i className="fas fa-tools"></i>
                      <span>Maintenance</span>
                    </div>
                    <div 
                      className={`status-option ${selectedStatus === 'busy' ? 'selected' : ''}`}
                      onClick={() => handleStatusSelect('busy')}
                    >
                      <i className="fas fa-clock"></i>
                      <span>Busy</span>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reviewText">Your Review:</label>
                  <textarea 
                    id="reviewText" 
                    rows="4" 
                    placeholder="Share your experience with this station..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                </div>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-paper-plane"></i> Submit Review
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default HomePage;
