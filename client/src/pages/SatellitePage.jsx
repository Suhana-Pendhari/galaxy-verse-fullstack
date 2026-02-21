import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaSatellite, FaSearch, FaMapMarkerAlt, FaClock, FaGlobe } from 'react-icons/fa';
import { getSatellites, getISSPosition, getSatellitesInView } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import SatelliteCard from '../components/satellite/SatelliteCard';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom satellite icon
const satelliteIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// ISS icon
const issIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SatellitePage = () => {
  const { socket } = useSocket();
  const [issPosition, setIssPosition] = useState(null);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [satellitesInView, setSatellitesInView] = useState([]);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  // Fetch satellites
  const { data: satellitesData, isLoading: satellitesLoading } = useQuery(
    'satellites',
    () => getSatellites({ limit: 100 }),
    {
      onError: (error) => {
        toast.error('Failed to load satellites');
        console.error(error);
      },
    }
  );

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
          setMapZoom(5);
          
          // Fetch satellites in view
          fetchSatellitesInView(latitude, longitude);
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Socket connection for real-time ISS tracking
  useEffect(() => {
    if (socket) {
      socket.on('iss-position-update', (position) => {
        setIssPosition(position);
      });

      return () => {
        socket.off('iss-position-update');
      };
    }
  }, [socket]);

  // Fetch ISS position
  useEffect(() => {
    const fetchISS = async () => {
      try {
        const response = await getISSPosition();
        setIssPosition(response.data.position);
      } catch (error) {
        console.error('Failed to fetch ISS position:', error);
      }
    };

    fetchISS();
    const interval = setInterval(fetchISS, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchSatellitesInView = async (lat, lng) => {
    try {
      const response = await getSatellitesInView({ lat, lng });
      setSatellitesInView(response.data);
    } catch (error) {
      console.error('Failed to fetch satellites in view:', error);
    }
  };

  const satellites = satellitesData?.data || [];

  return (
    <div className="py-8 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
          <div className="cosmic-card p-4">
            <h2 className="text-xl font-orbitron font-bold mb-4 flex items-center space-x-2">
              <FaSatellite className="text-cosmic-accent" />
              <span>Satellite Tracker</span>
            </h2>
            
            {/* ISS Position */}
            {issPosition && (
              <div className="mb-4 p-3 bg-cosmic-primary/20 rounded-lg border border-cosmic-accent">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">🛰️ ISS</span>
                  <span className="text-xs text-green-400 animate-pulse">Live</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p>Lat: {issPosition.latitude.toFixed(4)}°</p>
                  <p>Lng: {issPosition.longitude.toFixed(4)}°</p>
                  <p>Alt: {issPosition.altitude} km</p>
                  <p>Speed: {issPosition.velocity} km/s</p>
                </div>
              </div>
            )}

            {/* User Location */}
            {userLocation && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center space-x-1">
                  <FaMapMarkerAlt className="text-cosmic-accent" />
                  <span>Your Location</span>
                </h3>
                <p className="text-xs text-gray-400">
                  {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
                </p>
              </div>
            )}

            {/* Satellites in View */}
            {satellitesInView.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Satellites in View</h3>
                <div className="space-y-2">
                  {satellitesInView.slice(0, 5).map(sat => (
                    <div
                      key={sat._id}
                      className="text-xs p-2 bg-cosmic-light/30 rounded-lg"
                    >
                      <span className="font-medium">{sat.name}</span>
                      <span className="text-gray-400 block">{sat.orbitType}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Satellite List */}
          <div className="cosmic-card p-4">
            <h3 className="font-semibold mb-3">Active Satellites</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {satellites.map((satellite) => (
                <SatelliteCard
                  key={satellite._id}
                  satellite={satellite}
                  onClick={() => setSelectedSatellite(satellite)}
                  isSelected={selectedSatellite?._id === satellite._id}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3 cosmic-card p-4 h-full">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location Marker */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <div className="text-center">
                    <strong>Your Location</strong>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* ISS Marker */}
            {issPosition && (
              <Marker
                position={[issPosition.latitude, issPosition.longitude]}
                icon={issIcon}
              >
                <Popup>
                  <div className="text-center">
                    <strong>🛰️ International Space Station</strong>
                    <p className="text-sm mt-1">
                      Altitude: {issPosition.altitude} km<br />
                      Speed: {issPosition.velocity} km/s
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Selected Satellite Marker */}
            {selectedSatellite?.currentPosition && (
              <Marker
                position={[
                  selectedSatellite.currentPosition.latitude,
                  selectedSatellite.currentPosition.longitude,
                ]}
                icon={satelliteIcon}
              >
                <Popup>
                  <div className="text-center">
                    <strong>{selectedSatellite.name}</strong>
                    <p className="text-sm mt-1">
                      Type: {selectedSatellite.orbitType}<br />
                      Altitude: {selectedSatellite.currentPosition.altitude} km
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Satellite Paths */}
            {selectedSatellite?.path && selectedSatellite.path.length > 1 && (
              <Polyline
                positions={selectedSatellite.path.map(p => [p.latitude, p.longitude])}
                color="#f59e0b"
                weight={2}
                opacity={0.6}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default SatellitePage;
