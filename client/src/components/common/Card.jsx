import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = true,
  padding = true,
  bordered = true,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { scale: 1.02, y: -5 } : {}}
      transition={{ duration: 0.2 }}
      className={`
        cosmic-card
        ${padding ? 'p-6' : ''}
        ${bordered ? 'border border-cosmic-primary/30' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
