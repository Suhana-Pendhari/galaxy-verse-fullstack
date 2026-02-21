import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaFilter, FaUserCog, FaBan, 
  FaCheck, FaTimes, FaEye, FaTrash 
} from 'react-icons/fa';
import { getUsers, updateUserRole, toggleUserStatus } from '../../services/api';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const UserManagement = () => {
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    page: 1,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const { data, isLoading, refetch } = useQuery(
    ['adminUsers', filters],
    () => getUsers(filters),
    {
      onError: (error) => {
        toast.error('Failed to load users');
      },
    }
  );

  const updateRoleMutation = useMutation(
    ({ userId, role }) => updateUserRole(userId, role),
    {
      onSuccess: () => {
        toast.success('User role updated');
        refetch();
      },
      onError: () => toast.error('Failed to update role'),
    }
  );

  const toggleStatusMutation = useMutation(
    ({ userId, reason }) => toggleUserStatus(userId, reason),
    {
      onSuccess: (_, { userId }) => {
        toast.success('User status updated');
        refetch();
      },
      onError: () => toast.error('Failed to update status'),
    }
  );

  const users = data?.data || [];
  const pagination = data?.pagination;

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'moderator':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
    }
  };

  const getStatusBadge = (user) => {
    if (!user.isActive) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Banned</span>;
    }
    if (user.isLocked?.()) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Locked</span>;
    }
    return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Active</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          User Management
        </h1>
        <div className="text-sm text-gray-400">
          Total Users: {pagination?.total || 0}
        </div>
      </div>

      {/* Filters */}
      <div className="cosmic-card p-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full px-4 py-2 pl-10 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
            className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
          </select>

          <button
            onClick={() => setFilters({ search: '', role: '', status: '', page: 1 })}
            className="px-4 py-2 border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="cosmic-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cosmic-primary/30">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cosmic-primary/30">
                {users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-cosmic-primary/10 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.profilePicture || 'https://via.placeholder.com/32'}
                          alt={user.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, yyyy') : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      
                      <select
                        value={user.role}
                        onChange={(e) => {
                          if (window.confirm(`Change role to ${e.target.value}?`)) {
                            updateRoleMutation.mutate({ userId: user._id, role: e.target.value });
                          }
                        }}
                        className="p-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg text-sm"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        onClick={() => {
                          const reason = prompt('Enter reason for this action:');
                          if (reason) {
                            toggleStatusMutation.mutate({ 
                              userId: user._id, 
                              reason,
                            });
                          }
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive
                            ? 'hover:bg-red-500/20 text-red-400'
                            : 'hover:bg-green-500/20 text-green-400'
                        }`}
                        title={user.isActive ? 'Ban User' : 'Unban User'}
                      >
                        {user.isActive ? <FaBan /> : <FaCheck />}
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

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="cosmic-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-orbitron font-bold mb-4">User Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedUser.profilePicture || 'https://via.placeholder.com/64'}
                      alt={selectedUser.username}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{selectedUser.username}</h3>
                      <p className="text-gray-400">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cosmic-light/30 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Role</p>
                      <p className="font-semibold capitalize">{selectedUser.role}</p>
                    </div>
                    <div className="bg-cosmic-light/30 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Status</p>
                      <p className="font-semibold">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div className="bg-cosmic-light/30 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Followers</p>
                      <p className="font-semibold">{selectedUser.followers?.length || 0}</p>
                    </div>
                    <div className="bg-cosmic-light/30 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">Following</p>
                      <p className="font-semibold">{selectedUser.following?.length || 0}</p>
                    </div>
                  </div>

                  {selectedUser.bio && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Bio</p>
                      <p className="text-gray-300">{selectedUser.bio}</p>
                    </div>
                  )}

                  {selectedUser.achievements?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Achievements</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.achievements.map((ach, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-cosmic-primary/20 text-xs rounded-full"
                          >
                            {ach.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUser.reports?.length > 0 && (
                    <div className="p-3 bg-red-500/20 rounded-lg">
                      <p className="text-sm font-semibold text-red-400 mb-2">Reports ({selectedUser.reportCount})</p>
                      {selectedUser.reports.map((report, index) => (
                        <div key={index} className="text-sm text-gray-400 mb-1">
                          • {report.reason} - {report.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
