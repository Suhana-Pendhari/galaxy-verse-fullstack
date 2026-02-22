import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FaRocket, FaCalendar, FaMapMarkerAlt, FaHeart, FaEye, 
  FaShare, FaBookmark, FaComment, FaUsers, FaClock,
  FaChevronLeft, FaChevronRight, FaPlay, FaPause,
  FaInfoCircle, FaExternalLinkAlt
} from 'react-icons/fa';
import { getMissionById, toggleMissionLike, addToWatchlist, removeFromWatchlist } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import CountdownTimer from '../missions/CountdownTimer';
import LaunchMap from '../missions/LaunchMap';
import CommentSection from '../community/CommentSection';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Tabs from '../common/Tabs';
import ShareDialog from '../common/ShareDialog';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const MissionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch mission details
  const { data, isLoading, refetch } = useQuery(
    ['mission', id],
    () => getMissionById(id),
    {
      onSuccess: (data) => {
        if (isAuthenticated && user) {
          setIsLiked(data.data.likes?.includes(user._id));
          setIsInWatchlist(user.watchlist?.includes(id));
        }
      },
      onError: (error) => {
        toast.error('Failed to load mission details');
        navigate('/missions');
      },
    }
  );

  const mission = data?.data;
  const realtimeData = data?.realtimeData;

  // Like mutation
  const likeMutation = useMutation(() => toggleMissionLike(id), {
    onSuccess: () => {
      setIsLiked(!isLiked);
      refetch();
    },
    onError: () => toast.error('Failed to update like'),
  });

  // Watchlist mutation
  const watchlistMutation = useMutation(
    () => isInWatchlist ? removeFromWatchlist(id) : addToWatchlist(id),
    {
      onSuccess: () => {
        setIsInWatchlist(!isInWatchlist);
        toast.success(isInWatchlist ? 'Removed from watchlist' : 'Added to watchlist');
      },
      onError: () => toast.error('Failed to update watchlist'),
    }
  );

  // Socket listeners for real-time updates
  useEffect(() => {
    if (socket && mission) {
      socket.emit('join-mission', id);

      socket.on('mission-updated', (updatedMission) => {
        refetch();
      });

      socket.on('new-comment', () => {
        refetch();
      });

      return () => {
        socket.emit('leave-mission', id);
        socket.off('mission-updated');
        socket.off('new-comment');
      };
    }
  }, [socket, id, mission]);

  // Auto-play images
  useEffect(() => {
    let interval;
    if (autoPlay && mission?.images?.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === mission.images.length - 1 ? 0 : prev + 1
        );
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, mission?.images]);

  if (isLoading) return <Loader />;
  if (!mission) return null;

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FaInfoCircle />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-300 leading-relaxed">{mission.description}</p>
          
          {mission.missionHighlights && mission.missionHighlights.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Mission Highlights</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {mission.missionHighlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: <FaClock />,
      content: mission.timeline && mission.timeline.length > 0 ? (
        <div className="space-y-4">
          {mission.timeline.map((event, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="w-24 text-cosmic-accent font-mono font-bold">{event.time}</div>
              <div className="flex-1">
                <h4 className="font-semibold">{event.event}</h4>
                <p className="text-sm text-gray-400">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No timeline information available</p>
      ),
    },
    {
      id: 'crew',
      label: 'Crew',
      icon: <FaUsers />,
      content: mission.crew && mission.crew.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {mission.crew.map((member, index) => (
            <div key={index} className="flex items-center space-x-3 p-4 bg-cosmic-light/30 rounded-lg">
              {member.image ? (
                <img src={member.image} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-cosmic-primary/30 flex items-center justify-center">
                  <FaUsers className="text-2xl" />
                </div>
              )}
              <div>
                <h4 className="font-semibold">{member.name}</h4>
                <p className="text-sm text-cosmic-accent">{member.role}</p>
                <p className="text-xs text-gray-400">{member.nationality}</p>
                {member.bio && <p className="text-xs text-gray-500 mt-1">{member.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No crew information available</p>
      ),
    },
    {
      id: 'payload',
      label: 'Payload',
      icon: <FaRocket />,
      content: mission.payload && mission.payload.length > 0 ? (
        <div className="space-y-4">
          {mission.payload.map((item, index) => (
            <div key={index} className="p-4 bg-cosmic-light/30 rounded-lg">
              <h4 className="font-semibold text-cosmic-accent">{item.name}</h4>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <p><span className="text-gray-400">Type:</span> {item.type}</p>
                {item.mass && <p><span className="text-gray-400">Mass:</span> {item.mass} kg</p>}
                {item.destination && <p><span className="text-gray-400">Destination:</span> {item.destination}</p>}
              </div>
              {item.description && <p className="text-sm text-gray-400 mt-2">{item.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No payload information available</p>
      ),
    },
  ];

  return (
    <div className="py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <FaChevronLeft />
        <span>Back to Missions</span>
      </button>

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden h-[60vh]">
        {/* Image Gallery */}
        {mission.images?.length > 0 ? (
          <>
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={mission.images[currentImageIndex].url}
              alt={mission.name}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {mission.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => 
                    prev === 0 ? mission.images.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => 
                    prev === mission.images.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <FaChevronRight />
                </button>

                {/* Auto-play Toggle */}
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className="absolute bottom-4 right-4 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  {autoPlay ? <FaPause /> : <FaPlay />}
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {mission.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'w-8 bg-cosmic-accent'
                          : 'bg-white/50 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cosmic-primary to-cosmic-secondary flex items-center justify-center">
            <FaRocket className="text-8xl text-white/30" />
          </div>
        )}

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center space-x-3 mb-2">
            <Badge variant="accent" size="lg">{mission.organization}</Badge>
            <Badge variant={
              mission.status === 'Upcoming' ? 'warning' :
              mission.status === 'In Progress' ? 'info' :
              mission.status === 'Completed' ? 'success' : 'error'
            } size="lg">
              {mission.status}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-2">
            {mission.name}
          </h1>
          <p className="text-lg text-gray-300">{mission.missionType}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={isLiked ? 'danger' : 'outline'}
            onClick={() => likeMutation.mutate()}
            icon={<FaHeart />}
          >
            {mission.stats?.likeCount || 0}
          </Button>

          <Button
            variant={isInWatchlist ? 'accent' : 'outline'}
            onClick={() => watchlistMutation.mutate()}
            icon={<FaBookmark />}
          >
            {isInWatchlist ? 'In Watchlist' : 'Watch'}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowShareDialog(true)}
            icon={<FaShare />}
          >
            Share
          </Button>

          {mission.livestreamUrl && (
            <a href={mission.livestreamUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" icon={<FaExternalLinkAlt />}>
                Watch Live
              </Button>
            </a>
          )}
        </div>

        <div className="flex items-center space-x-4 text-gray-400">
          <span className="flex items-center space-x-1">
            <FaEye />
            <span>{mission.stats?.viewCount || 0} views</span>
          </span>
          <span className="flex items-center space-x-1">
            <FaComment />
            <span>{mission.stats?.commentCount || 0} comments</span>
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs tabs={tabs} defaultTab="overview" onChange={setActiveTab} />
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Countdown / Launch Info */}
          <div className="cosmic-card p-6">
            <h3 className="text-lg font-semibold mb-4">
              {new Date(mission.launchDate) > new Date() ? 'Launch Countdown' : 'Launch Information'}
            </h3>
            {new Date(mission.launchDate) > new Date() ? (
              <div className="flex justify-center">
                <CountdownTimer launchDate={mission.launchDate} />
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-cosmic-accent mb-2">
                  {format(new Date(mission.launchDate), 'PPP')}
                </div>
                <div className="text-gray-400">
                  {format(new Date(mission.launchDate), 'p')}
                </div>
              </div>
            )}
          </div>

          {/* Launch Site */}
          {mission.launchSite && (
            <div className="cosmic-card p-6">
              <h3 className="text-lg font-semibold mb-4">Launch Site</h3>
              <LaunchMap site={mission.launchSite} />
              <div className="mt-4 space-y-2">
                <p><span className="text-gray-400">Location:</span> {mission.launchSite.name}</p>
                <p><span className="text-gray-400">Country:</span> {mission.launchSite.country}</p>
              </div>
            </div>
          )}

          {/* Rocket Details */}
          {mission.rocket && (
            <div className="cosmic-card p-6">
              <h3 className="text-lg font-semibold mb-4">Rocket</h3>
              <div className="space-y-2">
                <p><span className="text-gray-400">Name:</span> {mission.rocket.name}</p>
                <p><span className="text-gray-400">Type:</span> {mission.rocket.type}</p>
                <p><span className="text-gray-400">Stages:</span> {mission.rocket.stages}</p>
                {mission.rocket.height && (
                  <p><span className="text-gray-400">Height:</span> {mission.rocket.height}m</p>
                )}
                {mission.rocket.mass && (
                  <p><span className="text-gray-400">Mass:</span> {mission.rocket.mass.toLocaleString()} kg</p>
                )}
                {mission.rocket.thrust && (
                  <p><span className="text-gray-400">Thrust:</span> {mission.rocket.thrust.toLocaleString()} kN</p>
                )}
              </div>
            </div>
          )}

          {/* Real-time Data */}
          {realtimeData && (
            <div className="cosmic-card p-6 border-cosmic-accent/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live Updates
              </h3>
              <div className="space-y-2">
                <p><span className="text-gray-400">Next Update:</span> {realtimeData.window}</p>
                {realtimeData.video && (
                  <p><span className="text-gray-400">Webcast:</span> 
                    <a href={realtimeData.video} target="_blank" rel="noopener noreferrer" 
                       className="ml-2 text-cosmic-accent hover:underline">
                      Watch Live
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="cosmic-card p-6">
        <h2 className="text-2xl font-orbitron font-bold mb-6">Discussion</h2>
        <CommentSection targetType="mission" targetId={mission._id} />
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <ShareDialog
          url={window.location.href}
          title={mission.name}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
};

export default MissionDetails;
