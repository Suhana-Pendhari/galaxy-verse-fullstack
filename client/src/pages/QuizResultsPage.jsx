import React, { useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { FaTrophy, FaClock, FaCheckCircle, FaTimesCircle, FaDownload, FaRedo, FaHome } from 'react-icons/fa';
import { getQuizById } from '../services/api';
import Certificate from '../components/quiz/Certificate';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const QuizResultsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const certificateRef = useRef();
  const result = location.state?.result;

  const { data, isLoading } = useQuery(
    ['quiz', id],
    () => getQuizById(id),
    {
      enabled: !result,
    }
  );

  const quiz = data?.data;
  const score = result?.score || 0;
  const passed = result?.passed || false;
  const correctAnswers = result?.correctAnswers || 0;
  const totalQuestions = result?.totalQuestions || quiz?.questions?.length || 0;
  const timeSpent = result?.timeSpent || 0;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      toast.loading('Generating certificate...');
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0f',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`GalaxyVerse-Certificate-${user?.username}.pdf`);
      
      toast.dismiss();
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate certificate');
      console.error(error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `I scored ${score}% on the ${quiz?.title} quiz!`,
        text: `Check out my score on GalaxyVerse Space Quiz!`,
        url: window.location.href,
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-orbitron font-bold mb-2 bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
            Quiz Results
          </h1>
          <p className="text-gray-400">{quiz?.title}</p>
        </div>

        {/* Score Card */}
        <div className="cosmic-card p-8 mb-8">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${passed ? 'text-green-400' : 'text-red-400'}`}>
                {score}%
              </div>
              <p className="text-sm text-gray-400">Final Score</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-cosmic-accent">
                {correctAnswers}/{totalQuestions}
              </div>
              <p className="text-sm text-gray-400">Correct Answers</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-cosmic-accent">
                {formatTime(timeSpent)}
              </div>
              <p className="text-sm text-gray-400">Time Spent</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {passed ? (
                  <FaCheckCircle className="inline text-green-400" />
                ) : (
                  <FaTimesCircle className="inline text-red-400" />
                )}
              </div>
              <p className="text-sm text-gray-400">
                {passed ? 'Passed' : 'Not Passed'}
              </p>
            </div>
          </div>

          {/* Pass/Fail Message */}
          <div className={`p-6 rounded-lg text-center ${
            passed ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
          }`}>
            {passed ? (
              <>
                <FaTrophy className="text-4xl text-yellow-400 mx-auto mb-3" />
                <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
                <p className="text-gray-300">
                  You've successfully passed the quiz with a score of {score}%!
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">Keep Learning!</h2>
                <p className="text-gray-300 mb-4">
                  You scored {score}%. The passing score is {quiz?.passingScore}%.
                </p>
                <button
                  onClick={() => navigate(`/quiz/${id}`)}
                  className="px-6 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>

        {/* Certificate (if passed) */}
        {passed && result?.certificateUrl && (
          <div className="cosmic-card p-8 mb-8">
            <h2 className="text-2xl font-orbitron font-bold mb-6 text-center">
              Your Certificate
            </h2>
            
            <div ref={certificateRef}>
              <Certificate
                username={user?.username}
                quizTitle={quiz?.title}
                score={score}
                date={new Date()}
              />
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={handleDownloadCertificate}
                className="flex items-center space-x-2 px-6 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
              >
                <FaDownload />
                <span>Download Certificate</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-6 py-2 border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
              >
                <span>Share Result</span>
              </button>
            </div>
          </div>
        )}

        {/* Answer Review */}
        {quiz && (
          <div className="cosmic-card p-8">
            <h2 className="text-2xl font-orbitron font-bold mb-6">Question Review</h2>
            
            <div className="space-y-6">
              {quiz.questions.map((question, index) => {
                const userAnswer = result?.answers?.[index];
                const correctOption = question.options.findIndex(opt => opt.isCorrect);
                const isCorrect = userAnswer === correctOption;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      isCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? <FaCheckCircle /> : <FaTimesCircle />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold mb-2">
                          {index + 1}. {question.question}
                        </p>
                        
                        <div className="space-y-2 ml-4">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`flex items-center space-x-2 text-sm ${
                                optIndex === correctOption
                                  ? 'text-green-400'
                                  : optIndex === userAnswer && optIndex !== correctOption
                                  ? 'text-red-400'
                                  : 'text-gray-400'
                              }`}
                            >
                              <span>{String.fromCharCode(65 + optIndex)}.</span>
                              <span>{option.text}</span>
                              {optIndex === correctOption && (
                                <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {question.explanation && (
                          <div className="mt-3 p-3 bg-cosmic-light/30 rounded-lg">
                            <p className="text-sm text-gray-300">
                              <span className="font-semibold">Explanation:</span> {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => navigate('/quiz')}
            className="flex items-center space-x-2 px-6 py-2 border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
          >
            <FaHome />
            <span>Back to Quizzes</span>
          </button>
          
          {!passed && (
            <button
              onClick={() => navigate(`/quiz/${id}`)}
              className="flex items-center space-x-2 px-6 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
            >
              <FaRedo />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuizResultsPage;
