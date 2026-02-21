import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaImage, FaTags, FaSpinner } from 'react-icons/fa';
import { useMutation } from 'react-query';
import { createPost } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Discussion',
    tags: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    'Space News',
    'Mission Update',
    'Astronomy',
    'Technology',
    'Education',
    'Discussion',
    'Other',
  ];

  // Create post mutation
  const createMutation = useMutation(
    (data) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'tags') {
          formData.append(key, data[key].split(',').map(t => t.trim()));
        } else {
          formData.append(key, data[key]);
        }
      });
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      return createPost(formData);
    },
    {
      onSuccess: () => {
        toast.success('Post created successfully!');
        onPostCreated();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create post');
      },
    }
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Please enter content');
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="cosmic-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
              Create New Post
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-6 p-3 bg-cosmic-light/30 rounded-lg">
            <img
              src={user?.profilePicture || 'https://via.placeholder.com/40'}
              alt={user?.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold">{user?.username}</p>
              <p className="text-xs text-gray-400">Posting as you</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a descriptive title"
                className="w-full px-4 py-3 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white"
                maxLength="200"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your post content here..."
                rows="6"
                className="w-full px-4 py-3 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white resize-none"
                maxLength="5000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.length}/5000 characters
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <div className="relative">
                <FaTags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="space, astronomy, mission"
                  className="w-full px-4 py-3 pl-10 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Featured Image (optional)
              </label>
              <div className="border-2 border-dashed border-cosmic-primary/30 rounded-lg p-4 text-center hover:border-cosmic-accent transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <FaImage className="text-3xl text-gray-400" />
                  <span className="text-sm text-gray-400">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </span>
                </label>
              </div>

              {imagePreview && (
                <div className="mt-2 relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="px-6 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {createMutation.isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <span>Create Post</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreatePostModal;
