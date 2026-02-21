import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter, FaFire, FaNewspaper, FaStar } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { getPosts } from '../services/api';
import PostCard from '../components/community/PostCard';
import CreatePostModal from '../components/community/CreatePostModal';
import TrendingTopics from '../components/community/TrendingTopics';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const CommunityPage = () => {
  const { isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const categories = [
    'All',
    'Space News',
    'Mission Update',
    'Astronomy',
    'Technology',
    'Education',
    'Discussion',
    'Other',
  ];

  // Fetch posts
  const { data, isLoading, refetch } = useQuery(
    ['posts', activeTab, debouncedSearch, selectedCategory, selectedTag, page],
    () => getPosts({
      sortBy: activeTab === 'trending' ? 'trending' : 'createdAt',
      sortOrder: 'desc',
      search: debouncedSearch,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      tag: selectedTag,
      page,
      limit: 10,
    }),
    {
      onSuccess: (data) => {
        if (page === 1) {
          setPosts(data.data);
        } else {
          setPosts(prev => [...prev, ...data.data]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      },
      onError: (error) => {
        toast.error('Failed to load posts');
        console.error(error);
      },
    }
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setPosts([]);
  }, [activeTab, debouncedSearch, selectedCategory, selectedTag]);

  // Infinite scroll
  const [lastElementRef] = useInfiniteScroll({
    hasMore,
    loading: isLoading,
    onLoadMore: () => setPage(prev => prev + 1),
  });

  const tabs = [
    { id: 'latest', label: 'Latest', icon: <FaNewspaper /> },
    { id: 'trending', label: 'Trending', icon: <FaFire /> },
    { id: 'featured', label: 'Featured', icon: <FaStar /> },
  ];

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-orbitron font-bold mb-2 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
            Galaxy Community
          </h1>
          <p className="text-gray-400">
            Connect with fellow space enthusiasts, share your thoughts, and discuss the cosmos
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors glow-button"
          >
            <FaPlus />
            <span>Create Post</span>
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="flex space-x-2 border-b border-cosmic-primary/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'text-cosmic-accent'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cosmic-accent"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent text-white"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === selectedCategory ? '' : category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-cosmic-accent text-white'
                    : 'bg-cosmic-light/30 text-gray-400 hover:bg-cosmic-primary/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Posts List */}
          {isLoading && page === 1 ? (
            <Loader />
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div
                  key={post._id}
                  ref={index === posts.length - 1 ? lastElementRef : null}
                >
                  <PostCard post={post} />
                </div>
              ))}

              {posts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No posts found</p>
                </div>
              )}

              {isLoading && page > 1 && (
                <div className="text-center py-4">
                  <div className="loader mx-auto"></div>
                </div>
              )}

              {!hasMore && posts.length > 0 && (
                <p className="text-center text-gray-500 py-4">
                  You've reached the end of the cosmos 🌌
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TrendingTopics onTagClick={setSelectedTag} />
          
          {/* Community Stats */}
          <div className="cosmic-card p-6">
            <h3 className="font-orbitron font-bold mb-4">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Posts</span>
                <span className="font-semibold">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Users</span>
                <span className="font-semibold">5,678</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Comments Today</span>
                <span className="font-semibold">890</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">New Posts Today</span>
                <span className="font-semibold">123</span>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="cosmic-card p-6">
            <h3 className="font-orbitron font-bold mb-4">Community Guidelines</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Be respectful and kind</li>
              <li>• Stay on topic - space discussion only</li>
              <li>• No spam or self-promotion</li>
              <li>• Credit original sources</li>
              <li>• Report inappropriate content</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal
            onClose={() => setShowCreateModal(false)}
            onPostCreated={() => {
              setShowCreateModal(false);
              refetch();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityPage;
