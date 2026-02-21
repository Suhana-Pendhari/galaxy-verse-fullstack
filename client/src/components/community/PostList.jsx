import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PostCard from './PostCard';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { FaNewspaper } from 'react-icons/fa';

const PostList = ({ 
  posts, 
  isLoading, 
  hasMore, 
  onLoadMore,
  onPostDelete,
  emptyMessage = "No posts yet",
  emptyDescription = "Be the first to share something with the community!"
}) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  React.useEffect(() => {
    if (inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="cosmic-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Skeleton type="avatar" />
              <div className="flex-1">
                <Skeleton type="text" className="w-1/3" />
                <Skeleton type="text" className="w-1/4" />
              </div>
            </div>
            <Skeleton type="title" className="mb-2" />
            <Skeleton type="text" className="mb-2" />
            <Skeleton type="text" className="mb-4" />
            <div className="flex space-x-4">
              <Skeleton type="button" />
              <Skeleton type="button" />
              <Skeleton type="button" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<FaNewspaper className="text-6xl" />}
        title={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.1 }}
          >
            <PostCard post={post} onDelete={onPostDelete} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading indicator for infinite scroll */}
      {hasMore && (
        <div ref={ref} className="py-4">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="h-10" /> // Invisible element for intersection detection
          )}
        </div>
      )}

      {/* End of list message */}
      {!hasMore && posts.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 py-8"
        >
          🌌 You've reached the end of the cosmos
        </motion.p>
      )}
    </div>
  );
};

export default PostList;
