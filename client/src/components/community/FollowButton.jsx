import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUserPlus, FaUserCheck, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useMutation, useQueryClient } from 'react-query';
import { toggleFollow } from '../../services/api';
import toast from 'react-hot-toast';

const FollowButton = ({ userId, username, initialIsFollowing = false, onFollowChange }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const followMutation = useMutation(
    () => toggleFollow(userId),
    {
      onMutate: async () => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(['user', username]);
        await queryClient.cancelQueries(['user', userId]);

        // Snapshot previous value
        const previousUser = queryClient.getQueryData(['user', username]);

        // Optimistically update
        setIsFollowing(!isFollowing);

        return { previousUser };
      },
      onError: (err, variables, context) => {
        // Rollback on error
        setIsFollowing(isFollowing);
        queryClient.setQueryData(['user', username], context.previousUser);
        toast.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      },
      onSuccess: () => {
        // Invalidate queries to refetch updated data
        queryClient.invalidateQueries(['user', username]);
        queryClient.invalidateQueries(['user', userId]);
        queryClient.invalidateQueries('suggestions');
        
        toast.success(isFollowing ? `Unfollowed ${username}` : `Now following ${username}`);
        onFollowChange?.(!isFollowing);
      },
    }
  );

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to follow users');
      return;
    }

    if (user?._id === userId) {
      toast.error('You cannot follow yourself');
      return;
    }

    followMutation.mutate();
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleClick}
      disabled={followMutation.isLoading}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all
        ${isFollowing 
          ? 'bg-cosmic-light text-gray-300 hover:bg-cosmic-primary/20 border border-cosmic-primary/30' 
          : 'bg-cosmic-primary text-white hover:bg-cosmic-primary/80 glow-button'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {followMutation.isLoading ? (
        <FaSpinner className="animate-spin" />
      ) : isFollowing ? (
        <FaUserCheck />
      ) : (
        <FaUserPlus />
      )}
      <span>
        {followMutation.isLoading 
          ? 'Processing...' 
          : isFollowing 
            ? 'Following' 
            : 'Follow'
        }
      </span>
    </motion.button>
  );
};

export default FollowButton;
