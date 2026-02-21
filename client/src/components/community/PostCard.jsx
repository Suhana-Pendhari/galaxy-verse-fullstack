import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHeart, FaComment, FaShare, FaBookmark, 
  FaEllipsisV, FaFlag, FaEdit, FaTrash 
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { useMutation, useQueryClient } from 'react-query';
import { likePost, savePost, deletePost } from '../../services/api';
import toast from 'react-hot-toast';

const PostCard = ({ post, onDelete }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showActions, setShowActions] = useState(false);
  const [isLiked, setIsLiked] = useState(
    isAuthenticated && post.likes?.includes(user?._id)
  );
  const [isSaved, setIsSaved] = useState(
    isAuthenticated && user?.savedPosts?.includes(post._id)
  );
  const [likeCount, setLikeCount] = useState(post.stats?.likes || 0);

  // Like mutation
  const likeMutation = useMutation(() => likePost(post._id), {
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      queryClient.invalidateQueries('posts');
    },
    onError: () => toast.error('Failed to update like'),
  });

  // Save mutation
  const saveMutation = useMutation(() => savePost(post._id), {
    onSuccess: () => {
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Removed from saved' : 'Saved to collection');
    },
    onError: () => toast.error('Failed to save post'),
  });

  // Delete mutation
  const deleteMutation = useMutation(() => deletePost(post._id), {
    onSuccess: () => {
      toast.success('Post deleted');
      if (onDelete) onDelete(post._id);
      queryClient.invalidateQueries('posts');
    },
    onError: () => toast.error('Failed to delete post'),
  });

  const handleLike = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }
    likeMutation.mutate();
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to save posts');
      return;
    }
    saveMutation.mutate();
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate();
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/community/post/${post._id}`);
    toast.success('Link copied to clipboard');
  };

  const canModify = user?._id === post.author?._id || user?.role === 'admin';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cosmic-card overflow-hidden hover:border-cosmic-accent transition-colors"
    >
      <Link to={`/community/post/${post._id}`}>
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <img
                src={post.author?.profilePicture || 'https://via.placeholder.com/40'}
                alt={post.author?.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-semibold hover:text-cosmic-accent transition-colors">
                  {post.author?.username}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                  {post.isEdited && <span>(edited)</span>}
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowActions(!showActions);
                }}
                className="p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
              >
                <FaEllipsisV />
              </button>

              {showActions && (
                <div className="absolute right-0 mt-1 w-48 bg-cosmic-light rounded-lg shadow-lg border border-cosmic-primary/30 overflow-hidden z-10">
                  {canModify && (
                    <>
                      <Link
                        to={`/community/post/${post._id}/edit`}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-cosmic-primary/20 transition-colors w-full text-left"
                        onClick={() => setShowActions(false)}
                      >
                        <FaEdit />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={handleDelete}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-red-500/20 text-red-400 transition-colors w-full text-left"
                      >
                        <FaTrash />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowActions(false);
                      toast.info('Report feature coming soon');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-cosmic-primary/20 transition-colors w-full text-left"
                  >
                    <FaFlag />
                    <span>Report</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold mt-4 mb-2 hover:text-cosmic-accent transition-colors">
            {post.title}
          </h2>

          {/* Content Preview */}
          <p className="text-gray-400 line-clamp-3">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-cosmic-primary/20 text-xs rounded-full text-cosmic-accent"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mt-4 rounded-lg overflow-hidden">
              <img
                src={post.featuredImage.url}
                alt={post.title}
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cosmic-primary/30 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <FaHeart />
              <span>{likeCount}</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-400 hover:text-cosmic-accent transition-colors">
              <FaComment />
              <span>{post.stats?.comments || 0}</span>
            </button>

            <button
              onClick={handleShare}
              className="text-gray-400 hover:text-cosmic-accent transition-colors"
            >
              <FaShare />
            </button>
          </div>

          <button
            onClick={handleSave}
            className={`transition-colors ${
              isSaved ? 'text-cosmic-accent' : 'text-gray-400 hover:text-cosmic-accent'
            }`}
          >
            <FaBookmark />
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-16 px-3 py-1 bg-cosmic-accent/20 backdrop-blur-sm rounded-full text-xs font-semibold border border-cosmic-accent">
          {post.category}
        </div>
      </Link>
    </motion.article>
  );
};

export default PostCard;
