import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '10px',
  margin: '20px 0'
};

const center = {
  lat: 26.8467,   // Replace with your preferred latitude
  lng: 75.8028    // Replace with your preferred longitude
};

function MyMapComponent() {
  return (
    <LoadScript googleMapsApiKey="AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}

export default MyMapComponent;
