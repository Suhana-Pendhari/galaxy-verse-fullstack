import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaDashboard, FaUsers, FaRocket, FaNewspaper, 
  FaChartBar, FaCog, FaShieldAlt, FaFileAlt 
} from 'react-icons/fa';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import MissionManagement from '../components/admin/MissionManagement';
import PostManagement from '../components/admin/PostManagement';
import Analytics from '../components/admin/Analytics';
import SystemLogs from '../components/admin/SystemLogs';
import ModerationTools from '../components/admin/ModerationTools';
import Settings from '../components/admin/Settings';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const AdminPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Redirect if not admin
  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { path: '/admin', icon: <FaDashboard />, label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
    { path: '/admin/missions', icon: <FaRocket />, label: 'Missions' },
    { path: '/admin/posts', icon: <FaNewspaper />, label: 'Posts' },
    { path: '/admin/moderation', icon: <FaShieldAlt />, label: 'Moderation' },
    { path: '/admin/analytics', icon: <FaChartBar />, label: 'Analytics' },
    { path: '/admin/logs', icon: <FaFileAlt />, label: 'System Logs' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-cosmic-dark">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: isSidebarOpen ? 280 : 80 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-cosmic-light border-r border-cosmic-primary/30 h-full overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            {isSidebarOpen && (
              <h2 className="text-xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
                Admin Panel
              </h2>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-cosmic-primary text-white'
                      : 'hover:bg-cosmic-primary/20 text-gray-300'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {isSidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info */}
        {isSidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cosmic-primary/30">
            <div className="flex items-center space-x-3">
              <img
                src={user?.profilePicture || 'https://via.placeholder.com/40'}
                alt={user?.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{user?.username}</p>
                <p className="text-xs text-cosmic-accent capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="missions" element={<MissionManagement />} />
          <Route path="posts" element={<PostManagement />} />
          <Route path="moderation" element={<ModerationTools />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="logs" element={<SystemLogs />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPage;
