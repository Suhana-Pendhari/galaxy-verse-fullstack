import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaDownload, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { toggleFavorite } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const MarsRoverGallery = ({ photos, isLoading }) => {
  const { isAuthenticated } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [favorites, setFavorites] = useState({});

  const handleFavorite = async (photoId) => {
    if (!isAuthenticated) {
      toast.error('Please login to favorite photos');
      return;
    }

    try {
      await toggleFavorite('roverImages', photoId.toString());
      setFavorites(prev => ({ ...prev, [photoId]: !prev[photoId] }));
      toast.success(favorites[photoId] ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handleDownload = (photo) => {
    const link = document.createElement('a');
    link.href = photo.img_src;
    link.download = `mars-${photo.id}.jpg`;
    link.click();
    toast.success('Download started');
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="loader mx-auto"></div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No photos found</p>
      </div>
    );
  }

  return (
    <>
      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="cosmic-card overflow-hidden cursor-pointer group"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="relative aspect-square">
              <img
                src={photo.img_src}
                alt={`Mars rover ${photo.rover?.name} - ${photo.camera?.full_name}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-semibold truncate">{photo.camera?.full_name}</p>
                  <p className="text-xs text-gray-300">
                    {format(new Date(photo.earth_date), 'PPP')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(photo.id);
                  }}
                  className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
                    favorites[photo.id]
                      ? 'bg-red-500/80 text-white'
                      : 'bg-black/50 hover:bg-black/70 text-white'
                  }`}
                >
                  <FaHeart />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(photo);
                  }}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors"
                >
                  <FaDownload />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-6xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <FaTimes />
              </button>

              {/* Navigation */}
              <button
                onClick={() => {
                  const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
                  setSelectedPhoto(photos[prevIndex]);
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => {
                  const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
                  const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
                  setSelectedPhoto(photos[nextIndex]);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <FaChevronRight />
              </button>

              {/* Image */}
              <img
                src={selectedPhoto.img_src}
                alt={selectedPhoto.camera?.full_name}
                className="w-full h-full object-contain"
              />

              {/* Info Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-bold">{selectedPhoto.rover?.name}</h3>
                    <p className="text-sm text-gray-300">{selectedPhoto.camera?.full_name}</p>
                    <p className="text-sm text-gray-400">
                      {format(new Date(selectedPhoto.earth_date), 'PPP')} (Sol {selectedPhoto.sol})
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFavorite(selectedPhoto.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        favorites[selectedPhoto.id]
                          ? 'bg-red-500/80 text-white'
                          : 'bg-black/50 hover:bg-black/70'
                      }`}
                    >
                      <FaHeart />
                    </button>
                    <button
                      onClick={() => handleDownload(selectedPhoto)}
                      className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MarsRoverGallery;
