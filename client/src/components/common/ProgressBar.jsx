import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ 
  value, 
  max = 100, 
  showValue = false,
  size = 'md',
  color = 'accent',
  className = '' 
}) => {
  const percentage = (value / max) * 100;

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const colors = {
    primary: 'bg-cosmic-primary',
    accent: 'bg-cosmic-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-cosmic-light/30 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${colors[color]} rounded-full`}
        />
      </div>
      {showValue && (
        <div className="mt-1 text-right text-sm text-gray-400">
          {value} / {max} ({Math.round(percentage)}%)
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
