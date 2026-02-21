import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaRocket } from 'react-icons/fa';
import { format } from 'date-fns';

const Certificate = ({ username, quizTitle, score, date }) => {
  // Generate random star positions for background
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full aspect-[1.414/1] bg-gradient-to-br from-cosmic-dark via-cosmic-primary/20 to-cosmic-secondary rounded-lg overflow-hidden border-2 border-cosmic-accent shadow-2xl"
      style={{
        backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(107, 33, 165, 0.3) 0%, transparent 50%)',
      }}
    >
      {/* Animated Stars Background */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {/* Decorative Border */}
      <div className="absolute inset-4 border-2 border-cosmic-accent/30 rounded-lg" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaRocket className="text-4xl text-cosmic-accent" />
            <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
              GalaxyVerse
            </h1>
          </div>
          <p className="text-cosmic-accent tracking-widest">SPACE ACADEMY</p>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-bold text-white mb-8"
          style={{ textShadow: '0 0 10px rgba(107, 33, 165, 0.5)' }}
        >
          CERTIFICATE
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-gray-300 mb-4"
        >
          OF ACHIEVEMENT
        </motion.p>

        {/* Recipient */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-6"
        >
          <p className="text-lg text-gray-400 mb-2">This is to certify that</p>
          <p className="text-4xl font-bold text-cosmic-accent mb-2">{username}</p>
        </motion.div>

        {/* Quiz Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mb-8"
        >
          <p className="text-lg text-gray-400 mb-2">has successfully completed the quiz</p>
          <p className="text-2xl font-bold text-white mb-2">{quizTitle}</p>
          <div className="flex items-center justify-center space-x-2">
            <FaStar className="text-yellow-400" />
            <span className="text-xl text-cosmic-accent">with a score of {score}%</span>
            <FaStar className="text-yellow-400" />
          </div>
        </motion.div>

        {/* Date & Signature */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="w-full flex justify-between items-end mt-8"
        >
          <div>
            <p className="text-sm text-gray-400">Date</p>
            <p className="font-semibold">{format(date, 'MMMM do, yyyy')}</p>
          </div>
          <div className="text-center">
            <div className="w-48 h-0.5 bg-cosmic-accent mb-2" />
            <p className="text-sm text-gray-400">GalaxyVerse Administration</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Certificate ID</p>
            <p className="font-mono text-xs">GV-{Date.now().toString(36).toUpperCase()}</p>
          </div>
        </motion.div>

        {/* Seal */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.4, type: 'spring' }}
          className="absolute bottom-12 right-12 w-24 h-24 rounded-full border-4 border-cosmic-accent flex items-center justify-center"
        >
          <div className="text-center">
            <FaRocket className="text-2xl text-cosmic-accent mx-auto mb-1" />
            <p className="text-xs font-bold">GALAXYVERSE</p>
            <p className="text-[8px]">SPACE ACADEMY</p>
          </div>
        </motion.div>

        {/* Verification Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-4 text-[8px] text-gray-600"
        >
          This certificate is digitally generated and can be verified at galaxyverse.com/verify
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Certificate;
