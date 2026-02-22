import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import MissionCard from './MissionCard';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { FaRocket } from 'react-icons/fa';

const MissionList = ({ 
  missions, 
  isLoading, 
  hasMore, 
  onLoadMore,
  emptyMessage = "No missions found",
  emptyDescription = "Try adjusting your filters or check back later for new missions."
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

  if (isLoading && missions.length === 0) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="cosmic-card p-6">
            <Skeleton type="image" className="h-48 -mx-6 -mt-6 mb-4" />
            <Skeleton type="title" className="mb-2" />
            <Skeleton type="text" className="mb-2" />
            <Skeleton type="text" className="mb-4" />
            <div className="flex justify-between">
              <Skeleton type="button" />
              <Skeleton type="button" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <EmptyState
        icon={<FaRocket className="text-6xl" />}
        title={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {missions.map((mission, index) => (
            <motion.div
              key={mission._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <MissionCard mission={mission} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading indicator for infinite scroll */}
      {hasMore && (
        <div ref={ref} className="py-8">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="h-10" />
          )}
        </div>
      )}

      {/* End of list message */}
      {!hasMore && missions.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 py-8"
        >
          🌌 You've reached the end of the missions
        </motion.p>
      )}
    </div>
  );
};

export default MissionList;
