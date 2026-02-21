import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaHeart, FaExclamationTriangle, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { toggleFavorite } from '../../services/api';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const AsteroidTracker = ({ asteroids, isLoading, detailed = false }) => {
  const { isAuthenticated } = useAuth();
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [sortField, setSortField] = useState('close_approach_date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [favorites, setFavorites] = useState({});

  const handleFavorite = async (asteroidId) => {
    if (!isAuthenticated) {
      toast.error('Please login to favorite asteroids');
      return;
    }

    try {
      await toggleFavorite('asteroids', asteroidId);
      setFavorites(prev => ({ ...prev, [asteroidId]: !prev[asteroidId] }));
      toast.success(favorites[asteroidId] ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const formatDistance = (km) => {
    if (km > 1000000) {
      return `${(km / 1000000).toFixed(2)} million km`;
    }
    return `${km.toLocaleString()} km`;
  };

  const formatVelocity = (kmph) => {
    return `${kmph.toLocaleString()} km/h`;
  };

  const getHazardColor = (isHazardous) => {
    return isHazardous ? 'text-red-500' : 'text-green-500';
  };

  const getSizeEstimate = (asteroid) => {
    const min = asteroid.estimated_diameter?.kilometers?.estimated_diameter_min || 0;
    const max = asteroid.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
    return `${min.toFixed(3)} - ${max.toFixed(3)} km`;
  };

  // Sort asteroids
  const sortedAsteroids = [...asteroids].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortField) {
      case 'name':
        aVal = a.name;
        bVal = b.name;
        break;
      case 'size':
        aVal = a.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
        bVal = b.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
        break;
      case 'close_approach_date':
        aVal = new Date(a.close_approach_data?.[0]?.close_approach_date || 0);
        bVal = new Date(b.close_approach_data?.[0]?.close_approach_date || 0);
        break;
      case 'distance':
        aVal = parseFloat(a.close_approach_data?.[0]?.miss_distance?.kilometers || 0);
        bVal = parseFloat(b.close_approach_data?.[0]?.miss_distance?.kilometers || 0);
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="loader mx-auto"></div>
      </div>
    );
  }

  if (asteroids.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No asteroids found for this date</p>
      </div>
    );
  }

  return (
    <>
      {/* Sort Controls */}
      <div className="flex justify-end space-x-2 mb-4">
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="px-3 py-1 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-sm"
        >
          <option value="close_approach_date">Date</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
          <option value="distance">Distance</option>
        </select>
        <button
          onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-1 bg-cosmic-light border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
        >
          {sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
        </button>
      </div>

      {/* Asteroid Grid/List */}
      <div className={detailed ? 'space-y-4' : 'grid md:grid-cols-2 lg:grid-cols-3 gap-4'}>
        {sortedAsteroids.map((asteroid) => (
          <motion.div
            key={asteroid.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cosmic-card p-4 cursor-pointer hover:border-cosmic-accent transition-colors"
            onClick={() => setSelectedAsteroid(asteroid)}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold truncate max-w-[200px]" title={asteroid.name}>
                  {asteroid.name}
                </h3>
                <p className="text-xs text-gray-400">ID: {asteroid.id}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite(asteroid.id);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  favorites[asteroid.id]
                    ? 'text-red-500'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <FaHeart />
              </button>
            </div>

            {/* Hazard Indicator */}
            <div className={`flex items-center space-x-1 text-sm mb-3 ${getHazardColor(asteroid.is_potentially_hazardous_asteroid)}`}>
              <FaExclamationTriangle />
              <span>
                {asteroid.is_potentially_hazardous_asteroid
                  ? 'Potentially Hazardous'
                  : 'Not Hazardous'}
              </span>
            </div>

            {/* Close Approach Data */}
            {asteroid.close_approach_data?.[0] && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Close Approach:</span>
                  <span className="font-mono">
                    {format(new Date(asteroid.close_approach_data[0].close_approach_date), 'PPP')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Miss Distance:</span>
                  <span className="font-mono">
                    {formatDistance(parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Relative Velocity:</span>
                  <span className="font-mono">
                    {formatVelocity(parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour))}
                  </span>
                </div>
                {detailed && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="font-mono">{getSizeEstimate(asteroid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Magnitude:</span>
                      <span className="font-mono">{asteroid.absolute_magnitude_h.toFixed(2)} H</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Asteroid Details Modal */}
      <AnimatePresence>
        {selectedAsteroid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedAsteroid(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="cosmic-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-orbitron font-bold mb-4">{selectedAsteroid.name}</h2>
                
                {/* Basic Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">NASA JPL URL:</span>
                    <a
                      href={selectedAsteroid.nasa_jpl_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cosmic-accent hover:underline"
                    >
                      View in JPL Database
                    </a>
                  </div>

                  <div className={`flex items-center space-x-2 ${getHazardColor(selectedAsteroid.is_potentially_hazardous_asteroid)}`}>
                    <FaExclamationTriangle />
                    <span className="font-semibold">
                      {selectedAsteroid.is_potentially_hazardous_asteroid
                        ? 'Potentially Hazardous Asteroid'
                        : 'Not Hazardous'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="cosmic-card p-3">
                      <p className="text-sm text-gray-400">Absolute Magnitude</p>
                      <p className="text-xl font-bold">{selectedAsteroid.absolute_magnitude_h} H</p>
                    </div>
                    <div className="cosmic-card p-3">
                      <p className="text-sm text-gray-400">Size Range</p>
                      <p className="text-xl font-bold">{getSizeEstimate(selectedAsteroid)}</p>
                    </div>
                  </div>
                </div>

                {/* Close Approaches */}
                <h3 className="text-lg font-semibold mb-3">Close Approach Data</h3>
                <div className="space-y-4">
                  {selectedAsteroid.close_approach_data?.map((approach, index) => (
                    <div key={index} className="cosmic-card p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Date</p>
                          <p className="font-semibold">
                            {format(new Date(approach.close_approach_date), 'PPP')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Orbiting Body</p>
                          <p className="font-semibold">{approach.orbiting_body}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Miss Distance</p>
                          <p className="font-semibold">{formatDistance(parseFloat(approach.miss_distance.kilometers))}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Relative Velocity</p>
                          <p className="font-semibold">{formatVelocity(parseFloat(approach.relative_velocity.kilometers_per_hour))}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AsteroidTracker;
