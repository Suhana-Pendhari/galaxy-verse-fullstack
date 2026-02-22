import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaHeart, FaComment, FaShare, 
  FaBookmark, FaEdit, FaTrash, FaFlag,
  FaUser, FaCalendar, FaTag
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { getPostById, likePost, savePost, deletePost } from '../services/api';
import CommentSection from '../components/community/CommentSection';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import ShareDialog from '../components/common/ShareDialog';
import toast from 'react-hot-toast';

const PostDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch post
  const { data, isLoading, refetch } = useQuery(
    ['post', id],
    () => getPostById(id),
    {
      onSuccess: (data) => {
        setLikeCount(data.data.stats?.likes || 0);
        if (isAuthenticated && data.userInteraction) {
          setIsLiked(data.userInteraction.isLiked);
          setIsSaved(data.userInteraction.isSaved);
        }
      },
      onError: (error) => {
        toast.error('Failed to load post');
        navigate('/community');
      },
    }
  );

  const post = data?.data;

  // Socket listener for real-time updates
  useEffect(() => {
    if (socket && post) {
      socket.emit('join-post', id);

      socket.on('post-updated', () => {
        refetch();
      });

      socket.on('like-updated', ({ likeCount: newCount }) => {
        setLikeCount(newCount);
      });

      return () => {
        socket.emit('leave-post', id);
        socket.off('post-updated');
        socket.off('like-updated');
      };
    }
  }, [socket, id, post]);

  // Like mutation
  const likeMutation = useMutation(() => likePost(id), {
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    },
    onError: () => toast.error('Failed to update like'),
  });

  // Save mutation
  const saveMutation = useMutation(() => savePost(id), {
    onSuccess: () => {
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Removed from saved' : 'Saved to collection');
    },
    onError: () => toast.error('Failed to save post'),
  });

  // Delete mutation
  const deleteMutation = useMutation(() => deletePost(id), {
    onSuccess: () => {
      toast.success('Post deleted');
      navigate('/community');
    },
    onError: () => toast.error('Failed to delete post'),
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }
    likeMutation.mutate();
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save posts');
      return;
    }
    saveMutation.mutate();
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const canModify = user?._id === post?.author?._id || user?.role === 'admin';

  if (isLoading) return <Loader />;
  if (!post) return null;

  return (
    <div className="py-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <FaArrowLeft />
        <span>Back to Community</span>
      </button>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Post Header */}
        <div className="cosmic-card p-6">
          {/* Author Info */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={post.author?.profilePicture || 'https://via.placeholder.com/48'}
                alt={post.author?.username}
                className="w-12 h-12 rounded-full border-2 border-cosmic-accent"
              />
              <div>
                <h3 className="font-semibold text-lg">{post.author?.username}</h3>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <FaCalendar />
                    <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                  </span>
                  {post.isEdited && <span>(edited)</span>}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {canModify && (
                <>
                  <button
                    onClick={() => navigate(`/community/post/${id}/edit`)}
                    className="p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </>
              )}
              <button
                onClick={() => setShowShareDialog(true)}
                className="p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
                title="Share"
              >
                <FaShare />
              </button>
              {!canModify && (
                <button
                  onClick={() => toast.info('Report feature coming soon')}
                  className="p-2 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors"
                  title="Report"
                >
                  <FaFlag />
                </button>
              )}
            </div>
          </div>

          {/* Category & Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="accent">{post.category}</Badge>
            {post.tags?.map(tag => (
              <Badge key={tag} variant="default" className="flex items-center space-x-1">
                <FaTag className="text-xs" />
                <span>{tag}</span>
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-orbitron font-bold mb-4">{post.title}</h1>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={post.featuredImage.url}
                alt={post.title}
                className="w-full max-h-96 object-contain bg-cosmic-light/30"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-6 mt-6 border-t border-cosmic-primary/30">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-500/20 text-red-500'
                  : 'hover:bg-cosmic-primary/20'
              }`}
            >
              <FaHeart className={isLiked ? 'fill-current' : ''} />
              <span>{likeCount}</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isSaved
                  ? 'bg-cosmic-accent/20 text-cosmic-accent'
                  : 'hover:bg-cosmic-primary/20'
              }`}
            >
              <FaBookmark className={isSaved ? 'fill-current' : ''} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => setShowShareDialog(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
            >
              <FaShare />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="cosmic-card p-6">
          <h2 className="text-2xl font-orbitron font-bold mb-6">
            Comments ({post.stats?.comments || 0})
          </h2>
          <CommentSection targetType="post" targetId={post._id} />
        </div>
      </motion.article>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="cosmic-card max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold mb-4">Delete Post</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleteMutation.isLoading}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <ShareDialog
          url={window.location.href}
          title={post.title}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
};

export default PostDetailsPage;
