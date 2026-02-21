import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBrain, FaClock, FaStar, FaTrophy, FaFilter } from 'react-icons/fa';
import { getQuizzes } from '../services/api';
import QuizCard from '../components/quiz/QuizCard';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const QuizPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch quizzes
  const { data, isLoading } = useQuery(
    ['quizzes', filters],
    () => getQuizzes(filters),
    {
      onError: (error) => {
        toast.error('Failed to load quizzes');
        console.error(error);
      },
    }
  );

  const categories = [
    'All',
    'Solar System',
    'Stars & Galaxies',
    'Space Missions',
    'Astronauts',
    'Space Technology',
    'Astronomy',
    'General Space',
  ];

  const difficulties = ['All', 'easy', 'medium', 'hard'];

  const filteredQuizzes = data?.data || [];

  // Get user stats
  const userStats = {
    quizzesTaken: user?.quizScores?.length || 0,
    averageScore: user?.quizScores?.length 
      ? Math.round(user.quizScores.reduce((acc, curr) => acc + curr.score, 0) / user.quizScores.length)
      : 0,
    highestScore: user?.quizScores?.length 
      ? Math.max(...user.quizScores.map(s => s.score))
      : 0,
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-orbitron font-bold mb-2 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
          Space Quiz Challenge
        </h1>
        <p className="text-gray-400">
          Test your knowledge of the cosmos and earn achievements
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="cosmic-card p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cosmic-primary/20 rounded-lg">
              <FaBrain className="text-2xl text-cosmic-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Quizzes Taken</p>
              <p className="text-2xl font-bold">{userStats.quizzesTaken}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="cosmic-card p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cosmic-primary/20 rounded-lg">
              <FaStar className="text-2xl text-cosmic-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Average Score</p>
              <p className="text-2xl font-bold">{userStats.averageScore}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="cosmic-card p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cosmic-primary/20 rounded-lg">
              <FaTrophy className="text-2xl text-cosmic-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Highest Score</p>
              <p className="text-2xl font-bold">{userStats.highestScore}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
        >
          <FaFilter />
          <span>Filters</span>
        </button>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 cosmic-card p-6"
          >
            <div className="grid md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat === 'All' ? '' : cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="w-full px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff === 'All' ? '' : diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search quizzes..."
                  className="w-full px-3 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quiz Grid */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <QuizCard quiz={quiz} />
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && filteredQuizzes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No quizzes found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
