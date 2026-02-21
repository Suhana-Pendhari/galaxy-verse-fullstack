import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: <FaCheckCircle className="text-green-400 text-xl" />,
    error: <FaExclamationCircle className="text-red-400 text-xl" />,
    warning: <FaExclamationCircle className="text-yellow-400 text-xl" />,
    info: <FaInfoCircle className="text-blue-400 text-xl" />,
  };

  const colors = {
    success: 'border-green-500/30 bg-green-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed bottom-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg border ${colors[type]} shadow-lg`}
      >
        {icons[type]}
        <p className="text-white">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 p-1 hover:bg-white/10 rounded transition-colors"
        >
          <FaTimes className="text-gray-400" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
