import React from 'react';
import { motion } from 'framer-motion';
import { FaSatellite, FaMapMarkerAlt, FaClock, FaGlobe } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const SatelliteCard = ({ satellite, onClick, isSelected }) => {
  const getOrbitColor = (orbitType) => {
    const colors = {
      LEO: 'text-green-400',
      MEO: 'text-yellow-400',
      GEO: 'text-red-400',
      Elliptical: 'text-purple-400',
    };
    return colors[orbitType] || 'text-gray-400';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-cosmic-accent/20 border border-cosmic-accent'
          : 'bg-cosmic-light/30 hover:bg-cosmic-primary/20'
      }`}
    >
      <div className="flex items-start space-x-3">
        <FaSatellite className={`text-xl mt-1 ${getOrbitColor(satellite.orbitType)}`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{satellite.name}</p>
          <p className="text-xs text-gray-400">NORAD: {satellite.noradId}</p>
          
          {satellite.currentPosition && (
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center space-x-1 text-gray-400">
                <FaMapMarkerAlt className="text-cosmic-accent" />
                <span>
                  {satellite.currentPosition.latitude.toFixed(2)}°, 
                  {satellite.currentPosition.longitude.toFixed(2)}°
                </span>
              </div>
              <div className="flex items-center space-x-1 text-gray-400">
                <FaGlobe className="text-cosmic-accent" />
                <span>{satellite.orbitType} • {satellite.currentPosition.altitude} km</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-400">
                <FaClock className="text-cosmic-accent" />
                <span>
                  Updated {formatDistanceToNow(new Date(satellite.lastUpdated), { addSuffix: true })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SatelliteCard;
