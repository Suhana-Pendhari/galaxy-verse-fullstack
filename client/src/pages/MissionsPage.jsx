import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getMissions } from '../services/api';
import MissionCard from '../components/missions/MissionCard';
import MissionFilters from '../components/missions/MissionFilters';
import Loader from '../components/common/Loader';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { FaSearch, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MissionsPage = () => {
  const [filters, setFilters] = useState({
    organization: '',
    status: '',
    missionType: '',
    search: '',
    sortBy: 'launchDate',
    sortOrder: 'asc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [allMissions, setAllMissions] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch missions
  const { data, isLoading, isFetching, refetch } = useQuery(
    ['missions', page, filters],
    () => getMissions({ ...filters, search: debouncedSearch, page, limit: 9 }),
    {
      keepPreviousData: true,
      onSuccess: (data) => {
        if (page === 1) {
          setAllMissions(data.data);
        } else {
          setAllMissions(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      },
      onError: (error) => {
        toast.error('Failed to load missions');
        console.error(error);
      },
    }
  );

  // Infinite scroll
  const [lastElementRef] = useInfiniteScroll({
    hasMore,
    loading: isFetching,
    onLoadMore: () => setPage(prev => prev + 1),
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setAllMissions([]);
  }, [filters.organization, filters.status, filters.missionType, filters.sortBy, filters.sortOrder, debouncedSearch]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      organization: '',
      status: '',
      missionType: '',
      search: '',
      sortBy: 'launchDate',
      sortOrder: 'asc',
    });
  };

  const organizations = ['NASA', 'SpaceX', 'ISRO', 'ESA', 'Roscosmos', 'Other'];
  const statuses = ['Upcoming', 'In Progress', 'Completed', 'Aborted', 'Delayed'];
  const missionTypes = [
    'Satellite Deployment',
    'Crewed Mission',
    'Cargo Resupply',
    'Planetary Exploration',
    'Space Telescope',
    'Other',
  ];

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-orbitron font-bold mb-2 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          Mission Control
        </h1>
        <p className="text-gray-400">
          Track upcoming and past space missions from space agencies around the world
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search missions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
              showFilters
                ? 'bg-cosmic-accent text-white border-cosmic-accent'
                : 'border-cosmic-primary/30 text-gray-300 hover:bg-cosmic-primary/20'
            }`}
          >
            <FaFilter />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <MissionFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                organizations={organizations}
                statuses={statuses}
                missionTypes={missionTypes}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      {data && (
        <div className="mb-4 text-gray-400">
          Showing {allMissions.length} of {data.pagination.total} missions
        </div>
      )}

      {/* Missions Grid */}
      {isLoading && page === 1 ? (
        <Loader />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allMissions.map((mission, index) => (
              <div
                key={mission._id}
                ref={index === allMissions.length - 1 ? lastElementRef : null}
              >
                <MissionCard mission={mission} />
              </div>
            ))}
          </div>

          {allMissions.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No missions found matching your criteria</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {isFetching && page > 1 && (
            <div className="text-center py-8">
              <div className="loader mx-auto"></div>
            </div>
          )}

          {!hasMore && allMissions.length > 0 && (
            <p className="text-center text-gray-500 mt-8">You've reached the end of the universe 🌌</p>
          )}
        </>
      )}
    </div>
  );
};

export default MissionsPage;
