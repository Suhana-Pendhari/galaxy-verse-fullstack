import React from 'react';
import { useQuery } from 'react-query';
import { FaFire, FaHashtag } from 'react-icons/fa';
import { getTrendingTopics } from '../../services/api';

const TrendingTopics = ({ onTagClick }) => {
  const { data: topics, isLoading } = useQuery('trendingTopics', getTrendingTopics);

  if (isLoading) {
    return (
      <div className="cosmic-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-cosmic-primary/20 rounded w-1/2"></div>
          <div className="h-4 bg-cosmic-primary/20 rounded"></div>
          <div className="h-4 bg-cosmic-primary/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="cosmic-card p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FaFire className="text-cosmic-accent" />
        <h3 className="font-orbitron font-bold">Trending Topics</h3>
      </div>

      <div className="space-y-3">
        {topics?.map((topic) => (
          <button
            key={topic._id}
            onClick={() => onTagClick(topic._id)}
            className="w-full flex items-center justify-between p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors group"
          >
            <div className="flex items-center space-x-2">
              <FaHashtag className="text-gray-500 group-hover:text-cosmic-accent transition-colors" />
              <span className="text-sm">{topic._id}</span>
            </div>
            <span className="text-xs text-cosmic-accent">{topic.count} posts</span>
          </button>
        ))}

        {(!topics || topics.length === 0) && (
          <p className="text-sm text-gray-400 text-center py-4">
            No trending topics yet
          </p>
        )}
      </div>
    </div>
  );
};

export default TrendingTopics;
