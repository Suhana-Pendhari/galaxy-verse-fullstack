import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShieldAlt, FaFlag, FaCheck, FaTimes, 
  FaEye, FaBan, FaExclamationTriangle 
} from 'react-icons/fa';
import { getReportedContent, moderateContent } from '../../services/api';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const ModerationTools = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedItem, setSelectedItem] = useState(null);

  const { data, isLoading, refetch } = useQuery(
    ['reportedContent', activeTab],
    () => getReportedContent({ type: activeTab }),
    {
      onError: (error) => {
        toast.error('Failed to load reported content');
      },
    }
  );

  const moderateMutation = useMutation(
    ({ type, id, action, reason }) => moderateContent({ type, id, action, reason }),
    {
      onSuccess: () => {
        toast.success('Content moderated successfully');
        refetch();
        setSelectedItem(null);
      },
      onError: () => toast.error('Failed to moderate content'),
    }
  );

  const tabs = [
    { id: 'posts', label: 'Reported Posts', icon: <FaFlag /> },
    { id: 'comments', label: 'Reported Comments', icon: <FaFlag /> },
    { id: 'pending', label: 'Pending Review', icon: <FaExclamationTriangle /> },
  ];

  const reportedPosts = data?.data?.posts || [];
  const reportedComments = data?.data?.comments || [];
  const pendingPosts = data?.data?.pendingPosts || [];
  const pendingComments = data?.data?.pendingComments || [];

  const renderPostItem = (post) => (
    <div key={post._id} className="border-b border-cosmic-primary/30 last:border-0 p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <img
            src={post.author?.profilePicture || 'https://via.placeholder.com/32'}
            alt={post.author?.username}
            className="w-6 h-6 rounded-full"
          />
          <span className="font-medium">{post.author?.username}</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
          {post.reportCount} reports
        </span>
      </div>

      <h4 className="font-semibold mb-2">{post.title}</h4>
      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{post.content}</p>

      {/* Reports */}
      <div className="mb-3 space-y-2">
        {post.reports?.slice(0, 2).map((report, index) => (
          <div key={index} className="text-xs bg-cosmic-light/30 p-2 rounded">
            <span className="font-medium">{report.user?.username}:</span> {report.reason}
            {report.description && <p className="text-gray-500 mt-1">{report.description}</p>}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => setSelectedItem({ type: 'post', id: post._id })}
          className="flex-1 px-3 py-2 bg-cosmic-primary/20 text-cosmic-accent rounded-lg hover:bg-cosmic-primary/30 transition-colors text-sm"
        >
          Review
        </button>
        <button
          onClick={() => moderateMutation.mutate({ type: 'post', id: post._id, action: 'approve' })}
          className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
          title="Approve"
        >
          <FaCheck />
        </button>
        <button
          onClick={() => {
            const reason = prompt('Reason for rejection:');
            if (reason) {
              moderateMutation.mutate({ type: 'post', id: post._id, action: 'reject', reason });
            }
          }}
          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          title="Reject"
        >
          <FaTimes />
        </button>
        <button
          onClick={() => {
            if (window.confirm('Delete this post?')) {
              moderateMutation.mutate({ type: 'post', id: post._id, action: 'delete' });
            }
          }}
          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          title="Delete"
        >
          <FaBan />
        </button>
      </div>
    </div>
  );

  const renderCommentItem = (comment) => (
    <div key={comment._id} className="border-b border-cosmic-primary/30 last:border-0 p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <img
            src={comment.author?.profilePicture || 'https://via.placeholder.com/32'}
            alt={comment.author?.username}
            className="w-6 h-6 rounded-full"
          />
          <span className="font-medium">{comment.author?.username}</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
          {comment.reportCount} reports
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-3">{comment.content}</p>

      {/* Reports */}
      <div className="mb-3 space-y-2">
        {comment.reports?.slice(0, 2).map((report, index) => (
          <div key={index} className="text-xs bg-cosmic-light/30 p-2 rounded">
            <span className="font-medium">{report.user?.username}:</span> {report.reason}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => moderateMutation.mutate({ type: 'comment', id: comment._id, action: 'approve' })}
          className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
        >
          Approve
        </button>
        <button
          onClick={() => {
            const reason = prompt('Reason for rejection:');
            if (reason) {
              moderateMutation.mutate({ type: 'comment', id: comment._id, action: 'reject', reason });
            }
          }}
          className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
        >
          Reject
        </button>
        <button
          onClick={() => {
            if (window.confirm('Delete this comment?')) {
              moderateMutation.mutate({ type: 'comment', id: comment._id, action: 'delete' });
            }
          }}
          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          title="Delete"
        >
          <FaBan />
        </button>
      </div>
    </div>
  );

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
        Moderation Tools
      </h1>

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
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.id === 'pending' && (pendingPosts.length + pendingComments.length) > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-cosmic-accent text-white text-xs rounded-full">
                {pendingPosts.length + pendingComments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reported Posts */}
        {(activeTab === 'posts' || activeTab === 'pending') && (
          <div className="cosmic-card p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
              <span>Reported Posts</span>
              <span className="text-sm text-gray-400">{reportedPosts.length} items</span>
            </h2>
            <div className="max-h-[600px] overflow-y-auto">
              {reportedPosts.length > 0 ? (
                reportedPosts.map(renderPostItem)
              ) : (
                <p className="text-center text-gray-500 py-8">No reported posts</p>
              )}
            </div>
          </div>
        )}

        {/* Reported Comments */}
        {(activeTab === 'comments' || activeTab === 'pending') && (
          <div className="cosmic-card p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
              <span>Reported Comments</span>
              <span className="text-sm text-gray-400">{reportedComments.length} items</span>
            </h2>
            <div className="max-h-[600px] overflow-y-auto">
              {reportedComments.length > 0 ? (
                reportedComments.map(renderCommentItem)
              ) : (
                <p className="text-center text-gray-500 py-8">No reported comments</p>
              )}
            </div>
          </div>
        )}

        {/* Pending Posts */}
        {activeTab === 'pending' && (
          <>
            <div className="cosmic-card p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                <span>Posts Pending Review</span>
                <span className="text-sm text-gray-400">{pendingPosts.length} items</span>
              </h2>
              <div className="max-h-[600px] overflow-y-auto">
                {pendingPosts.length > 0 ? (
                  pendingPosts.map(renderPostItem)
                ) : (
                  <p className="text-center text-gray-500 py-8">No pending posts</p>
                )}
              </div>
            </div>

            <div className="cosmic-card p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                <span>Comments Pending Review</span>
                <span className="text-sm text-gray-400">{pendingComments.length} items</span>
              </h2>
              <div className="max-h-[600px] overflow-y-auto">
                {pendingComments.length > 0 ? (
                  pendingComments.map(renderCommentItem)
                ) : (
                  <p className="text-center text-gray-500 py-8">No pending comments</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="cosmic-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-orbitron font-bold mb-4">Review Content</h2>
                
                {selectedItem.type === 'post' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Moderation Action
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value === 'approve') {
                            moderateMutation.mutate({ type: 'post', id: selectedItem.id, action: 'approve' });
                          } else if (e.target.value === 'reject') {
                            const reason = prompt('Reason for rejection:');
                            if (reason) {
                              moderateMutation.mutate({ 
                                type: 'post', 
                                id: selectedItem.id, 
                                action: 'reject', 
                                reason 
                              });
                            }
                          }
                          setSelectedItem(null);
                        }}
                        className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
                      >
                        <option value="">Select Action</option>
                        <option value="approve">Approve</option>
                        <option value="reject">Reject</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Or enter custom reason
                      </label>
                      <textarea
                        placeholder="Enter moderation reason..."
                        className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
                        rows="3"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="px-4 py-2 border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          // Handle submission
                          setSelectedItem(null);
                        }}
                        className="px-4 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModerationTools;
