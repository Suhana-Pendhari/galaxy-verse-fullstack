import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaRocket, FaSatellite, FaSolarSystem, FaArrowRight } from 'react-icons/fa';
import Button from '../common/Button';

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const floatingIcons = [
    { Icon: FaRocket, delay: 0, x: '10%', y: '20%' },
    { Icon: FaSatellite, delay: 1, x: '80%', y: '30%' },
    { Icon: FaSolarSystem, delay: 2, x: '15%', y: '70%' },
    { Icon: FaRocket, delay: 0.5, x: '85%', y: '80%' },
  ];

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cosmic-primary/20 to-transparent" />
      
      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute text-cosmic-accent/20 text-6xl"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 5,
            delay,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Icon />
        </motion.div>
      ))}

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-4xl mx-auto px-4"
      >
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-orbitron font-bold mb-6"
        >
          <span className="bg-gradient-to-r from-cosmic-primary via-cosmic-accent to-cosmic-secondary bg-clip-text text-transparent">
            Explore the
          </span>
          <br />
          <span className="bg-gradient-to-r from-cosmic-accent to-cosmic-primary bg-clip-text text-transparent">
            Universe
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
        >
          Your gateway to real-time space missions, interactive 3D solar system,
          and a community of space enthusiasts. Join us on an incredible journey
          through the cosmos.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/missions">
            <Button
              variant="primary"
              size="lg"
              icon={<FaRocket />}
              iconPosition="right"
            >
              Explore Missions
            </Button>
          </Link>
          <Link to="/solar-system">
            <Button
              variant="outline"
              size="lg"
              icon={<FaSolarSystem />}
              iconPosition="right"
            >
              3D Solar System
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
        >
          {[
            { label: 'Missions Tracked', value: '500+' },
            { label: 'Community Members', value: '50K+' },
            { label: 'Space Images', value: '1M+' },
            { label: 'Daily Users', value: '10K+' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-cosmic-accent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-cosmic-accent rounded-full flex justify-center">
            <div className="w-1 h-3 bg-cosmic-accent rounded-full mt-2 animate-pulse" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
