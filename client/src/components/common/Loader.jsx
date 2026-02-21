import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket } from 'react-icons/fa';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-cosmic-dark z-50">
      <div className="text-center">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-cosmic-accent text-6xl mb-4"
        >
          <FaRocket />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-orbitron mb-4"
        >
          <span className="bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
            GalaxyVerse
          </span>
        </motion.div>

        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-cosmic-accent rounded-full"
            />
          ))}
        </div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-4 text-gray-400"
        >
          Loading the universe...
        </motion.p>
      </div>
    </div>
  );
};

export default Loader;
