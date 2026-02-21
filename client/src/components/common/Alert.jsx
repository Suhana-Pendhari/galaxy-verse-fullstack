import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, FaExclamationCircle, FaInfoCircle, 
  FaExclamationTriangle, FaTimes 
} from 'react-icons/fa';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  dismissible = true,
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const icons = {
    success: <FaCheckCircle className="text-green-400 text-xl" />,
    error: <FaExclamationCircle className="text-red-400 text-xl" />,
    warning: <FaExclamationTriangle className="text-yellow-400 text-xl" />,
    info: <FaInfoCircle className="text-blue-400 text-xl" />,
  };

  const colors = {
    success: 'border-green-500/30 bg-green-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`rounded-lg border p-4 ${colors[type]}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">{icons[type]}</div>
            
            <div className="flex-1">
              {title && <h3 className="font-semibold mb-1">{title}</h3>}
              <p className="text-sm text-gray-300">{message}</p>
            </div>

            {dismissible && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
              >
                <FaTimes className="text-gray-400" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
