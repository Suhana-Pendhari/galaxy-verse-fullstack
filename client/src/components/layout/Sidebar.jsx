import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHome, FaRocket, FaSatellite, FaSolarSystem, 
  FaUsers, FaBrain, FaMapMarkedAlt, FaCog,
  FaChartBar, FaNewspaper, FaUserFriends
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/', icon: <FaHome />, label: 'Home' },
    { path: '/missions', icon: <FaRocket />, label: 'Missions' },
    { path: '/space-data', icon: <FaSatellite />, label: 'Space Data' },
    { path: '/solar-system', icon: <FaSolarSystem />, label: 'Solar System' },
    { path: '/community', icon: <FaUsers />, label: 'Community' },
    { path: '/quiz', icon: <FaBrain />, label: 'Quiz' },
    { path: '/satellite', icon: <FaMapMarkedAlt />, label: 'Satellite Tracker' },
  ];

  const communityItems = [
    { path: '/community/feed', icon: <FaNewspaper />, label: 'Feed' },
    { path: '/community/members', icon: <FaUserFriends />, label: 'Members' },
  ];

  const adminItems = [
    { path: '/admin', icon: <FaChartBar />, label: 'Dashboard' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`
          fixed top-0 left-0 bottom-0 w-72 bg-cosmic-light border-r border-cosmic-primary/30
          z-50 overflow-y-auto lg:translate-x-0 lg:static lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mb-8" onClick={onClose}>
            <div className="text-cosmic-accent">
              <FaRocket size={30} />
            </div>
            <span className="font-orbitron text-xl font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
              GalaxyVerse
            </span>
          </Link>

          {/* User Info */}
          {user && (
            <div className="mb-6 p-4 bg-cosmic-primary/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <img
                  src={user.profilePicture || 'https://via.placeholder.com/40'}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div className="space-y-1 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Main
            </p>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${location.pathname === item.path
                    ? 'bg-cosmic-primary text-white'
                    : 'hover:bg-cosmic-primary/20'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Community */}
          <div className="space-y-1 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Community
            </p>
            {communityItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Admin */}
          {user?.role === 'admin' && (
            <div className="space-y-1 mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Admin
              </p>
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-cosmic-primary/30 text-center text-xs text-gray-500">
            <p>© 2024 GalaxyVerse</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
