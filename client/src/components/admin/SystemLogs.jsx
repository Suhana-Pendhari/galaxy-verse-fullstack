import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FaFileAlt, FaSearch, FaFilter, FaDownload,
  FaUser, FaRocket, FaNewspaper, FaCog,
  FaExclamationTriangle, FaInfoCircle, FaCheckCircle
} from 'react-icons/fa';
import { getSystemLogs } from '../../services/api';
import Loader from '../common/Loader';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';

const SystemLogs = () => {
  const [filters, setFilters] = useState({
    action: '',
    admin: '',
    startDate: '',
    endDate: '',
    page: 1,
  });
  const [selectedLog, setSelectedLog] = useState(null);

  const { data, isLoading } = useQuery(
    ['systemLogs', filters],
    () => getSystemLogs(filters),
    {
      onError: (error) => {
        console.error('Failed to load logs:', error);
      },
    }
  );

  const logs = data?.data || [];
  const pagination = data?.pagination;

  const getActionIcon = (action) => {
    if (action.includes('user')) return <FaUser />;
    if (action.includes('mission')) return <FaRocket />;
    if (action.includes('post')) return <FaNewspaper />;
    if (action.includes('setting')) return <FaCog />;
    return <FaFileAlt />;
  };

  const getActionColor = (action) => {
    if (action.includes('delete') || action.includes('ban')) return 'text-red-400';
    if (action.includes('create')) return 'text-green-400';
    if (action.includes('update') || action.includes('change')) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const getSeverityIcon = (action) => {
    if (action.includes('delete') || action.includes('ban')) return <FaExclamationTriangle className="text-red-400" />;
    if (action.includes('create')) return <FaCheckCircle className="text-green-400" />;
    return <FaInfoCircle className="text-blue-400" />;
  };

  const exportData = logs.map(log => ({
    Timestamp: format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    Admin: log.admin?.username || 'System',
    Action: log.action,
    'Target Type': log.targetType || '-',
    'Target ID': log.targetId || '-',
    Reason: log.reason || '-',
    'IP Address': log.ipAddress || '-',
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          System Logs
        </h1>
        
        <CSVLink
          data={exportData}
          filename={`system-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`}
          className="flex items-center space-x-2 px-4 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
        >
          <FaDownload />
          <span>Export Logs</span>
        </CSVLink>
      </div>

      {/* Filters */}
      <div className="cosmic-card p-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by action..."
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
              className="w-full px-4 py-2 pl-10 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <input
            type="text"
            placeholder="Admin username..."
            value={filters.admin}
            onChange={(e) => setFilters({ ...filters, admin: e.target.value, page: 1 })}
            className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
            className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
            className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="cosmic-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cosmic-primary/30">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cosmic-primary/30">
                {logs.map((log) => (
                  <motion.tr
                    key={log._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-cosmic-primary/10 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityIcon(log.action)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <img
                          src={log.admin?.profilePicture || 'https://via.placeholder.com/24'}
                          alt={log.admin?.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm">{log.admin?.username || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`flex items-center space-x-1 ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        <span className="text-sm">{log.action.replace(/_/g, ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.targetType ? (
                        <span className="px-2 py-1 bg-cosmic-primary/20 rounded-full text-xs">
                          {log.targetType}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm max-w-xs truncate">
                        {log.reason || (
                          log.changes && Object.keys(log.changes).length > 0 ? 
                          JSON.stringify(log.changes).substring(0, 50) + '...' : 
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {log.ipAddress || '-'}
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

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedLog(null)}>
          <div className="cosmic-card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-2xl font-orbitron font-bold mb-4">Log Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cosmic-light/30 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Timestamp</p>
                    <p className="font-semibold">{format(new Date(selectedLog.createdAt), 'PPP pp')}</p>
                  </div>
                  <div className="bg-cosmic-light/30 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Admin</p>
                    <div className="flex items-center space-x-2">
                      <img
                        src={selectedLog.admin?.profilePicture || 'https://via.placeholder.com/32'}
                        alt={selectedLog.admin?.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <p className="font-semibold">{selectedLog.admin?.username || 'System'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-cosmic-light/30 p-3 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Action</p>
                  <p className={`font-semibold flex items-center space-x-2 ${getActionColor(selectedLog.action)}`}>
                    {getActionIcon(selectedLog.action)}
                    <span>{selectedLog.action.replace(/_/g, ' ')}</span>
                  </p>
                </div>

                {selectedLog.targetType && (
                  <div className="bg-cosmic-light/30 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Target</p>
                    <p className="font-semibold">Type: {selectedLog.targetType}</p>
                    <p className="text-sm text-gray-400 mt-1">ID: {selectedLog.targetId}</p>
                  </div>
                )}

                {selectedLog.reason && (
                  <div className="bg-cosmic-light/30 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Reason</p>
                    <p className="font-semibold">{selectedLog.reason}</p>
                  </div>
                )}

                {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                  <div className="bg-cosmic-light/30 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Changes</p>
                    <div className="space-y-2">
                      {Object.entries(selectedLog.changes).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-400">{key}:</span>{' '}
                          <span className="font-mono">{JSON.stringify(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLog.ipAddress && (
                  <div className="bg-cosmic-light/30 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">IP Address</p>
                    <p className="font-mono">{selectedLog.ipAddress}</p>
                  </div>
                )}

                {selectedLog.userAgent && (
                  <div className="bg-cosmic-light/30 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">User Agent</p>
                    <p className="text-sm break-all">{selectedLog.userAgent}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
