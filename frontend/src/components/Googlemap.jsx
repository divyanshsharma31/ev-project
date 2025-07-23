import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '10px',
  margin: '20px 0'
};
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const center = {
  lat: 26.8467,   // Replace with your preferred latitude
  lng: 75.8028    // Replace with your preferred longitude
};

function MyMapComponent() {
  return (
    <LoadScript googleMapsApiKey={apiKey}>
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
  );
}

export default MyMapComponent;
