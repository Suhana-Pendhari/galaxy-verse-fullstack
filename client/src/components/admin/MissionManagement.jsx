import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, 
  FaCalendar, FaMapMarkerAlt, FaRocket 
} from 'react-icons/fa';
import { getMissions, deleteMission } from '../../services/api';
import CreateMissionModal from './CreateMissionModal';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const MissionManagement = () => {
  const [filters, setFilters] = useState({
    search: '',
    organization: '',
    status: '',
    page: 1,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMission, setEditingMission] = useState(null);

  const { data, isLoading, refetch } = useQuery(
    ['adminMissions', filters],
    () => getMissions({ ...filters, limit: 10 }),
    {
      onError: (error) => {
        toast.error('Failed to load missions');
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => deleteMission(id),
    {
      onSuccess: () => {
        toast.success('Mission deleted');
        refetch();
      },
      onError: () => toast.error('Failed to delete mission'),
    }
  );

  const missions = data?.data || [];
  const pagination = data?.pagination;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          Mission Management
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
        >
          <FaPlus />
          <span>Add Mission</span>
        </button>
      </div>

      {/* Filters */}
      <div className="cosmic-card p-4">
        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search missions..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />

          <select
            value={filters.organization}
            onChange={(e) => setFilters({ ...filters, organization: e.target.value, page: 1 })}
            className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          >
            <option value="">All Organizations</option>
            <option value="NASA">NASA</option>
            <option value="SpaceX">SpaceX</option>
            <option value="ISRO">ISRO</option>
            <option value="ESA">ESA</option>
            <option value="Roscosmos">Roscosmos</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          >
            <option value="">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Aborted">Aborted</option>
            <option value="Delayed">Delayed</option>
          </select>

          <button
            onClick={() => setFilters({ search: '', organization: '', status: '', page: 1 })}
            className="px-4 py-2 border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Missions Table */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="cosmic-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cosmic-primary/30">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Mission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Launch Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cosmic-primary/30">
                {missions.map((mission) => (
                  <motion.tr
                    key={mission._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-cosmic-primary/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{mission.name}</p>
                        <p className="text-sm text-gray-400 line-clamp-1">{mission.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-cosmic-primary/20 rounded-full text-xs">
                        {mission.organization}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {format(new Date(mission.launchDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${getStatusColor(mission.status)} font-medium`}>
                        {mission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3 text-sm">
                        <span title="Views">👁️ {mission.stats?.viewCount || 0}</span>
                        <span title="Likes">❤️ {mission.stats?.likeCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => window.open(`/missions/${mission._id}`, '_blank')}
                        className="p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => setEditingMission(mission)}
                        className="p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this mission?')) {
                            deleteMutation.mutate(mission._id);
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateMissionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}

      {editingMission && (
        <CreateMissionModal
          mission={editingMission}
          onClose={() => setEditingMission(null)}
          onSuccess={() => {
            setEditingMission(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default MissionManagement;
