import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaCalendar, FaMapMarkerAlt, FaHeart, FaEye } from 'react-icons/fa';
import { formatDistanceToNow, format } from 'date-fns';
import CountdownTimer from './CountdownTimer';
import { useAuth } from '../../hooks/useAuth';
import { toggleMissionLike } from '../../services/api';
import toast from 'react-hot-toast';

const MissionCard = ({ mission }) => {
  const { user, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = React.useState(
    isAuthenticated && mission.likes?.includes(user?._id)
  );
  const [likeCount, setLikeCount] = React.useState(mission.stats?.likeCount || 0);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to like missions');
      return;
    }

    try {
      await toggleMissionLike(mission._id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      toast.error('Failed to like mission');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Upcoming': 'text-yellow-400',
      'In Progress': 'text-blue-400',
      'Completed': 'text-green-400',
      'Aborted': 'text-red-400',
      'Delayed': 'text-orange-400',
    };
    return colors[status] || 'text-gray-400';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="cosmic-card overflow-hidden group"
    >
      <Link to={`/missions/${mission._id}`}>
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {mission.images?.[0]?.url ? (
            <img
              src={mission.images[0].url}
              alt={mission.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cosmic-primary to-cosmic-secondary flex items-center justify-center">
              <FaRocket className="text-6xl text-white/30" />
            </div>
          )}
          
          {/* Organization Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-sm font-semibold border border-cosmic-accent">
            {mission.organization}
          </div>

          {/* Status Badge */}
          <div className={`absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-sm font-semibold ${getStatusColor(mission.status)}`}>
            {mission.status}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 group-hover:text-cosmic-accent transition-colors">
            {mission.name}
          </h3>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {mission.description}
          </p>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-300">
              <FaCalendar className="mr-2 text-cosmic-accent" />
              <span>
                {new Date(mission.launchDate) > new Date() ? (
                  <>
                    <CountdownTimer launchDate={mission.launchDate} />
                  </>
                ) : (
                  format(new Date(mission.launchDate), 'PPP')
                )}
              </span>
            </div>

            {mission.launchSite && (
              <div className="flex items-center text-gray-300">
                <FaMapMarkerAlt className="mr-2 text-cosmic-accent" />
                <span className="truncate">{mission.launchSite.name}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-cosmic-primary/30 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <FaHeart />
                <span>{likeCount}</span>
              </button>
              <div className="flex items-center space-x-1 text-gray-400">
                <FaEye />
                <span>{mission.stats?.viewCount || 0}</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(mission.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MissionCard;
