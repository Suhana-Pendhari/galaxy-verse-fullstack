import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaFlag, FaLightbulb } from 'react-icons/fa';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';

const QuizQuestion = ({ 
  question, 
  questionNumber, 
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onFlag,
  isFlagged,
  showExplanation,
  timeSpent,
  disabled = false
}) => {
  const [selectedOption, setSelectedOption] = useState(selectedAnswer);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setSelectedOption(selectedAnswer);
  }, [selectedAnswer, question._id]);

  const handleOptionSelect = (index) => {
    if (disabled) return;
    setSelectedOption(index);
    onAnswer(index);
  };

  const getOptionClass = (index) => {
    const baseClass = "w-full p-4 text-left rounded-lg border-2 transition-all ";
    
    if (disabled && showExplanation) {
      if (index === question.correctAnswer) {
        return baseClass + "border-green-500 bg-green-500/20";
      }
      if (selectedOption === index && index !== question.correctAnswer) {
        return baseClass + "border-red-500 bg-red-500/20";
      }
    }
    
    if (selectedOption === index) {
      return baseClass + "border-cosmic-accent bg-cosmic-accent/20";
    }
    
    return baseClass + "border-cosmic-primary/30 hover:border-cosmic-primary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Question Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-cosmic-accent">
            Question {questionNumber} of {totalQuestions}
          </span>
          <Button
            variant={isFlagged ? 'accent' : 'ghost'}
            size="sm"
            onClick={onFlag}
            icon={<FaFlag />}
          >
            {isFlagged ? 'Flagged' : 'Flag for review'}
          </Button>
        </div>
        <div className="text-sm text-gray-400">
          Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar 
        value={questionNumber} 
        max={totalQuestions} 
        color="accent"
        showValue
      />

      {/* Question Image */}
      {question.image && (
        <div className="rounded-lg overflow-hidden">
          <img
            src={question.image.url}
            alt={question.image.caption || 'Question image'}
            className="w-full max-h-64 object-contain bg-cosmic-light/30"
          />
          {question.image.caption && (
            <p className="text-sm text-gray-400 mt-2 text-center">{question.image.caption}</p>
          )}
        </div>
      )}

      {/* Question Text */}
      <div className="cosmic-card p-6">
        <h3 className="text-xl font-semibold mb-4">{question.question}</h3>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={disabled}
              className={getOptionClass(index)}
            >
              <div className="flex items-start space-x-3">
                <span className="font-mono text-cosmic-accent font-bold">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="flex-1">{option.text}</span>
                {disabled && showExplanation && (
                  <span>
                    {index === question.correctAnswer && (
                      <FaCheck className="text-green-500" />
                    )}
                    {selectedOption === index && index !== question.correctAnswer && (
                      <FaTimes className="text-red-500" />
                    )}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Hint Button */}
        {question.hint && !showHint && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(true)}
              icon={<FaLightbulb />}
            >
                Show Hint
            </Button>
          </div>
        )}

        {/* Hint Content */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-cosmic-primary/20 rounded-lg"
            >
              <p className="text-sm text-cosmic-accent">{question.hint}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explanation (shown after submission) */}
        {disabled && showExplanation && question.explanation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-cosmic-light/30 rounded-lg"
          >
            <h4 className="font-semibold text-cosmic-accent mb-2">Explanation</h4>
            <p className="text-sm text-gray-300">{question.explanation}</p>
          </motion.div>
        )}
      </div>

      {/* Question Metadata */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Difficulty: {question.difficulty || 'Not specified'}</span>
        <span>Points: {question.points || 10}</span>
      </div>
    </motion.div>
  );
};

export default QuizQuestion;
