import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { FaCalendar, FaCamera, FaAsterisk, FaSearch, FaHeart, FaDownload } from 'react-icons/fa';
import { getAPOD, getMarsRoverPhotos, getAsteroids, toggleFavorite } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import APODCard from '../components/space-data/APODCard';
import MarsRoverGallery from '../components/space-data/MarsRoverGallery';
import AsteroidTracker from '../components/space-data/AsteroidTracker';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const SpaceDataPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('apod');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const debouncedSearch = useDebounce(searchQuery, 500);

  const tabs = [
    { id: 'apod', label: 'APOD', icon: <FaCalendar /> },
    { id: 'mars', label: 'Mars Rover', icon: <FaCamera /> },
    { id: 'asteroids', label: 'Asteroids', icon: <FaAsterisk /> },
  ];

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-orbitron font-bold mb-2 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          Space Data Explorer
        </h1>
        <p className="text-gray-400">
          Explore NASA's vast collection of space imagery and data
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-cosmic-primary/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all relative ${
              activeTab === tab.id
                ? 'text-cosmic-accent'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cosmic-accent"
              />
            )}
          </button>
        ))}
      </div>

      {/* Search Bar (for relevant tabs) */}
      {(activeTab === 'mars' || activeTab === 'asteroids') && (
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${activeTab === 'mars' ? 'Mars rover photos' : 'asteroids'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'apod' && <APODSection />}
          {activeTab === 'mars' && <MarsRoverSection searchQuery={debouncedSearch} />}
          {activeTab === 'asteroids' && <AsteroidSection searchQuery={debouncedSearch} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// APOD Section
const APODSection = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isFavorite, setIsFavorite] = useState(false);

  const { data, isLoading, refetch } = useQuery(
    ['apod', selectedDate],
    () => getAPOD({ date: selectedDate }),
    {
      onSuccess: (data) => {
        if (data.data.isFavorite !== undefined) {
          setIsFavorite(data.data.isFavorite);
        }
      },
    }
  );

  const handleFavorite = async () => {
    if (!data) return;
    try {
      await toggleFavorite('apod', data.data.date);
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handleDownload = () => {
    if (!data) return;
    const link = document.createElement('a');
    link.href = data.data.hdurl || data.data.url;
    link.download = `apod-${data.data.date}.jpg`;
    link.click();
    toast.success('Download started');
  };

  if (isLoading) return <Loader />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="flex justify-between items-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={format(new Date(), 'yyyy-MM-dd')}
          className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white"
        />
        <div className="flex space-x-2">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-lg border transition-colors ${
              isFavorite
                ? 'bg-red-500/20 border-red-500 text-red-500'
                : 'border-cosmic-primary/30 hover:bg-cosmic-primary/20'
            }`}
          >
            <FaHeart />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg border border-cosmic-primary/30 hover:bg-cosmic-primary/20 transition-colors"
          >
            <FaDownload />
          </button>
        </div>
      </div>

      {/* APOD Content */}
      <APODCard data={data.data} expanded />
    </div>
  );
};

// Mars Rover Section
const MarsRoverSection = ({ searchQuery }) => {
  const [rover, setRover] = useState('curiosity');
  const [camera, setCamera] = useState('');
  const [sol, setSol] = useState('');
  const [earthDate, setEarthDate] = useState('');
  const [page, setPage] = useState(1);
  const [photos, setPhotos] = useState([]);

  const rovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
  const cameras = {
    curiosity: ['FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM'],
    opportunity: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES'],
    spirit: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES'],
    perseverance: ['EDL_RUCAM', 'EDL_DDCAM', 'EDL_PUCAM1', 'EDL_PUCAM2', 'NAVCAM_LEFT', 'NAVCAM_RIGHT', 'MCZ_LEFT', 'MCZ_RIGHT', 'FRONT_HAZCAM_LEFT', 'FRONT_HAZCAM_RIGHT', 'REAR_HAZCAM_LEFT', 'REAR_HAZCAM_RIGHT'],
  };

  const { data, isLoading, refetch } = useQuery(
    ['marsRover', rover, camera, sol, earthDate, page],
    () => getMarsRoverPhotos({
      rover,
      camera: camera || undefined,
      sol: sol || undefined,
      earth_date: earthDate || undefined,
      page,
    }),
    {
      onSuccess: (data) => {
        if (page === 1) {
          setPhotos(data.data);
        } else {
          setPhotos(prev => [...prev, ...data.data]);
        }
      },
    }
  );

  // Filter photos based on search
  const filteredPhotos = photos.filter(photo =>
    photo.camera?.full_name?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    photo.rover?.name?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="cosmic-card p-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <select
            value={rover}
            onChange={(e) => {
              setRover(e.target.value);
              setCamera('');
              setPage(1);
            }}
            className="px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          >
            {rovers.map(r => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>

          <select
            value={camera}
            onChange={(e) => {
              setCamera(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          >
            <option value="">All Cameras</option>
            {cameras[rover]?.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Sol (Martian day)"
            value={sol}
            onChange={(e) => {
              setSol(e.target.value);
              setEarthDate('');
              setPage(1);
            }}
            className="px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />

          <input
            type="date"
            placeholder="Earth Date"
            value={earthDate}
            onChange={(e) => {
              setEarthDate(e.target.value);
              setSol('');
              setPage(1);
            }}
            className="px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>
      </div>

      {/* Photo Gallery */}
      <MarsRoverGallery photos={filteredPhotos} isLoading={isLoading} />
    </div>
  );
};

// Asteroid Section
const AsteroidSection = ({ searchQuery }) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [detailed, setDetailed] = useState(false);

  const { data, isLoading } = useQuery(
    ['asteroids', date, detailed],
    () => getAsteroids({ date, detailed }),
    {
      onError: (error) => {
        toast.error('Failed to load asteroid data');
      },
    }
  );

  const asteroids = data?.data || [];

  // Filter asteroids based on search
  const filteredAsteroids = asteroids.filter(asteroid =>
    asteroid.name?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={format(new Date(), 'yyyy-MM-dd')}
          className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={detailed}
            onChange={(e) => setDetailed(e.target.checked)}
            className="form-checkbox text-cosmic-accent"
          />
          <span>Detailed View</span>
        </label>
      </div>

      {/* Asteroid List */}
      <AsteroidTracker asteroids={filteredAsteroids} isLoading={isLoading} detailed={detailed} />
    </div>
  );
};

export default SpaceDataPage;
