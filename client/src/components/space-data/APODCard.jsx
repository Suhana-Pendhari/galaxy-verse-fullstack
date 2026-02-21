import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaExpand, FaCompress, FaInfoCircle } from 'react-icons/fa';
import ReactPlayer from 'react-player';

const APODCard = ({ data, expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showInfo, setShowInfo] = useState(false);

  const isVideo = data.media_type === 'video';

  return (
    <motion.div
      layout
      className="cosmic-card overflow-hidden"
    >
      {/* Media */}
      <div className="relative">
        {isVideo ? (
          <div className="aspect-video">
            <ReactPlayer
              url={data.url}
              width="100%"
              height="100%"
              controls
              light={data.thumbnail_url}
            />
          </div>
        ) : (
          <motion.img
            layoutId="apod-image"
            src={isExpanded ? data.hdurl || data.url : data.url}
            alt={data.title}
            className="w-full cursor-pointer"
            style={{ maxHeight: isExpanded ? 'none' : '500px', objectFit: 'cover' }}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        )}

        {/* Overlay Controls */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors"
          >
            <FaInfoCircle />
          </button>
          {!isVideo && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors"
            >
              {isExpanded ? <FaCompress /> : <FaExpand />}
            </button>
          )}
        </div>

        {/* Title Overlay (when collapsed) */}
        {!isExpanded && !showInfo && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-xl font-bold">{data.title}</h3>
            <p className="text-sm text-gray-300">{data.date}</p>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-6 border-t border-cosmic-primary/30"
          >
            <h3 className="text-2xl font-bold mb-2">{data.title}</h3>
            <p className="text-sm text-cosmic-accent mb-4">{data.date}</p>
            {data.copyright && (
              <p className="text-sm text-gray-400 mb-2">© {data.copyright}</p>
            )}
            <p className="text-gray-300 leading-relaxed">{data.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default APODCard;
