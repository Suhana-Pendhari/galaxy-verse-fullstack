import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FaUser, FaCalendar, FaMapMarkerAlt, FaLink, 
  FaUsers, FaNewspaper, FaTrophy, FaCog,
  FaEnvelope, FaShare, FaFlag
} from 'react-icons/fa';
import { getUserProfile } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import FollowButton from './FollowButton';
import PostList from './PostList';
import Tabs from '../common/Tabs';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Skeleton from '../common/Skeleton';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [postPage, setPostPage] = useState(1);

  const { data, isLoading, refetch } = useQuery(
    ['user', username],
    () => getUserProfile(username),
    {
      onError: (error) => {
        if (error.response?.status === 404) {
          toast.error('User not found');
          navigate('/community');
        } else {
          toast.error('Failed to load profile');
        }
      },
    }
  );

  const profile = data?.data;
  const isOwnProfile = currentUser?._id === profile?.user?._id;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied to clipboard!');
  };

  const handleReport = () => {
    toast.success('Report feature coming soon');
  };

  const handleMessage = () => {
    toast.success('Messaging feature coming soon');
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) return null;

  const tabs = [
    {
      id: 'posts',
      label: 'Posts',
      icon: <FaNewspaper />,
      content: (
        <PostList
          posts={profile.posts}
          isLoading={false}
          hasMore={false}
          onLoadMore={() => {}}
          emptyMessage="No posts yet"
          emptyDescription="This user hasn't posted anything yet."
        />
      ),
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: <FaTrophy />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.user.achievements?.length > 0 ? (
            profile.user.achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="cosmic-card p-4 text-center"
              >
                <div className="text-4xl mb-2">{achievement.icon || '🏆'}</div>
                <h4 className="font-semibold">{achievement.name}</h4>
                <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Earned {format(new Date(achievement.earnedAt), 'MMM dd, yyyy')}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 text-gray-400">
              No achievements yet
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'about',
      label: 'About',
      icon: <FaUser />,
      content: (
        <div className="space-y-4">
          {profile.user.bio && (
            <div>
              <h4 className="font-semibold mb-2">Bio</h4>
              <p className="text-gray-300">{profile.user.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {profile.user.location && (
              <div className="flex items-center space-x-2 text-gray-400">
                <FaMapMarkerAlt className="text-cosmic-accent" />
                <span>{profile.user.location}</span>
              </div>
            )}

            {profile.user.website && (
              <div className="flex items-center space-x-2 text-gray-400">
                <FaLink className="text-cosmic-accent" />
                <a 
                  href={profile.user.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cosmic-accent hover:underline"
                >
                  Website
                </a>
              </div>
            )}

            <div className="flex items-center space-x-2 text-gray-400">
              <FaCalendar className="text-cosmic-accent" />
              <span>Joined {format(new Date(profile.user.createdAt), 'MMMM yyyy')}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-cosmic-primary/30">
            <h4 className="font-semibold mb-3">Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-cosmic-light/30 rounded-lg">
                <p className="text-2xl font-bold">{profile.stats.totalPosts}</p>
                <p className="text-sm text-gray-400">Posts</p>
              </div>
              <div className="text-center p-3 bg-cosmic-light/30 rounded-lg">
                <p className="text-2xl font-bold">{profile.stats.totalComments}</p>
                <p className="text-sm text-gray-400">Comments</p>
              </div>
              <div className="text-center p-3 bg-cosmic-light/30 rounded-lg">
                <p className="text-2xl font-bold">{profile.stats.followersCount}</p>
                <p className="text-sm text-gray-400">Followers</p>
              </div>
              <div className="text-center p-3 bg-cosmic-light/30 rounded-lg">
                <p className="text-2xl font-bold">{profile.stats.followingCount}</p>
                <p className="text-sm text-gray-400">Following</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="py-8">
      {/* Cover Image */}
      <div className="relative h-64 rounded-t-3xl overflow-hidden">
        <img
          src={profile.user.coverPicture || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80'}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cosmic-dark via-transparent to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="cosmic-card p-6 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <img
              src={profile.user.profilePicture || 'https://via.placeholder.com/128'}
              alt={profile.user.username}
              className="w-32 h-32 rounded-full border-4 border-cosmic-accent"
            />
            {profile.user.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-cosmic-accent rounded-full p-1">
                <FaTrophy className="text-white text-sm" />
              </div>
            )}
          </motion.div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-orbitron font-bold">
                {profile.user.username}
              </h1>
              <Badge variant={profile.user.role === 'admin' ? 'error' : profile.user.role === 'moderator' ? 'warning' : 'info'}>
                {profile.user.role}
              </Badge>
            </div>

            <p className="text-gray-400 mb-4">{profile.user.bio || 'No bio provided'}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <FaUsers className="text-cosmic-accent" />
                <span>{profile.stats.followersCount} followers</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaNewspaper className="text-cosmic-accent" />
                <span>{profile.stats.totalPosts} posts</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaCalendar className="text-cosmic-accent" />
                <span>Joined {format(new Date(profile.user.createdAt), 'MMM yyyy')}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {!isOwnProfile && (
              <>
                <FollowButton
                  userId={profile.user._id}
                  username={profile.user.username}
                  initialIsFollowing={profile.interaction.isFollowing}
                  onFollowChange={() => refetch()}
                />
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleMessage}
                  icon={<FaEnvelope />}
                >
                  Message
                </Button>
              </>
            )}

            {isOwnProfile && (
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate(`/profile/${username}/edit`)}
                icon={<FaCog />}
              >
                Edit Profile
              </Button>
            )}

            <Button
              variant="ghost"
              size="md"
              onClick={handleShare}
              icon={<FaShare />}
            />

            {!isOwnProfile && (
              <Button
                variant="ghost"
                size="md"
                onClick={handleReport}
                icon={<FaFlag />}
                className="text-red-400 hover:bg-red-500/20"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <Tabs tabs={tabs} defaultTab="posts" onChange={setActiveTab} />
      </div>
    </div>
  );
};

// Skeleton loader for profile
const ProfileSkeleton = () => {
  return (
    <div className="py-8">
      <div className="h-64 rounded-t-3xl bg-cosmic-light/30 animate-pulse" />
      
      <div className="cosmic-card p-6 -mt-20 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
          <Skeleton type="avatar" className="w-32 h-32" />
          
          <div className="flex-1 space-y-3">
            <Skeleton type="title" className="w-48" />
            <Skeleton type="text" className="w-64" />
            <div className="flex space-x-4">
              <Skeleton type="text" className="w-20" />
              <Skeleton type="text" className="w-20" />
              <Skeleton type="text" className="w-20" />
            </div>
          </div>

          <div className="flex space-x-2">
            <Skeleton type="button" />
            <Skeleton type="button" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
