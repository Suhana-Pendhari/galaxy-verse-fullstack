import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaGlobe, FaCrosshairs } from 'react-icons/fa';
import Button from '../common/Button';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const targetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
const MapClickHandler = ({ onMapClick }) => {
  const map = useMap();
  useEffect(() => {
    map.on('click', (e) => {
      onMapClick(e.latlng);
    });
    return () => {
      map.off('click');
    };
  }, [map, onMapClick]);
  return null;
};

// Component to update map view
const MapViewUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const WorldMap = ({
  center = [20, 0],
  zoom = 2,
  markers = [],
  paths = [],
  userLocation = null,
  onLocationSelect,
  showControls = true,
  height = '500px',
}) => {
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMapClick = (latlng) => {
    setSelectedLocation(latlng);
    if (onLocationSelect) {
      onLocationSelect(latlng);
    }
  };

  const handleCenterOnUser = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(10);
    }
  };

  const handleResetView = () => {
    setMapCenter([20, 0]);
    setMapZoom(2);
  };

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapViewUpdater center={mapCenter} zoom={mapZoom} />
        <MapClickHandler onMapClick={handleMapClick} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Selected Location Marker */}
        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={targetIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>Selected Location</strong>
                <p className="text-sm mt-1">
                  Lat: {selectedLocation.lat.toFixed(4)}°<br />
                  Lng: {selectedLocation.lng.toFixed(4)}°
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Custom Markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.lat, marker.lng]}
            icon={marker.icon || targetIcon}
          >
            {marker.popup && (
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: marker.popup }} />
              </Popup>
            )}
          </Marker>
        ))}

        {/* Paths */}
        {paths.map((path, index) => (
          <Polyline
            key={index}
            positions={path.points}
            color={path.color || '#f59e0b'}
            weight={path.weight || 2}
            opacity={path.opacity || 0.6}
          />
        ))}
      </MapContainer>

      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          {userLocation && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCenterOnUser}
              icon={<FaCrosshairs />}
              className="shadow-lg"
            >
              My Location
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
            icon={<FaGlobe />}
            className="shadow-lg"
          >
            Reset View
          </Button>
        </div>
      )}

      {/* Coordinates Display */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 z-10 bg-cosmic-dark/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-cosmic-primary/30 text-sm">
          <span className="text-gray-400">Selected: </span>
          <span className="font-mono">
            {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lng.toFixed(4)}°
          </span>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
