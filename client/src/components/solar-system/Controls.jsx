import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRocket, FaGlobe, FaEye, FaEyeSlash, 
  FaChevronUp, FaChevronDown, FaPlay, FaPause,
  FaTag, FaVectorSquare 
} from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md';

const Controls = ({
  orbitSpeed,
  setOrbitSpeed,
  autoRotate,
  setAutoRotate,
  showLabels,
  setShowLabels,
  showOrbits,
  setShowOrbits,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-40"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-cosmic-primary rounded-full flex items-center justify-center text-white hover:bg-cosmic-primary/80 transition-colors mb-2 ml-auto"
      >
        {isOpen ? <FaChevronDown /> : <FaChevronUp />}
      </button>

      {/* Controls Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="cosmic-card p-4 w-64"
          >
            <h3 className="text-sm font-orbitron font-bold mb-3 text-cosmic-accent">
              Simulation Controls
            </h3>

            {/* Speed Control */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MdSpeed className="text-cosmic-accent" />
                  <span className="text-xs">Orbit Speed</span>
                </div>
                <span className="text-xs font-mono bg-cosmic-light px-2 py-1 rounded">
                  {orbitSpeed}x
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={orbitSpeed}
                onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Auto Rotate Toggle */}
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`w-full flex items-center justify-between p-2 rounded-lg mb-2 transition-colors ${
                autoRotate ? 'bg-cosmic-accent/20 text-cosmic-accent' : 'bg-cosmic-light/30 text-gray-400 hover:bg-cosmic-primary/20'
              }`}
            >
              <div className="flex items-center space-x-2">
                {autoRotate ? <FaPause /> : <FaPlay />}
                <span className="text-sm">Auto Rotate</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${autoRotate ? 'bg-cosmic-accent text-white' : 'bg-gray-700'}`}>
                {autoRotate ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Show Labels Toggle */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`w-full flex items-center justify-between p-2 rounded-lg mb-2 transition-colors ${
                showLabels ? 'bg-cosmic-accent/20 text-cosmic-accent' : 'bg-cosmic-light/30 text-gray-400 hover:bg-cosmic-primary/20'
              }`}
            >
              <div className="flex items-center space-x-2">
                {showLabels ? <FaTag /> : <FaEyeSlash />}
                <span className="text-sm">Planet Labels</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${showLabels ? 'bg-cosmic-accent text-white' : 'bg-gray-700'}`}>
                {showLabels ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Show Orbits Toggle */}
            <button
              onClick={() => setShowOrbits(!showOrbits)}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                showOrbits ? 'bg-cosmic-accent/20 text-cosmic-accent' : 'bg-cosmic-light/30 text-gray-400 hover:bg-cosmic-primary/20'
              }`}
            >
              <div className="flex items-center space-x-2">
                {showOrbits ? <FaVectorSquare /> : <FaEyeSlash />}
                <span className="text-sm">Orbit Paths</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${showOrbits ? 'bg-cosmic-accent text-white' : 'bg-gray-700'}`}>
                {showOrbits ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Quick Stats */}
            <div className="mt-4 pt-4 border-t border-cosmic-primary/30">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-cosmic-light/30 p-2 rounded">
                  <p className="text-xs text-gray-400">Planets</p>
                  <p className="text-lg font-bold">8</p>
                </div>
                <div className="bg-cosmic-light/30 p-2 rounded">
                  <p className="text-xs text-gray-400">Distance</p>
                  <p className="text-lg font-bold">52 AU</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Controls;
