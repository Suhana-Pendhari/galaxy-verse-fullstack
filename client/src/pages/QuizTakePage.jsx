import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaCheck, FaTimes, FaArrowLeft, FaArrowRight, FaFlag } from 'react-icons/fa';
import { getQuizById, startQuiz, submitQuiz } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import QuizTimer from '../components/quiz/QuizTimer';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const QuizTakePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);

  // Fetch quiz
  const { data, isLoading } = useQuery(
    ['quiz', id],
    () => getQuizById(id),
    {
      onError: (error) => {
        toast.error('Failed to load quiz');
        navigate('/quiz');
      },
    }
  );

  const quiz = data?.data;
  const userAttempt = data?.userAttempt;

  // Start quiz mutation
  const startMutation = useMutation(() => startQuiz(id), {
    onSuccess: (data) => {
      setAttemptId(data.data._id);
      setQuizStarted(true);
      toast.success('Quiz started! Good luck!');
    },
    onError: () => toast.error('Failed to start quiz'),
  });

  // Submit quiz mutation
  const submitMutation = useMutation(
    (data) => submitQuiz(id, data),
    {
      onSuccess: (data) => {
        navigate(`/quiz/${id}/results`, { state: { result: data.data } });
      },
      onError: () => toast.error('Failed to submit quiz'),
    }
  );

  // Initialize answers
  useEffect(() => {
    if (quiz && !userAttempt) {
      setAnswers(new Array(quiz.questions.length).fill(null));
    }
  }, [quiz, userAttempt]);

  // Handle resume attempt
  useEffect(() => {
    if (userAttempt && userAttempt.answers) {
      setAnswers(userAttempt.answers.map(a => a.selectedOption));
      setQuizStarted(true);
      setAttemptId(userAttempt._id);
    }
  }, [userAttempt]);

  if (isLoading || !quiz) return <Loader />;

  // If user has already completed the quiz
  if (userAttempt?.completedAt) {
    return (
      <div className="py-8">
        <div className="cosmic-card max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-3xl font-orbitron font-bold mb-4">Quiz Already Completed</h1>
          <p className="text-gray-400 mb-6">
            You have already taken this quiz. View your results or try another quiz.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate(`/quiz/${id}/results`)}
              className="px-6 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
            >
              View Results
            </button>
            <button
              onClick={() => navigate('/quiz')}
              className="px-6 py-2 border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Start screen
  if (!quizStarted) {
    return (
      <div className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cosmic-card max-w-2xl mx-auto p-8"
        >
          <h1 className="text-3xl font-orbitron font-bold mb-4 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
            {quiz.title}
          </h1>
          
          <p className="text-gray-300 mb-6">{quiz.description}</p>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold">Quiz Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cosmic-light/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Questions</p>
                <p className="text-2xl font-bold">{quiz.questions.length}</p>
              </div>
              <div className="bg-cosmic-light/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Time Limit</p>
                <p className="text-2xl font-bold">{quiz.timeLimit} min</p>
              </div>
              <div className="bg-cosmic-light/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Passing Score</p>
                <p className="text-2xl font-bold">{quiz.passingScore}%</p>
              </div>
              <div className="bg-cosmic-light/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Difficulty</p>
                <p className={`text-2xl font-bold ${
                  quiz.difficulty === 'easy' ? 'text-green-400' :
                  quiz.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold">Instructions</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Read each question carefully before answering</li>
              <li>You can flag questions to review later</li>
              <li>The timer starts once you begin</li>
              <li>Your answers are automatically saved</li>
              <li>You cannot pause the quiz once started</li>
            </ul>
          </div>

          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isLoading}
            className="w-full py-3 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors disabled:opacity-50 glow-button"
          >
            {startMutation.isLoading ? 'Starting...' : 'Start Quiz'}
          </button>
        </motion.div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleFlag = () => {
    setFlaggedQuestions(prev =>
      prev.includes(currentQuestion)
        ? prev.filter(q => q !== currentQuestion)
        : [...prev, currentQuestion]
    );
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    submitMutation.mutate({
      answers: answers.map((selectedOption, index) => ({
        questionId: quiz.questions[index]._id,
        selectedOption,
        timeSpent: 0, // This would be tracked per question in a real implementation
      })),
      timeSpent,
    });
  };

  return (
    <div className="py-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Question {currentQuestion + 1} of {totalQuestions}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 bg-cosmic-light rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-cosmic-accent"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/quiz')}
            className="p-2 hover:bg-cosmic-primary/20 rounded-lg transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-orbitron font-bold">{quiz.title}</h1>
        </div>
        <QuizTimer
          timeLimit={quiz.timeLimit}
          onTimeUp={handleSubmit}
          onTick={setTimeSpent}
        />
      </div>

      {/* Question Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {quiz.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
              currentQuestion === index
                ? 'bg-cosmic-accent text-white'
                : answers[index] !== null
                ? 'bg-green-500/20 text-green-400 border border-green-500'
                : flaggedQuestions.includes(index)
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                : 'bg-cosmic-light/30 hover:bg-cosmic-primary/20'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="cosmic-card p-8 mb-6"
      >
        {/* Question Header */}
        <div className="flex justify-between items-start mb-6">
          <span className="text-sm text-cosmic-accent">
            Question {currentQuestion + 1}
          </span>
          <button
            onClick={handleFlag}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
              flaggedQuestions.includes(currentQuestion)
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'hover:bg-cosmic-primary/20'
            }`}
          >
            <FaFlag />
            <span>Flag for Review</span>
          </button>
        </div>

        {/* Question Text */}
        <h2 className="text-xl mb-6">{question.question}</h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                answers[currentQuestion] === index
                  ? 'border-cosmic-accent bg-cosmic-accent/20'
                  : 'border-cosmic-primary/30 hover:border-cosmic-primary'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="font-mono text-cosmic-accent">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span>{option.text}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-2 border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <FaArrowLeft />
          <span>Previous</span>
        </button>

        {currentQuestion === totalQuestions - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <FaCheck />
            <span>{submitMutation.isLoading ? 'Submitting...' : 'Submit Quiz'}</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors flex items-center space-x-2"
          >
            <span>Next</span>
            <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizTakePage;
