import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTwitter, FaFacebook, FaLinkedin, FaReddit, 
  FaEnvelope, FaLink, FaTimes 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export const ShareDialog = ({ url, title, onClose }) => {
  const shareOptions = [
    {
      name: 'Twitter',
      icon: <FaTwitter />,
      color: 'bg-[#1DA1F2]',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Facebook',
      icon: <FaFacebook />,
      color: 'bg-[#4267B2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin />,
      color: 'bg-[#0077B5]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Reddit',
      icon: <FaReddit />,
      color: 'bg-[#FF4500]',
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
    {
      name: 'Email',
      icon: <FaEnvelope />,
      color: 'bg-gray-600',
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="cosmic-card max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-orbitron font-bold">Share</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-cosmic-primary/20 rounded-full transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {shareOptions.map((option) => (
              <a
                key={option.name}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${option.color} p-3 rounded-lg flex flex-col items-center space-y-2 hover:opacity-90 transition-opacity`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="text-xs">{option.name}</span>
              </a>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Or copy link
            </label>
            <div className="flex">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-l-lg focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-cosmic-primary text-white rounded-r-lg hover:bg-cosmic-primary/80 transition-colors flex items-center space-x-2"
              >
                <FaLink />
                <span>Copy</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
