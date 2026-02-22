import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaNewspaper, FaArrowRight, FaUser, FaClock } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import Card from '../common/Card';
import Button from '../common/Button';
import Skeleton from '../common/Skeleton';

const LatestNews = ({ posts, isLoading }) => {
  if (isLoading) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-orbitron font-bold mb-8 text-center bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          Latest from Community
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton type="title" className="mb-4" />
              <Skeleton type="text" className="mb-2" />
              <Skeleton type="text" className="mb-4" />
              <div className="flex justify-between">
                <Skeleton type="text" className="w-24" />
                <Skeleton type="text" className="w-24" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          Latest from Community
        </h2>
        <Link to="/community">
          <Button variant="ghost" icon={<FaArrowRight />} iconPosition="right">
            View All
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.slice(0, 3).map((post, index) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={`/community/post/${post._id}`}>
              <Card hoverable className="h-full flex flex-col">
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="relative -mx-6 -mt-6 mb-4 h-48 overflow-hidden">
                    <img
                      src={post.featuredImage.url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cosmic-dark to-transparent" />
                  </div>
                )}

                {/* Category Badge */}
                <div className="mb-3">
                  <span className="px-3 py-1 bg-cosmic-primary/20 text-cosmic-accent text-xs rounded-full">
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:text-cosmic-accent transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                  {post.excerpt || post.content.substring(0, 150)}...
                </p>

                {/* Author and Date */}
                <div className="flex justify-between items-center text-sm text-gray-500 mt-auto pt-4 border-t border-cosmic-primary/30">
                  <div className="flex items-center space-x-2">
                    <img
                      src={post.author?.profilePicture || 'https://via.placeholder.com/24'}
                      alt={post.author?.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{post.author?.username}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaClock className="text-xs" />
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex space-x-4 mt-3 text-xs text-gray-500">
                  <span>❤️ {post.stats?.likes || 0}</span>
                  <span>💬 {post.stats?.comments || 0}</span>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LatestNews;
