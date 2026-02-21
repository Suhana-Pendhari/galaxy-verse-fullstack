import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { FaTrophy, FaCrown, FaMedal } from 'react-icons/fa';
import { getLeaderboard } from '../../services/api';
import Loader from '../common/Loader';

const Leaderboard = ({ quizId }) => {
  const { data, isLoading } = useQuery(
    ['leaderboard', quizId],
    () => getLeaderboard(quizId),
    {
      enabled: !!quizId,
    }
  );

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <FaCrown className="text-yellow-400 text-2xl" />;
      case 1:
        return <FaMedal className="text-gray-400 text-2xl" />;
      case 2:
        return <FaMedal className="text-amber-600 text-2xl" />;
      default:
        return <span className="text-gray-500 font-mono">#{index + 1}</span>;
    }
  };

  if (isLoading) return <Loader />;

  const quizLeaderboard = data?.data?.quizLeaderboard || [];
  const globalLeaderboard = data?.data?.globalLeaderboard || [];

  return (
    <div className="space-y-8">
      {/* Quiz Leaderboard */}
      <div className="cosmic-card p-6">
        <h3 className="text-xl font-orbitron font-bold mb-4 flex items-center space-x-2">
          <FaTrophy className="text-cosmic-accent" />
          <span>Top Scores - This Quiz</span>
        </h3>

        <div className="space-y-3">
          {quizLeaderboard.map((entry, index) => (
            <motion.div
              key={entry.user._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-4 p-3 rounded-lg ${
                index === 0 ? 'bg-yellow-500/20 border border-yellow-500' :
                index === 1 ? 'bg-gray-400/20 border border-gray-400' :
                index === 2 ? 'bg-amber-600/20 border border-amber-600' :
                'bg-cosmic-light/30'
              }`}
            >
              <div className="w-10 flex justify-center">
                {getRankIcon(index)}
              </div>
              
              <img
                src={entry.user.profilePicture || 'https://via.placeholder.com/40'}
                alt={entry.user.username}
                className="w-10 h-10 rounded-full"
              />
              
              <div className="flex-1">
                <p className="font-semibold">{entry.user.username}</p>
                <p className="text-xs text-gray-400">
                  Attempts: {entry.attempts || 1}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-bold text-cosmic-accent">
                  {entry.score}%
                </p>
                <p className="text-xs text-gray-400">
                  {entry.timeSpent ? `${Math.floor(entry.timeSpent / 60)}m` : ''}
                </p>
              </div>
            </motion.div>
          ))}

          {quizLeaderboard.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              No scores yet. Be the first to take this quiz!
            </p>
          )}
        </div>
      </div>

      {/* Global Leaderboard */}
      <div className="cosmic-card p-6">
        <h3 className="text-xl font-orbitron font-bold mb-4">Global Rankings</h3>

        <div className="space-y-3">
          {globalLeaderboard.map((entry, index) => (
            <motion.div
              key={entry.user._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 bg-cosmic-light/30 rounded-lg"
            >
              <div className="w-10 text-center font-mono font-bold text-cosmic-accent">
                #{index + 1}
              </div>
              
              <img
                src={entry.user.profilePicture || 'https://via.placeholder.com/40'}
                alt={entry.user.username}
                className="w-10 h-10 rounded-full"
              />
              
              <div className="flex-1">
                <p className="font-semibold">{entry.user.username}</p>
                <p className="text-xs text-gray-400">
                  Best Score: {entry.bestScore}%
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-bold text-cosmic-accent">
                  {entry.attempts} attempts
                </p>
                <p className="text-xs text-gray-400">
                  {entry.bestTime ? `${Math.floor(entry.bestTime / 60)}m fastest` : ''}
                </p>
              </div>
            </motion.div>
          ))}

          {globalLeaderboard.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              No global rankings available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
