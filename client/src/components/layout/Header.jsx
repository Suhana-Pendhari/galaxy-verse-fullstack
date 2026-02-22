import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRocket, FaBars, FaTimes, FaUser, 
  FaSignOutAlt, FaCog, FaBell, FaSearch 
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import Button from '../common/Button';
import Dropdown from '../common/Dropdown';
import Badge from '../common/Badge';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount } = useNotification();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/missions', label: 'Missions' },
    { to: '/space-data', label: 'Space Data' },
    { to: '/solar-system', label: 'Solar System' },
    { to: '/community', label: 'Community' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/satellite', label: 'Satellite Tracker' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-cosmic-dark/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-cosmic-accent"
            >
              <FaRocket size={30} />
            </motion.div>
            <span className="font-orbitron text-xl font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent hidden sm:inline">
              GalaxyVerse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group ${
                  location.pathname === link.to
                    ? 'text-cosmic-accent'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cosmic-accent"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-1.5 pl-10 bg-cosmic-light/50 border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-sm"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            </form>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <Dropdown
                trigger={
                  <button className="relative p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors">
                    <FaBell />
                    {unreadCount > 0 && (
                      <Badge variant="error" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </button>
                }
              >
                <div className="w-80 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-cosmic-primary/30">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif._id}
                        className="p-3 hover:bg-cosmic-primary/10 border-b border-cosmic-primary/10 last:border-0 cursor-pointer"
                      >
                        <p className="text-sm">{notif.message}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-gray-500 text-sm">
                      No notifications
                    </p>
                  )}
                  <Link
                    to="/notifications"
                    className="block p-2 text-center text-sm text-cosmic-accent hover:bg-cosmic-primary/10"
                  >
                    View All
                  </Link>
                </div>
              </Dropdown>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <Dropdown
                trigger={
                  <button className="flex items-center space-x-2 p-1 hover:bg-cosmic-primary/20 rounded-lg transition-colors">
                    <img
                      src={user?.profilePicture || 'https://via.placeholder.com/32'}
                      alt={user?.username}
                      className="w-8 h-8 rounded-full border-2 border-cosmic-accent"
                    />
                    <span className="hidden md:inline text-sm font-medium">
                      {user?.username}
                    </span>
                  </button>
                }
              >
                <div className="py-2">
                  <Link
                    to={`/profile/${user?.username}`}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-cosmic-primary/20 transition-colors"
                  >
                    <FaUser />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-cosmic-primary/20 transition-colors"
                  >
                    <FaCog />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              </Dropdown>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <nav className="py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      location.pathname === link.to
                        ? 'bg-cosmic-primary/20 text-cosmic-accent'
                        : 'hover:bg-cosmic-primary/20'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
