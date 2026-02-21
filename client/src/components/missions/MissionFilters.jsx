import React from 'react';
import { motion } from 'framer-motion';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

const MissionFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  organizations,
  statuses,
  missionTypes,
}) => {
  return (
    <motion.div
      layout
      className="cosmic-card p-6"
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Organization Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Organization
          </label>
          <select
            value={filters.organization}
            onChange={(e) => onFilterChange('organization', e.target.value)}
            className="w-full px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white"
          >
            <option value="">All Organizations</option>
            {organizations.map(org => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Mission Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mission Type
          </label>
          <select
            value={filters.missionType}
            onChange={(e) => onFilterChange('missionType', e.target.value)}
            className="w-full px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white"
          >
            <option value="">All Types</option>
            {missionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              className="flex-1 px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white"
            >
              <option value="launchDate">Launch Date</option>
              <option value="name">Name</option>
              <option value="createdAt">Recently Added</option>
              <option value="stats.viewCount">Most Viewed</option>
              <option value="stats.likeCount">Most Liked</option>
            </select>
            <button
              onClick={() => onFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
            >
              {filters.sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </motion.div>
  );
};

export default MissionFilters;
