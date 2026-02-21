import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiBell } from 'react-icons/fi';
import { FaRocket, FaSatellite, FaSolarSystem, FaUsers } from 'react-icons/fa6';
import { MdSpaceDashboard } from 'react-icons/md';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 10));
        toast.custom((t) => (
          <div className="bg-cosmic-light border border-cosmic-primary rounded-lg p-4 shadow-lg">
            <p className="text-white">{notification.message}</p>
          </div>
        ));
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <MdSpaceDashboard /> },
    { to: '/missions', label: 'Missions', icon: <FaRocket /> },
    { to: '/space-data', label: 'Space Data', icon: <FaSatellite /> },
    { to: '/solar-system', label: 'Solar System', icon: <FaSolarSystem /> },
    { to: '/community', label: 'Community', icon: <FaUsers /> },
    { to: '/quiz', label: 'Quiz', icon: <FaRocket /> },
    { to: '/satellite', label: 'Satellite Tracker', icon: <FaSatellite /> },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-cosmic-dark/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-cosmic-accent"
            >
              <FaRocket size={30} />
            </motion.div>
            <span className="font-orbitron text-xl font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
              GalaxyVerse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-cosmic-primary/20 hover:text-cosmic-accent flex items-center space-x-1 ${
                  location.pathname === link.to
                    ? 'text-cosmic-accent bg-cosmic-primary/20'
                    : 'text-gray-300'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-full hover:bg-cosmic-primary/20 transition-colors"
                  >
                    <FiBell className="text-xl" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-cosmic-accent rounded-full animate-pulse" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-cosmic-light rounded-lg shadow-xl border border-cosmic-primary/30 overflow-hidden"
                      >
                        <div className="p-3 border-b border-cosmic-primary/30">
                          <h3 className="font-semibold">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notif, index) => (
                              <div
                                key={index}
                                className="p-3 hover:bg-cosmic-primary/10 border-b border-cosmic-primary/10 last:border-0"
                              >
                                <p className="text-sm">{notif.message}</p>
                                <span className="text-xs text-gray-500">
                                  {new Date(notif.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="p-4 text-center text-gray-500">No notifications</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
                  >
                    <img
                      src={user?.profilePicture || 'https://via.placeholder.com/32'}
                      alt={user?.username}
                      className="w-8 h-8 rounded-full border-2 border-cosmic-accent"
                    />
                    <span className="hidden lg:inline text-sm font-medium">
                      {user?.username}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-cosmic-light rounded-lg shadow-xl border border-cosmic-primary/30 overflow-hidden"
                      >
                        <Link
                          to={`/profile/${user?.username}`}
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-cosmic-primary/20 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <FiUser />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-cosmic-primary/20 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <FiSettings />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <FiLogOut />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-cosmic-primary/20 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-cosmic-primary text-white text-sm font-medium hover:bg-cosmic-primary/80 transition-colors glow-button"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-2 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      location.pathname === link.to
                        ? 'text-cosmic-accent bg-cosmic-primary/20'
                        : 'text-gray-300 hover:bg-cosmic-primary/20'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-lg">{link.icon}</span>
                      <span>{link.label}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
