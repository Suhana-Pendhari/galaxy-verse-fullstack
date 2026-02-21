import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaRocket, FaSatellite, FaSolarSystem, FaUsers, FaBrain, FaMapMarkedAlt } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { getUpcomingMissions, getAPOD, getMissionStats } from '../services/api';
import MissionCard from '../components/missions/MissionCard';
import APODCard from '../components/space-data/APODCard';
import Loader from '../components/common/Loader';
import CountdownTimer from '../components/missions/CountdownTimer';
import toast from 'react-hot-toast';

const HomePage = () => {
  const [featuredMission, setFeaturedMission] = useState(null);

  // Fetch upcoming missions
  const { data: missionsData, isLoading: missionsLoading } = useQuery(
    'upcomingMissions',
    () => getUpcomingMissions(5),
    {
      onError: (error) => {
        toast.error('Failed to load upcoming missions');
        console.error(error);
      },
    }
  );

  // Fetch APOD
  const { data: apodData, isLoading: apodLoading } = useQuery(
    'apod',
    () => getAPOD(),
    {
      onError: (error) => {
        toast.error('Failed to load astronomy picture');
        console.error(error);
      },
    }
  );

  // Fetch mission stats
  const { data: statsData } = useQuery(
    'missionStats',
    () => getMissionStats(),
    {
      onError: (error) => {
        console.error('Failed to load mission stats', error);
      },
    }
  );

  useEffect(() => {
    if (missionsData?.data?.length > 0) {
      setFeaturedMission(missionsData.data[0]);
    }
  }, [missionsData]);

  const features = [
    {
      icon: <FaRocket className="text-4xl" />,
      title: 'Mission Control',
      description: 'Track upcoming rocket launches with real-time countdowns and mission details',
      link: '/missions',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: <FaSatellite className="text-4xl" />,
      title: 'Space Data',
      description: 'Explore NASA APIs for APOD, Mars Rover images, and asteroid data',
      link: '/space-data',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <FaSolarSystem className="text-4xl" />,
      title: '3D Solar System',
      description: 'Interactive 3D visualization of our solar system with planets and orbits',
      link: '/solar-system',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <FaUsers className="text-4xl" />,
      title: 'Community',
      description: 'Connect with space enthusiasts, share posts, and discuss missions',
      link: '/community',
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: <FaBrain className="text-4xl" />,
      title: 'Space Quiz',
      description: 'Test your knowledge with timed quizzes and earn certificates',
      link: '/quiz',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: <FaMapMarkedAlt className="text-4xl" />,
      title: 'Satellite Tracker',
      description: 'Track live positions of satellites including the ISS',
      link: '/satellite',
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  const stats = [
    { label: 'Total Missions', value: statsData?.data?.totalMissions || '...' },
    { label: 'Upcoming Launches', value: statsData?.data?.upcomingMissions || '...' },
    { label: 'Community Posts', value: '1.2K+' },
    { label: 'Active Users', value: '5K+' },
  ];

  if (missionsLoading || apodLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cosmic-primary/20 to-cosmic-secondary/20 p-8 md:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-orbitron font-bold mb-6">
            <span className="bg-gradient-to-r from-cosmic-primary via-cosmic-accent to-cosmic-primary bg-clip-text text-transparent">
              GalaxyVerse
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Your gateway to the cosmos - Track missions, explore space data, and connect with fellow space enthusiasts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/missions"
              className="px-8 py-3 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-all transform hover:scale-105 glow-button"
            >
              Explore Missions
            </Link>
            <Link
              to="/solar-system"
              className="px-8 py-3 border-2 border-cosmic-accent text-cosmic-accent rounded-lg hover:bg-cosmic-accent/10 transition-all transform hover:scale-105"
            >
              Explore 3D Solar System
            </Link>
          </div>
        </motion.div>

        {/* Animated stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="cosmic-card p-6 text-center"
          >
            <div className="text-3xl font-bold text-cosmic-accent mb-2">{stat.value}</div>
            <div className="text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </section>

      {/* Featured Mission */}
      {featuredMission && (
        <section>
          <h2 className="text-3xl font-orbitron font-bold mb-6 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
            🚀 Next Launch
          </h2>
          <div className="cosmic-card p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{featuredMission.name}</h3>
                <p className="text-gray-300 mb-4">{featuredMission.description}</p>
                <div className="space-y-2 mb-4">
                  <p><span className="text-cosmic-accent">Organization:</span> {featuredMission.organization}</p>
                  <p><span className="text-cosmic-accent">Launch Site:</span> {featuredMission.launchSite?.name}</p>
                  <p><span className="text-cosmic-accent">Mission Type:</span> {featuredMission.missionType}</p>
                </div>
                <Link
                  to={`/missions/${featuredMission._id}`}
                  className="inline-block px-6 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
                >
                  View Details
                </Link>
              </div>
              <div className="flex flex-col items-center justify-center">
                <CountdownTimer launchDate={featuredMission.launchDate} />
                {featuredMission.images?.[0] && (
                  <img
                    src={featuredMission.images[0].url}
                    alt={featuredMission.name}
                    className="mt-4 rounded-lg max-h-48 object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section>
        <h2 className="text-3xl font-orbitron font-bold mb-6 text-center bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          Explore GalaxyVerse
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="cosmic-card p-6 group cursor-pointer"
              onClick={() => window.location.href = feature.link}
            >
              <div className={`text-transparent bg-gradient-to-r ${feature.color} bg-clip-text mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 mb-4">{feature.description}</p>
              <span className={`text-transparent bg-gradient-to-r ${feature.color} bg-clip-text font-semibold`}>
                Learn more →
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* APOD Section */}
      {apodData && (
        <section>
          <h2 className="text-3xl font-orbitron font-bold mb-6 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
            📸 Astronomy Picture of the Day
          </h2>
          <APODCard data={apodData.data} />
        </section>
      )}

      {/* Upcoming Missions */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
            🚀 Upcoming Missions
          </h2>
          <Link to="/missions" className="text-cosmic-accent hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missionsData?.data?.map((mission) => (
            <MissionCard key={mission._id} mission={mission} />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="cosmic-card p-12 text-center">
        <h2 className="text-3xl font-orbitron font-bold mb-4">Ready to Explore the Universe?</h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Join our community of space enthusiasts and start your cosmic journey today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-3 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-all transform hover:scale-105 glow-button"
          >
            Sign Up Now
          </Link>
          <Link
            to="/community"
            className="px-8 py-3 border-2 border-cosmic-accent text-cosmic-accent rounded-lg hover:bg-cosmic-accent/10 transition-all transform hover:scale-105"
          >
            Join Community
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
