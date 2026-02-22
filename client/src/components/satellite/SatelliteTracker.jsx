import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  FaSatellite, FaSearch, FaMapMarkerAlt, FaClock, 
  FaGlobe, FaRedo, FaInfoCircle, FaTimes,
  FaPlay, FaPause, FaStepForward, FaStepBackward
} from 'react-icons/fa';
import { useQuery } from 'react-query';
import { getSatellites, getISSPosition, getSatelliteById } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import Loader from '../common/Loader';
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

// Component to update map view
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const SatelliteTracker = () => {
  const { socket } = useSocket();
  const [issPosition, setIssPosition] = useState(null);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [satellitePath, setSatellitePath] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTracking, setIsTracking] = useState(true);
  const [timeTravel, setTimeTravel] = useState(null);
  const [showSatelliteList, setShowSatelliteList] = useState(true);
  const [filter, setFilter] = useState('all');

  // Fetch satellites
  const { data: satellitesData, isLoading } = useQuery(
    'satellites',
    () => getSatellites({ limit: 100 }),
    {
      onError: (error) => {
        toast.error('Failed to load satellites');
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
        if (isTracking) {
          setMapCenter([position.latitude, position.longitude]);
        }
      });

      return () => {
        socket.off('iss-position-update');
      };
    }
  }, [socket, isTracking]);

  // Fetch ISS position periodically
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
    const interval = setInterval(fetchISS, 10000);

    return () => clearInterval(interval);
  }, []);

  // Fetch satellite path when selected
  useEffect(() => {
    if (selectedSatellite) {
      const fetchPath = async () => {
        try {
          const response = await getSatelliteById(selectedSatellite._id);
          setSatellitePath(response.data.path || []);
        } catch (error) {
          console.error('Failed to fetch satellite path:', error);
        }
      };
      fetchPath();
    }
  }, [selectedSatellite]);

  const satellites = satellitesData?.data || [];

  const filteredSatellites = satellites.filter(sat => 
    sat.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filter === 'all' || sat.orbitType === filter)
  );

  const orbitTypes = ['all', 'LEO', 'MEO', 'GEO', 'Elliptical'];

  const handleSatelliteSelect = (satellite) => {
    setSelectedSatellite(satellite);
    if (satellite.currentPosition) {
      setMapCenter([satellite.currentPosition.latitude, satellite.currentPosition.longitude]);
      setMapZoom(5);
    }
    setShowSatelliteList(false);
  };

  const handleCenterOnISS = () => {
    if (issPosition) {
      setMapCenter([issPosition.latitude, issPosition.longitude]);
      setMapZoom(5);
      setSelectedSatellite(null);
    }
  };

  const handleCenterOnUser = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(10);
    }
  };

  const handleTimeTravel = (direction) => {
    // This would integrate with a TLE propagation library
    toast.success('Time travel feature coming soon!');
  };

  return (
    <div className="h-[calc(100vh-8rem)] relative">
      {/* Main Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={mapCenter} zoom={mapZoom} />

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

        {/* Satellite Path */}
        {satellitePath.length > 1 && (
          <Polyline
            positions={satellitePath.map(p => [p.latitude, p.longitude])}
            color="#f59e0b"
            weight={2}
            opacity={0.6}
          />
        )}

        {/* Visibility Circle for User */}
        {userLocation && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={2000000} // 2000km radius
            pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.1 }}
          />
        )}
      </MapContainer>

      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-4 pointer-events-none">
        {/* Left Controls */}
        <div className="flex-1 flex gap-2 pointer-events-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowSatelliteList(!showSatelliteList)}
            icon={<FaSatellite />}
          >
            {showSatelliteList ? 'Hide List' : 'Show Satellites'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCenterOnISS}
            icon={<FaGlobe />}
          >
            Track ISS
          </Button>

          {userLocation && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCenterOnUser}
              icon={<FaMapMarkerAlt />}
            >
              My Location
            </Button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex gap-2 pointer-events-auto">
          <Button
            variant={isTracking ? 'accent' : 'outline'}
            size="sm"
            onClick={() => setIsTracking(!isTracking)}
            icon={isTracking ? <FaPause /> : <FaPlay />}
          >
            {isTracking ? 'Pause' : 'Resume'} Tracking
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeTravel('back')}
            icon={<FaStepBackward />}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeTravel('forward')}
            icon={<FaStepForward />}
          />
        </div>
      </div>

      {/* Satellite List Panel */}
      <AnimatePresence>
        {showSatelliteList && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            className="absolute top-20 left-4 w-80 bg-cosmic-dark/95 backdrop-blur-md rounded-lg border border-cosmic-primary/30 shadow-xl z-20 pointer-events-auto max-h-[calc(100vh-12rem)] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-cosmic-primary/30">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Satellites</h3>
                <button
                  onClick={() => setShowSatelliteList(false)}
                  className="p-1 hover:bg-cosmic-primary/20 rounded"
                >
                  <FaTimes />
                </button>
              </div>

              <Input
                placeholder="Search satellites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<FaSearch />}
                size="sm"
              />

              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {orbitTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                      filter === type
                        ? 'bg-cosmic-accent text-white'
                        : 'bg-cosmic-primary/20 hover:bg-cosmic-primary/30'
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <Loader />
              ) : (
                <div className="space-y-2">
                  {filteredSatellites.map((sat) => (
                    <motion.div
                      key={sat._id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedSatellite?._id === sat._id
                          ? 'bg-cosmic-accent/20 border border-cosmic-accent'
                          : 'hover:bg-cosmic-primary/20'
                      }`}
                      onClick={() => handleSatelliteSelect(sat)}
                    >
                      <div className="flex items-start space-x-3">
                        <FaSatellite className={`mt-1 ${
                          sat.orbitType === 'LEO' ? 'text-green-400' :
                          sat.orbitType === 'MEO' ? 'text-yellow-400' :
                          sat.orbitType === 'GEO' ? 'text-red-400' : 'text-purple-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{sat.name}</p>
                          <p className="text-xs text-gray-400">NORAD: {sat.noradId}</p>
                          {sat.currentPosition && (
                            <div className="mt-1 text-xs text-gray-500">
                              <span>{sat.orbitType} • {sat.currentPosition.altitude} km</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Satellite Info */}
      <AnimatePresence>
        {selectedSatellite && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-cosmic-dark/95 backdrop-blur-md rounded-lg border border-cosmic-primary/30 shadow-xl z-20 pointer-events-auto p-4 max-w-md w-full"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <FaSatellite className="text-2xl text-cosmic-accent" />
                <div>
                  <h4 className="font-semibold">{selectedSatellite.name}</h4>
                  <p className="text-xs text-gray-400">NORAD: {selectedSatellite.noradId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSatellite(null)}
                className="p-1 hover:bg-cosmic-primary/20 rounded"
              >
                <FaTimes />
              </button>
            </div>

            {selectedSatellite.currentPosition && (
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <span className="text-gray-400">Latitude:</span>
                  <p className="font-mono">{selectedSatellite.currentPosition.latitude.toFixed(4)}°</p>
                </div>
                <div>
                  <span className="text-gray-400">Longitude:</span>
                  <p className="font-mono">{selectedSatellite.currentPosition.longitude.toFixed(4)}°</p>
                </div>
                <div>
                  <span className="text-gray-400">Altitude:</span>
                  <p>{selectedSatellite.currentPosition.altitude} km</p>
                </div>
                <div>
                  <span className="text-gray-400">Orbit Type:</span>
                  <Badge variant={
                    selectedSatellite.orbitType === 'LEO' ? 'success' :
                    selectedSatellite.orbitType === 'MEO' ? 'warning' :
                    selectedSatellite.orbitType === 'GEO' ? 'error' : 'info'
                  }>
                    {selectedSatellite.orbitType}
                  </Badge>
                </div>
              </div>
            )}

            {selectedSatellite.description && (
              <p className="text-sm text-gray-400 mt-3">{selectedSatellite.description}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ISS Info */}
      {issPosition && !selectedSatellite && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-cosmic-dark/95 backdrop-blur-md rounded-lg border border-cosmic-accent/30 shadow-xl z-20 pointer-events-auto p-4"
        >
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <div>
              <h4 className="font-semibold">International Space Station</h4>
              <p className="text-sm text-gray-400">
                Lat: {issPosition.latitude.toFixed(4)}° • Lng: {issPosition.longitude.toFixed(4)}° • Alt: {issPosition.altitude} km
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SatelliteTracker;
