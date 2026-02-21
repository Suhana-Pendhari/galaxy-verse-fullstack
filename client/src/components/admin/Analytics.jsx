import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  Line,
  Bar,
  Doughnut,
  Radar,
  PolarArea,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { FaDownload, FaCalendar, FaChartLine } from 'react-icons/fa';
import { getAnalytics } from '../../services/api';
import Loader from '../common/Loader';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [period, setPeriod] = useState('week');
  const [exportFormat, setExportFormat] = useState('');

  const { data, isLoading } = useQuery(
    ['analytics', period],
    () => getAnalytics({ period }),
    {
      onError: (error) => {
        console.error('Failed to load analytics:', error);
      },
    }
  );

  const analytics = data?.data || {};

  // User registration chart
  const userChartData = {
    labels: analytics.userRegistrations?.map(item => {
      if (period === 'day') return `${item._id.hour}:00`;
      if (period === 'week') return `Day ${item._id.day}`;
      if (period === 'month') return `Day ${item._id.day}`;
      return `Month ${item._id.month}`;
    }) || [],
    datasets: [
      {
        label: 'New Users',
        data: analytics.userRegistrations?.map(item => item.count) || [],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Post creation chart
  const postChartData = {
    labels: analytics.postCreation?.map(item => {
      if (period === 'day') return `${item._id.hour}:00`;
      if (period === 'week') return `Day ${item._id.day}`;
      return `Day ${item._id.day}`;
    }) || [],
    datasets: [
      {
        label: 'New Posts',
        data: analytics.postCreation?.map(item => item.count) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Top missions chart
  const topMissionsData = {
    labels: analytics.topMissions?.map(m => m.name) || [],
    datasets: [
      {
        label: 'Views',
        data: analytics.topMissions?.map(m => m.stats?.viewCount || 0) || [],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      },
    ],
  };

  // Active users chart
  const activeUsersData = {
    labels: analytics.activeUsers?.map(u => u.username) || [],
    datasets: [
      {
        label: 'Activity Score',
        data: analytics.activeUsers?.map(u => u.totalActivity || 0) || [],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
      },
    ],
  };

  // Popular tags chart
  const tagsData = {
    labels: analytics.popularTags?.map(t => t._id) || [],
    datasets: [
      {
        data: analytics.popularTags?.map(t => t.count) || [],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('GalaxyVerse Analytics Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Period: ${period}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);

    // Users table
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Users', analytics.users?.total?.[0]?.count || 0],
        ['New Users (Period)', analytics.userRegistrations?.reduce((a, b) => a + b.count, 0) || 0],
        ['Active Users', analytics.activeUsers?.length || 0],
      ],
    });

    // Missions table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Mission', 'Views', 'Organization']],
      body: analytics.topMissions?.map(m => [m.name, m.stats?.viewCount || 0, m.organization]) || [],
    });

    doc.save(`analytics-${period}-${Date.now()}.pdf`);
  };

  const exportData = analytics.userRegistrations ? {
    users: analytics.userRegistrations,
    posts: analytics.postCreation,
    missions: analytics.topMissions,
    activeUsers: analytics.activeUsers,
    tags: analytics.popularTags,
  } : {};

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>

          {/* Export Options */}
          <div className="relative">
            <button
              onClick={() => setExportFormat(exportFormat ? '' : 'menu')}
              className="flex items-center space-x-2 px-4 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
            >
              <FaDownload />
              <span>Export</span>
            </button>

            {exportFormat && (
              <div className="absolute right-0 mt-2 w-48 bg-cosmic-light rounded-lg shadow-lg border border-cosmic-primary/30 overflow-hidden z-10">
                <CSVLink
                  data={exportData}
                  filename={`analytics-${period}.csv`}
                  className="block px-4 py-2 hover:bg-cosmic-primary/20 transition-colors"
                >
                  Export as CSV
                </CSVLink>
                <button
                  onClick={exportToPDF}
                  className="w-full text-left px-4 py-2 hover:bg-cosmic-primary/20 transition-colors"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cosmic-card p-4">
          <p className="text-sm text-gray-400">Total Users</p>
          <p className="text-2xl font-bold">{analytics.users?.total?.[0]?.count || 0}</p>
        </div>
        <div className="cosmic-card p-4">
          <p className="text-sm text-gray-400">New Users</p>
          <p className="text-2xl font-bold">
            {analytics.userRegistrations?.reduce((a, b) => a + b.count, 0) || 0}
          </p>
        </div>
        <div className="cosmic-card p-4">
          <p className="text-sm text-gray-400">Total Posts</p>
          <p className="text-2xl font-bold">{analytics.posts?.total?.[0]?.count || 0}</p>
        </div>
        <div className="cosmic-card p-4">
          <p className="text-sm text-gray-400">Active Users</p>
          <p className="text-2xl font-bold">{analytics.activeUsers?.length || 0}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="cosmic-card p-6">
          <h3 className="text-lg font-semibold mb-4">User Registration Trend</h3>
          <Line
            data={userChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  grid: { color: 'rgba(255, 255, 255, 0.1)' },
                  ticks: { color: '#9ca3af' },
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#9ca3af' },
                },
              },
            }}
          />
        </div>

        {/* Post Creation */}
        <div className="cosmic-card p-6">
          <h3 className="text-lg font-semibold mb-4">Post Creation Trend</h3>
          <Line
            data={postChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  grid: { color: 'rgba(255, 255, 255, 0.1)' },
                  ticks: { color: '#9ca3af' },
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#9ca3af' },
                },
              },
            }}
          />
        </div>

        {/* Top Missions */}
        <div className="cosmic-card p-6">
          <h3 className="text-lg font-semibold mb-4">Most Viewed Missions</h3>
          <Bar
            data={topMissionsData}
            options={{
              responsive: true,
              indexAxis: 'y',
              plugins: {
                legend: { display: false },
              },
              scales: {
                x: {
                  grid: { color: 'rgba(255, 255, 255, 0.1)' },
                  ticks: { color: '#9ca3af' },
                },
                y: {
                  grid: { display: false },
                  ticks: { color: '#9ca3af' },
                },
              },
            }}
          />
        </div>

        {/* Active Users */}
        <div className="cosmic-card p-6">
          <h3 className="text-lg font-semibold mb-4">Most Active Users</h3>
          <Bar
            data={activeUsersData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(255, 255, 255, 0.1)' },
                  ticks: { color: '#9ca3af' },
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#9ca3af' },
                },
              },
            }}
          />
        </div>

        {/* Popular Tags */}
        <div className="cosmic-card p-6">
          <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
          <div className="h-64">
            <Doughnut
              data={tagsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af' },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Activity Radar */}
        <div className="cosmic-card p-6">
          <h3 className="text-lg font-semibold mb-4">Activity Distribution</h3>
          <Radar
            data={{
              labels: ['Users', 'Posts', 'Comments', 'Missions', 'Quizzes'],
              datasets: [
                {
                  label: 'Activity',
                  data: [
                    analytics.users?.total?.[0]?.count || 0,
                    analytics.posts?.total?.[0]?.count || 0,
                    analytics.comments?.total?.[0]?.count || 0,
                    analytics.missions?.total?.[0]?.count || 0,
                    analytics.quizzes?.total || 0,
                  ],
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  borderColor: '#f59e0b',
                  pointBackgroundColor: '#f59e0b',
                },
              ],
            }}
            options={{
              responsive: true,
              scales: {
                r: {
                  grid: { color: 'rgba(255, 255, 255, 0.1)' },
                  pointLabels: { color: '#9ca3af' },
                  ticks: { color: '#9ca3af', backdropColor: 'transparent' },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Missions Table */}
        <div className="cosmic-card p-6">
          <h3 className="text-lg font-semibold mb-4">Top Missions Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cosmic-primary/30">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Mission</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Organization</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Views</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topMissions?.map((mission, index) => (
                  <tr key={index} className="border-b border-cosmic-primary/10">
                    <td className="px-4 py-2 text-sm">{mission.name}</td>
                    <td className="px-4 py-2 text-sm">{mission.organization}</td>
                    <td className="px-4 py-2 text-sm text-right">{mission.stats?.viewCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Users Table */}
        <div className="cosmic-card p-6">
          <h3 className="text-lg font-semibold mb-4">Active Users Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cosmic-primary/30">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Posts</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Comments</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {analytics.activeUsers?.map((user, index) => (
                  <tr key={index} className="border-b border-cosmic-primary/10">
                    <td className="px-4 py-2 text-sm flex items-center space-x-2">
                      <img
                        src={user.profilePicture || 'https://via.placeholder.com/24'}
                        alt={user.username}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{user.username}</span>
                    </td>
                    <td className="px-4 py-2 text-sm">{user.postCount || 0}</td>
                    <td className="px-4 py-2 text-sm">{user.commentCount || 0}</td>
                    <td className="px-4 py-2 text-sm text-right">{user.totalActivity || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
