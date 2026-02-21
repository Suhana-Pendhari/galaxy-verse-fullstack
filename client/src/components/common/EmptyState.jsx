import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket } from 'react-icons/fa';

const EmptyState = ({ 
  icon = <FaRocket className="text-6xl" />,
  title = 'No data found',
  description = 'There is nothing to display here yet.',
  action,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 px-4 ${className}`}
    >
      <div className="text-cosmic-accent mb-4 flex justify-center">
        {icon}
      </div>
      
      <h3 className="text-xl font-orbitron font-bold mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
