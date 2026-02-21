import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import { updateProfile, updateProfilePicture, updateCoverPicture } from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(user?.profilePicture);
  const [coverPreview, setCoverPreview] = useState(user?.coverPicture);

  const updateProfileMutation = useMutation(
    (data) => updateProfile(data),
    {
      onSuccess: (response) => {
        updateUser(response.data);
        queryClient.invalidateQueries(['user', user?.username]);
        toast.success('Profile updated successfully');
        navigate(`/profile/${user?.username}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      },
    }
  );

  const updateProfilePictureMutation = useMutation(
    (formData) => updateProfilePicture(formData),
    {
      onSuccess: (response) => {
        updateUser({ ...user, profilePicture: response.data.profilePicture });
        queryClient.invalidateQueries(['user', user?.username]);
        toast.success('Profile picture updated');
      },
      onError: () => toast.error('Failed to update profile picture'),
    }
  );

  const updateCoverPictureMutation = useMutation(
    (formData) => updateCoverPicture(formData),
    {
      onSuccess: (response) => {
        updateUser({ ...user, coverPicture: response.data.coverPicture });
        queryClient.invalidateQueries(['user', user?.username]);
        toast.success('Cover picture updated');
      },
      onError: () => toast.error('Failed to update cover picture'),
    }
  );

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'profile') {
        setProfileImage(file);
        setProfilePreview(reader.result);
      } else {
        setCoverImage(file);
        setCoverPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload images if changed
    if (profileImage) {
      const profileFormData = new FormData();
      profileFormData.append('image', profileImage);
      await updateProfilePictureMutation.mutateAsync(profileFormData);
    }

    if (coverImage) {
      const coverFormData = new FormData();
      coverFormData.append('image', coverImage);
      await updateCoverPictureMutation.mutateAsync(coverFormData);
    }

    // Update profile data
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-3xl font-orbitron font-bold mb-6 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          Edit Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Cover Image
            </label>
            <div className="relative h-48 rounded-lg overflow-hidden border-2 border-dashed border-cosmic-primary/30 hover:border-cosmic-accent transition-colors">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-cosmic-light/30 flex items-center justify-center">
                  <p className="text-gray-500">Click to upload cover image</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'cover')}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute bottom-4 right-4 p-2 bg-cosmic-primary rounded-full">
                <FaCamera className="text-white" />
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-cosmic-primary/30 hover:border-cosmic-accent transition-colors">
                <img
                  src={profilePreview || 'https://via.placeholder.com/96'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'profile')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="absolute bottom-0 right-0 p-1 bg-cosmic-primary rounded-full">
                  <FaCamera className="text-white text-xs" />
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Recommended: Square image, at least 400x400px
              </p>
            </div>
          </div>

          {/* Bio */}
          <Input
            label="Bio"
            as="textarea"
            rows="4"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            maxLength="500"
          />

          {/* Location */}
          <Input
            label="Location"
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="City, Country"
          />

          {/* Website */}
          <Input
            label="Website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://yourwebsite.com"
          />

          {/* Date of Birth */}
          <Input
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/profile/${user?.username}`)}
              icon={<FaTimes />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<FaSave />}
              loading={updateProfileMutation.isLoading || updateProfilePictureMutation.isLoading || updateCoverPictureMutation.isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileEditPage;
