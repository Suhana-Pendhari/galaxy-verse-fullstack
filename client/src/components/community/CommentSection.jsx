import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaReply, FaEllipsisV, FaFlag } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { getComments, createComment, likeComment, deleteComment } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const CommentSection = ({ targetType, targetId }) => {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch comments
  const { data, isLoading, refetch } = useQuery(
    ['comments', targetType, targetId, page],
    () => getComments(targetType, targetId, { page, limit: 20 }),
    {
      onSuccess: (data) => {
        if (page === 1) {
          setComments(data.data);
        } else {
          setComments(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      },
    }
  );

  // Create comment mutation
  const createMutation = useMutation(
    (data) => createComment(data),
    {
      onSuccess: () => {
        setNewComment('');
        refetch();
        toast.success('Comment added');
      },
      onError: () => toast.error('Failed to add comment'),
    }
  );

  // Like comment mutation
  const likeMutation = useMutation(
    (commentId) => likeComment(commentId),
    {
      onSuccess: (data, commentId) => {
        setComments(prev => prev.map(comment => {
          if (comment._id === commentId) {
            return { ...comment, likeCount: data.likeCount };
          }
          return comment;
        }));
      },
    }
  );

  // Delete comment mutation
  const deleteMutation = useMutation(
    (commentId) => deleteComment(commentId),
    {
      onSuccess: (_, commentId) => {
        setComments(prev => prev.filter(c => c._id !== commentId));
        toast.success('Comment deleted');
      },
    }
  );

  // Socket listeners for real-time comments
  useEffect(() => {
    if (socket) {
      socket.on('new-comment', (comment) => {
        if (comment.targetId === targetId) {
          setComments(prev => [comment, ...prev]);
        }
      });

      return () => {
        socket.off('new-comment');
      };
    }
  }, [socket, targetId]);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    if (!newComment.trim()) return;

    createMutation.mutate({
      content: newComment,
      targetType,
      targetId,
    });
  };

  const handleSubmitReply = (commentId) => {
    if (!replyText.trim()) return;

    createMutation.mutate({
      content: replyText,
      targetType: 'comment',
      targetId: commentId,
      parentComment: commentId,
    });

    setReplyingTo(null);
    setReplyText('');
  };

  const handleLike = (commentId) => {
    if (!isAuthenticated) {
      toast.error('Please login to like comments');
      return;
    }
    likeMutation.mutate(commentId);
  };

  const handleDelete = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(commentId);
    }
  };

  const CommentComponent = ({ comment, depth = 0 }) => {
    const [showActions, setShowActions] = useState(false);
    const [showReplies, setShowReplies] = useState(depth < 2);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-4 ${depth > 0 ? 'ml-8' : ''}`}
      >
        <div className="flex space-x-3">
          {/* Avatar */}
          <img
            src={comment.author?.profilePicture || 'https://via.placeholder.com/40'}
            alt={comment.author?.username}
            className="w-10 h-10 rounded-full"
          />

          <div className="flex-1">
            {/* Comment Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{comment.author?.username}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-500">(edited)</span>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 hover:bg-cosmic-primary/20 rounded"
                >
                  <FaEllipsisV className="text-sm" />
                </button>

                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-1 w-48 bg-cosmic-light rounded-lg shadow-lg border border-cosmic-primary/30 overflow-hidden z-10"
                    >
                      {(user?._id === comment.author?._id || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setReplyingTo(comment._id);
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-cosmic-primary/20 transition-colors"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => toast.info('Report feature coming soon')}
                        className="w-full px-4 py-2 text-left hover:bg-cosmic-primary/20 transition-colors"
                      >
                        Report
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Comment Content */}
            <p className="mt-1 text-gray-300">{comment.content}</p>

            {/* Comment Actions */}
            <div className="flex items-center space-x-4 mt-2">
              <button
                onClick={() => handleLike(comment._id)}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  comment.likes?.includes(user?._id)
                    ? 'text-red-500'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <FaHeart />
                <span>{comment.likeCount || 0}</span>
              </button>

              <button
                onClick={() => setReplyingTo(comment._id)}
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-cosmic-accent transition-colors"
              >
                <FaReply />
                <span>Reply</span>
              </button>

              {comment.replyCount > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-sm text-cosmic-accent hover:underline"
                >
                  {showReplies ? 'Hide' : 'Show'} {comment.replyCount} replies
                </button>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment._id && (
              <div className="mt-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
                  rows="2"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmitReply(comment._id)}
                    className="px-3 py-1 text-sm bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}

            {/* Nested Replies */}
            {showReplies && comment.replies?.length > 0 && (
              <div className="mt-4">
                {comment.replies.map(reply => (
                  <CommentComponent key={reply._id} comment={reply} depth={depth + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="flex space-x-3">
        {isAuthenticated && (
          <img
            src={user?.profilePicture || 'https://via.placeholder.com/40'}
            alt={user?.username}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isAuthenticated ? "Share your thoughts..." : "Please login to comment"}
            disabled={!isAuthenticated}
            className="w-full px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent disabled:opacity-50 disabled:cursor-not-allowed"
            rows="3"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!isAuthenticated || !newComment.trim()}
              className="px-4 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Comment
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map(comment => (
          <CommentComponent key={comment._id} comment={comment} />
        ))}

        {isLoading && (
          <div className="text-center py-4">
            <div className="loader mx-auto"></div>
          </div>
        )}

        {hasMore && !isLoading && (
          <button
            onClick={() => setPage(prev => prev + 1)}
            className="w-full py-2 text-cosmic-accent hover:underline"
          >
            Load More Comments
          </button>
        )}

        {!isLoading && comments.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
