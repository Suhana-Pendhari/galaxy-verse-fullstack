import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FaUsers, FaRocket, FaNewspaper, FaComments, 
  FaEye, FaHeart, FaChartLine, FaExclamationTriangle 
} from 'react-icons/fa';
import { getDashboardStats } from '../../services/api';
import Loader from '../common/Loader';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const { data, isLoading } = useQuery('adminStats', getDashboardStats);

  if (isLoading) return <Loader />;

  const stats = data?.data || {};

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users?.total?.[0]?.count || 0,
      change: stats.users?.newToday?.[0]?.count || 0,
      icon: <FaUsers />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Missions',
      value: stats.missions?.total?.[0]?.count || 0,
      change: stats.missions?.upcoming?.[0]?.count || 0,
      icon: <FaRocket />,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Total Posts',
      value: stats.posts?.total?.[0]?.count || 0,
      change: stats.posts?.pendingModeration?.[0]?.count || 0,
      icon: <FaNewspaper />,
      color: 'from-green-500 to-teal-500',
    },
    {
      title: 'Total Comments',
      value: stats.comments?.total?.[0]?.count || 0,
      change: stats.comments?.pendingModeration?.[0]?.count || 0,
      icon: <FaComments />,
      color: 'from-orange-500 to-red-500',
    },
  ];

  // User registration chart data
  const userChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Users',
        data: [65, 59, 80, 81, 56, 55, 40, 45, 38, 50, 60, 70],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Mission status chart data
  const missionChartData = {
    labels: ['Upcoming', 'In Progress', 'Completed', 'Aborted'],
    datasets: [
      {
        data: [
          stats.missions?.byStatus?.find(s => s._id === 'Upcoming')?.count || 0,
          stats.missions?.byStatus?.find(s => s._id === 'In Progress')?.count || 0,
          stats.missions?.byStatus?.find(s => s._id === 'Completed')?.count || 0,
          stats.missions?.byStatus?.find(s => s._id === 'Aborted')?.count || 0,
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-orbitron font-bold mb-2 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-gray-400">Welcome back, Administrator</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="cosmic-card p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color} bg-opacity-20`}>
                <div className="text-2xl text-white">{card.icon}</div>
              </div>
              <span className="text-xs text-gray-400">+{card.change} today</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{card.value.toLocaleString()}</h3>
            <p className="text-gray-400 text-sm">{card.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="cosmic-card p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <Line
            data={userChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                  ticks: {
                    color: '#9ca3af',
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: '#9ca3af',
                  },
                },
              },
            }}
          />
        </div>

        {/* Mission Status Chart */}
        <div className="cosmic-card p-6">
          <h3 className="text-lg font-semibold mb-4">Mission Status</h3>
          <div className="h-64">
            <Doughnut
              data={missionChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#9ca3af',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="cosmic-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {stats.recentActivity?.map((activity, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-cosmic-light/30 rounded-lg"
            >
              <div className="w-2 h-2 mt-2 bg-cosmic-accent rounded-full" />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{activity.admin?.username}</span>
                  {' '}{activity.action.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="cosmic-card p-4 text-left hover:border-cosmic-accent transition-colors">
          <h4 className="font-semibold mb-1">Review Reported Content</h4>
          <p className="text-sm text-gray-400">12 items pending review</p>
        </button>
        <button className="cosmic-card p-4 text-left hover:border-cosmic-accent transition-colors">
          <h4 className="font-semibold mb-1">Add New Mission</h4>
          <p className="text-sm text-gray-400">Create upcoming space mission</p>
        </button>
        <button className="cosmic-card p-4 text-left hover:border-cosmic-accent transition-colors">
          <h4 className="font-semibold mb-1">Generate Report</h4>
          <p className="text-sm text-gray-400">Monthly analytics report</p>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
