import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaRocket, FaCalendar, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import CountdownTimer from '../missions/CountdownTimer';
import Button from '../common/Button';
import Badge from '../common/Badge';

const FeaturedMission = ({ mission }) => {
  if (!mission) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="py-12"
    >
      <h2 className="text-3xl font-orbitron font-bold mb-8 text-center bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
        🚀 Featured Mission
      </h2>

      <div className="cosmic-card overflow-hidden">
        <div className="grid lg:grid-cols-2">
          {/* Image Section */}
          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src={mission.images?.[0]?.url || 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80'}
              alt={mission.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cosmic-dark to-transparent" />
            
            {/* Organization Badge */}
            <div className="absolute top-4 left-4">
              <Badge variant="accent" className="text-lg px-4 py-2">
                {mission.organization}
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 lg:p-12">
            <h3 className="text-3xl font-bold mb-4">{mission.name}</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {mission.description}
            </p>

            {/* Mission Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 text-gray-300">
                <FaCalendar className="text-cosmic-accent" />
                <span>
                  Launch: {new Date(mission.launchDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {mission.launchSite && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <FaMapMarkerAlt className="text-cosmic-accent" />
                  <span>{mission.launchSite.name}, {mission.launchSite.country}</span>
                </div>
              )}

              <div className="flex items-center space-x-3 text-gray-300">
                <FaRocket className="text-cosmic-accent" />
                <span>Rocket: {mission.rocket?.name || 'TBA'}</span>
              </div>

              {new Date(mission.launchDate) > new Date() && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <FaClock className="text-cosmic-accent" />
                  <CountdownTimer launchDate={mission.launchDate} />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Link to={`/missions/${mission._id}`}>
                <Button variant="primary" size="lg">
                  View Mission Details
                </Button>
              </Link>
              {mission.livestreamUrl && (
                <a href={mission.livestreamUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg">
                    Watch Live
                  </Button>
                </a>
              )}
            </div>

            {/* Mission Stats */}
            <div className="mt-8 pt-8 border-t border-cosmic-primary/30 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-cosmic-accent">
                  {mission.stats?.viewCount || 0}
                </div>
                <div className="text-sm text-gray-400">Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cosmic-accent">
                  {mission.stats?.likeCount || 0}
                </div>
                <div className="text-sm text-gray-400">Likes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cosmic-accent">
                  {mission.stats?.watchlistCount || 0}
                </div>
                <div className="text-sm text-gray-400"> Watching</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturedMission;
