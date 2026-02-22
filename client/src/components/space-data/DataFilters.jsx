import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaSearch, FaCalendar, FaCamera, FaRocket, FaGlobe } from 'react-icons/fa';
import Button from '../common/Button';
import Input from '../common/Input';

const DataFilter = ({ 
  type = 'apod', // 'apod', 'mars', 'asteroids'
  filters, 
  onFilterChange, 
  onSearch,
  onClear,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderAPODFilters = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Date
        </label>
        <input
          type="date"
          value={filters.date || ''}
          onChange={(e) => onFilterChange('date', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.thumbs || false}
            onChange={(e) => onFilterChange('thumbs', e.target.checked)}
            className="form-checkbox text-cosmic-accent"
          />
          <span className="text-sm">Include thumbnails</span>
        </label>
      </div>
    </div>
  );

  const renderMarsFilters = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rover
          </label>
          <select
            value={filters.rover || 'curiosity'}
            onChange={(e) => onFilterChange('rover', e.target.value)}
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          >
            <option value="curiosity">Curiosity</option>
            <option value="opportunity">Opportunity</option>
            <option value="spirit">Spirit</option>
            <option value="perseverance">Perseverance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Camera
          </label>
          <select
            value={filters.camera || ''}
            onChange={(e) => onFilterChange('camera', e.target.value)}
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          >
            <option value="">All Cameras</option>
            <option value="FHAZ">Front Hazard</option>
            <option value="RHAZ">Rear Hazard</option>
            <option value="MAST">Mast</option>
            <option value="CHEMCAM">ChemCam</option>
            <option value="MAHLI">MAHLI</option>
            <option value="MARDI">MARDI</option>
            <option value="NAVCAM">Navigation</option>
            <option value="PANCAM">Panoramic</option>
            <option value="MINITES">Mini-TES</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sol (Martian Day)
          </label>
          <Input
            type="number"
            value={filters.sol || ''}
            onChange={(e) => onFilterChange('sol', e.target.value)}
            placeholder="e.g., 1000"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Earth Date
          </label>
          <input
            type="date"
            value={filters.earth_date || ''}
            onChange={(e) => onFilterChange('earth_date', e.target.value)}
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>
      </div>
    </div>
  );

  const renderAsteroidFilters = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => onFilterChange('start_date', e.target.value)}
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => onFilterChange('end_date', e.target.value)}
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>
      </div>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={filters.detailed || false}
          onChange={(e) => onFilterChange('detailed', e.target.checked)}
          className="form-checkbox text-cosmic-accent"
        />
        <span className="text-sm">Show detailed information</span>
      </label>
    </div>
  );

  const getIcon = () => {
    switch (type) {
      case 'apod':
        return <FaCalendar />;
      case 'mars':
        return <FaCamera />;
      case 'asteroids':
        return <FaGlobe />;
      default:
        return <FaFilter />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'apod':
        return 'APOD Filters';
      case 'mars':
        return 'Mars Rover Filters';
      case 'asteroids':
        return 'Asteroid Filters';
      default:
        return 'Filters';
    }
  };

  return (
    <div className={`cosmic-card p-4 ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <span className="text-cosmic-accent">{getIcon()}</span>
          <h3 className="font-semibold">{getTitle()}</h3>
        </div>
        <FaFilter className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search || ''}
                  onChange={(e) => onFilterChange('search', e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Type-specific filters */}
              {type === 'apod' && renderAPODFilters()}
              {type === 'mars' && renderMarsFilters()}
              {type === 'asteroids' && renderAsteroidFilters()}

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSearch?.()}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClear}
                  className="flex-1"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataFilter;
