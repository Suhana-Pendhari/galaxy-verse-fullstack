import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-cosmic-primary/20 text-cosmic-primary border-cosmic-primary',
    success: 'bg-green-500/20 text-green-400 border-green-500',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
    error: 'bg-red-500/20 text-red-400 border-red-500',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500',
    accent: 'bg-cosmic-accent/20 text-cosmic-accent border-cosmic-accent',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border ${variants[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
