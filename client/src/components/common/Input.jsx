import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  error,
  icon,
  type = 'text',
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-4 py-2
            ${icon ? 'pl-10' : ''}
            bg-cosmic-light
            border ${error ? 'border-red-500' : 'border-cosmic-primary/30'}
            rounded-lg
            focus:outline-none focus:border-cosmic-accent
            text-white
            placeholder-gray-500
            transition-colors
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
