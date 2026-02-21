import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FaSearch, FaFilter, FaEye, FaTrash, 
  FaCheck, FaTimes, FaFlag, FaEdit 
} from 'react-icons/fa';
import { getPosts, deletePost, moderateContent } from '../../services/api';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PostManagement = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'pending',
    page: 1,
  });
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const { data, isLoading, refetch } = useQuery(
    ['adminPosts', filters],
    () => getPosts({ ...filters, limit: 10, moderationStatus: filters.status }),
    {
      onError: (error) => {
        toast.error('Failed to load posts');
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => deletePost(id),
    {
      onSuccess: () => {
        toast.success('Post deleted');
        refetch();
      },
      onError: () => toast.error('Failed to delete post'),
    }
  );

  const moderateMutation = useMutation(
    ({ id, action, reason }) => moderateContent({ type: 'post', id, action, reason }),
    {
      onSuccess: () => {
        toast.success('Post moderated successfully');
        refetch();
      },
      onError: () => toast.error('Failed to moderate post'),
    }
  );

  const posts = data?.data || [];
  const pagination = data?.pagination;

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
        Post Management
      </h1>

      {/* Filters */}
      <div className="cosmic-card p-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full px-4 py-2 pl-10 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
            className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          >
            <option value="">All Categories</option>
            <option value="Space News">Space News</option>
            <option value="Mission Update">Mission Update</option>
            <option value="Astronomy">Astronomy</option>
            <option value="Technology">Technology</option>
            <option value="Education">Education</option>
            <option value="Discussion">Discussion</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          >
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All Posts</option>
          </select>

          <button
            onClick={() => setFilters({ search: '', category: '', status: 'pending', page: 1 })}
            className="px-4 py-2 border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Posts Table */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="cosmic-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cosmic-primary/30">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Reports
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cosmic-primary/30">
                {posts.map((post) => (
                  <motion.tr
                    key={post._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-cosmic-primary/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{post.title}</p>
                        <p className="text-sm text-gray-400 truncate">{post.excerpt || post.content.substring(0, 100)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <img
                          src={post.author?.profilePicture || 'https://via.placeholder.com/32'}
                          alt={post.author?.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm">{post.author?.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-cosmic-primary/20 rounded-full text-xs">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(post.moderationStatus)}`}>
                        {post.moderationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3 text-sm">
                        <span title="Likes">❤️ {post.stats?.likes || 0}</span>
                        <span title="Comments">💬 {post.stats?.comments || 0}</span>
                        <span title="Views">👁️ {post.stats?.views || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.reportCount > 0 ? (
                        <span className="flex items-center space-x-1 text-red-400">
                          <FaFlag />
                          <span>{post.reportCount}</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowPostModal(true);
                        }}
                        className="p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>

                      {post.moderationStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              if (window.confirm('Approve this post?')) {
                                moderateMutation.mutate({ id: post._id, action: 'approve' });
                              }
                            }}
                            className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for rejection:');
                              if (reason) {
                                moderateMutation.mutate({ id: post._id, action: 'reject', reason });
                              }
                            }}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          if (window.confirm('Delete this post?')) {
                            deleteMutation.mutate(post._id);
                          }
                        }}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-cosmic-primary/30 flex justify-between items-center">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="px-4 py-2 border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {filters.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page === pagination.pages}
                className="px-4 py-2 border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostManagement;
