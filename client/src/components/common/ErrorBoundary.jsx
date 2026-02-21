import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // You can log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cosmic-dark flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full bg-cosmic-light rounded-lg shadow-2xl p-8 text-center border border-cosmic-primary/30"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-cosmic-accent text-6xl mb-4"
            >
              <FaExclamationTriangle />
            </motion.div>
            
            <h1 className="text-3xl font-orbitron font-bold mb-4 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-300 mb-6">
              We've encountered an unexpected error. Our team has been notified and is working on a fix.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors glow-button"
              >
                Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 border border-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/20 transition-colors"
              >
                Go to Homepage
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-red-900/30 rounded-lg text-left">
                <p className="text-red-400 font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                <pre className="text-xs text-gray-400 overflow-auto max-h-40">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
