import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGlobe, FaTemperatureHigh, FaClock, FaCalendarAlt, FaMoon } from 'react-icons/fa';
import { GiOrbit, GiPlanetConquest } from 'react-icons/gi';

const PlanetInfo = ({ planet, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 30 }}
        className="fixed top-20 right-4 w-96 max-w-full z-40"
      >
        <div className="cosmic-card p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
          >
            <FaTimes />
          </button>

          {/* Planet Name */}
          <h2 className="text-3xl font-orbitron font-bold mb-2 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
            {planet.name}
          </h2>

          {/* Planet Icon/Color */}
          <div className="flex items-center space-x-2 mb-4">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: planet.color }}
            />
            <span className="text-sm text-gray-400">Click again to close</span>
          </div>

          {/* Description */}
          <p className="text-gray-300 mb-4 leading-relaxed">
            {planet.description}
          </p>

          {/* Facts Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {planet.name !== 'Sun' && (
              <>
                <div className="bg-cosmic-light/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-cosmic-accent mb-1">
                    <GiOrbit />
                    <span className="text-xs">Orbit Speed</span>
                  </div>
                  <p className="text-sm font-semibold">{planet.orbitSpeed * 100} km/s</p>
                </div>

                <div className="bg-cosmic-light/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-cosmic-accent mb-1">
                    <FaClock />
                    <span className="text-xs">Rotation</span>
                  </div>
                  <p className="text-sm font-semibold">{planet.rotationSpeed * 1000} hrs</p>
                </div>
              </>
            )}

            <div className="bg-cosmic-light/30 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-cosmic-accent mb-1">
                <GiPlanetConquest />
                <span className="text-xs">Size (Earth=1)</span>
              </div>
              <p className="text-sm font-semibold">{planet.size}x</p>
            </div>

            {planet.name !== 'Sun' && (
              <div className="bg-cosmic-light/30 p-3 rounded-lg">
                <div className="flex items-center space-x-2 text-cosmic-accent mb-1">
                  <FaGlobe />
                  <span className="text-xs">Distance</span>
                </div>
                <p className="text-sm font-semibold">{planet.distance * 10}M km</p>
              </div>
            )}
          </div>

          {/* Fun Facts */}
          <div className="space-y-2">
            <h3 className="font-semibold text-cosmic-accent mb-2">Quick Facts</h3>
            {planet.facts?.map((fact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-2 text-sm"
              >
                <span className="text-cosmic-accent mt-1">•</span>
                <span className="text-gray-300">{fact}</span>
              </motion.div>
            ))}
          </div>

          {/* Additional Info for Sun */}
          {planet.name === 'Sun' && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                ⚠️ Warning: The Sun is incredibly bright and hot. Do not look directly at it!
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlanetInfo;
