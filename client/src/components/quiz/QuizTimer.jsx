import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClock } from 'react-icons/fa';

const QuizTimer = ({ timeLimit, onTimeUp, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // Convert to seconds
  const [isWarning, setIsWarning] = useState(false);
  const [isDanger, setIsDanger] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        onTick?.(timeLimit * 60 - prev);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, onTimeUp, onTick]);

  useEffect(() => {
    // Warning at 5 minutes
    setIsWarning(timeLeft <= 300 && timeLeft > 60);
    // Danger at 1 minute
    setIsDanger(timeLeft <= 60);
  }, [timeLeft]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    if (isDanger) return 'text-red-500';
    if (isWarning) return 'text-yellow-500';
    return 'text-cosmic-accent';
  };

  const getProgress = () => {
    const total = timeLimit * 60;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <motion.div
      animate={isDanger ? { scale: [1, 1.1, 1] } : {}}
      transition={{ repeat: Infinity, duration: 0.5 }}
      className="relative"
    >
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
        isDanger ? 'border-red-500 bg-red-500/10' :
        isWarning ? 'border-yellow-500 bg-yellow-500/10' :
        'border-cosmic-accent bg-cosmic-accent/10'
      }`}>
        <FaClock className={getColor()} />
        <span className={`font-mono font-bold ${getColor()}`}>
          {formatTime()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-cosmic-light rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${getProgress()}%` }}
          className={`h-full ${
            isDanger ? 'bg-red-500' :
            isWarning ? 'bg-yellow-500' :
            'bg-cosmic-accent'
          }`}
        />
      </div>
    </motion.div>
  );
};

export default QuizTimer;
