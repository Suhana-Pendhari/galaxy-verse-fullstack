import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaClock, FaStar, FaBrain, FaTrophy } from 'react-icons/fa';

const QuizCard = ({ quiz }) => {
  const difficultyColors = {
    easy: 'text-green-400 bg-green-400/20',
    medium: 'text-yellow-400 bg-yellow-400/20',
    hard: 'text-red-400 bg-red-400/20',
  };

  return (
    <Link to={`/quiz/${quiz._id}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="cosmic-card p-6 h-full flex flex-col cursor-pointer group"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[quiz.difficulty]}`}>
            {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
          </div>
          <div className="text-sm text-gray-400 flex items-center space-x-1">
            <FaClock className="text-cosmic-accent" />
            <span>{quiz.timeLimit} min</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 group-hover:text-cosmic-accent transition-colors">
          {quiz.title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 flex-1">
          {quiz.description}
        </p>

        {/* Stats */}
        <div className="space-y-3">
          {/* Category */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Category</span>
            <span className="font-medium">{quiz.category}</span>
          </div>

          {/* Questions */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Questions</span>
            <span className="font-medium flex items-center space-x-1">
              <FaBrain className="text-cosmic-accent" />
              <span>{quiz.questionCount || quiz.questions?.length || 0}</span>
            </span>
          </div>

          {/* Passing Score */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Passing Score</span>
            <span className="font-medium">{quiz.passingScore}%</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-cosmic-primary/30">
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <FaTrophy />
              <span>{quiz.attempts || 0} attempts</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-yellow-400">
              <FaStar />
              <span>{Math.round(quiz.averageScore || 0)}% avg</span>
            </div>
          </div>
        </div>

        {/* User Attempt Badge */}
        {quiz.userAttempt && (
          <div className="mt-4 p-2 bg-cosmic-accent/20 rounded-lg text-center">
            <p className="text-sm text-cosmic-accent">
              Your best: {Math.round(quiz.userAttempt.score)}%
            </p>
          </div>
        )}
      </motion.div>
    </Link>
  );
};

export default QuizCard;
