import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';
import Button from './Button';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-cosmic-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full cosmic-card p-8 text-center"
      >
        <div className="text-cosmic-accent text-6xl mb-4 flex justify-center">
          <FaExclamationTriangle />
        </div>

        <h1 className="text-3xl font-orbitron font-bold mb-2 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          Oops! Something went wrong
        </h1>

        <p className="text-gray-400 mb-6">
          We encountered an unexpected error. Our team has been notified.
        </p>

        {error && process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
            <p className="text-red-400 font-mono text-sm mb-2">{error.message}</p>
            <pre className="text-xs text-gray-400 overflow-auto max-h-40">
              {error.stack}
            </pre>
          </div>
        )}

        <div className="flex space-x-4 justify-center">
          <Button
            variant="primary"
            onClick={resetErrorBoundary}
            icon={<FaRedo />}
          >
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            icon={<FaHome />}
          >
            Go Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorFallback;
