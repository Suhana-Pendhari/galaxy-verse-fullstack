import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaHome, FaSearch } from 'react-icons/fa';
import Button from '../components/common/Button';
import StarsBackground from '../components/common/StarsBackground';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cosmic-dark relative overflow-hidden">
      <StarsBackground />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cosmic-primary/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cosmic-accent/20 rounded-full filter blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-2xl px-4"
      >
        {/* 404 Animation */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-cosmic-accent text-9xl mb-8"
        >
          <FaRocket className="inline-block transform -rotate-45" />
        </motion.div>

        {/* Error Code */}
        <h1 className="text-8xl font-orbitron font-bold mb-4 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          404
        </h1>

        {/* Title */}
        <h2 className="text-3xl font-orbitron font-bold mb-4 text-white">
          Lost in Space
        </h2>

        {/* Description */}
        <p className="text-xl text-gray-400 mb-8">
          The page you're looking for has drifted into the cosmic void. 
          Let's get you back on course.
        </p>

        {/* Suggestions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link to="/">
            <Button variant="primary" size="lg" fullWidth icon={<FaHome />}>
              Return Home
            </Button>
          </Link>
          <Link to="/missions">
            <Button variant="outline" size="lg" fullWidth icon={<FaRocket />}>
              Explore Missions
            </Button>
          </Link>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8 p-4 bg-cosmic-light/30 rounded-lg">
          <p className="text-gray-400 mb-3 flex items-center justify-center space-x-2">
            <FaSearch />
            <span>Looking for something specific?</span>
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search GalaxyVerse..."
              className="flex-1 px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-l-lg focus:outline-none focus:border-cosmic-accent"
            />
            <button className="px-4 py-2 bg-cosmic-primary text-white rounded-r-lg hover:bg-cosmic-primary/80 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex justify-center space-x-4 text-sm text-gray-500">
          <Link to="/" className="hover:text-cosmic-accent transition-colors">
            Home
          </Link>
          <span>•</span>
          <Link to="/missions" className="hover:text-cosmic-accent transition-colors">
            Missions
          </Link>
          <span>•</span>
          <Link to="/community" className="hover:text-cosmic-accent transition-colors">
            Community
          </Link>
          <span>•</span>
          <Link to="/contact" className="hover:text-cosmic-accent transition-colors">
            Contact Support
          </Link>
        </div>
      </motion.div>

      {/* Floating Astronaut (Decorative) */}
      <motion.div
        animate={{ 
          y: [0, -30, 0],
          x: [0, 20, -20, 0]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-10 left-10 text-cosmic-primary/20 text-8xl hidden lg:block"
      >
        👨‍🚀
      </motion.div>

      {/* Floating Planet (Decorative) */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-10 right-10 text-cosmic-accent/20 text-8xl hidden lg:block"
      >
        🪐
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
