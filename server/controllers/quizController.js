const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { getIO } = require('../config/socket');
const { generateCertificate } = require('../utils/createCertificate');

// @desc    Get all quizzes
// @route   GET /api/quiz
// @access  Public
exports.getQuizzes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$text = { $search: search };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const quizzes = await Quiz.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-questions.options.isCorrect') // Don't send correct answers
      .populate('createdBy', 'username');

    const total = await Quiz.countDocuments(filter);

    // Get user's attempts if logged in
    let userAttempts = [];
    if (req.user) {
      userAttempts = await QuizAttempt.find({
        user: req.user.id,
        quiz: { $in: quizzes.map(q => q._id) },
      }).select('quiz score passed completedAt');
    }

    // Add attempt info to quizzes
    const quizzesWithAttempts = quizzes.map(quiz => {
      const quizObj = quiz.toObject();
      const attempt = userAttempts.find(a => a.quiz.toString() === quiz._id.toString());
      if (attempt) {
        quizObj.userAttempt = attempt;
      }
      return quizObj;
    });

    res.json({
      success: true,
      data: quizzesWithAttempts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get single quiz by ID
// @route   GET /api/quiz/:id
// @access  Private
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
    }

    // Check if user has attempted this quiz
    const userAttempt = await QuizAttempt.findOne({
      user: req.user.id,
      quiz: quiz._id,
    }).sort({ completedAt: -1 });

    // Don't send correct answers if user hasn't attempted
    let quizData = quiz.toObject();
    if (!userAttempt) {
      quizData.questions = quizData.questions.map(q => ({
        ...q,
        options: q.options.map(opt => ({ text: opt.text })), // Remove isCorrect
      }));
    }

    res.json({
      success: true,
      data: quizData,
      userAttempt,
    });
  } catch (error) {
    console.error('Get quiz by id error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Start quiz attempt
// @route   POST /api/quiz/:id/start
// @access  Private
exports.startQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
    }

    // Check if user has already started an attempt
    const existingAttempt = await QuizAttempt.findOne({
      user: req.user.id,
      quiz: quiz._id,
      completedAt: { $exists: false },
    });

    if (existingAttempt) {
      return res.json({
        success: true,
        data: existingAttempt,
        message: 'Continuing existing attempt',
      });
    }

    // Create new attempt
    const attempt = await QuizAttempt.create({
      user: req.user.id,
      quiz: quiz._id,
      startedAt: new Date(),
    });

    // Emit socket event for quiz started
    const io = getIO();
    io.to(`quiz-${quiz._id}`).emit('quiz-started', {
      userId: req.user.id,
      attemptId: attempt._id,
    });

    res.status(201).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quiz/:id/submit
// @access  Private
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
    }

    // Find the attempt
    const attempt = await QuizAttempt.findOne({
      user: req.user.id,
      quiz: quiz._id,
      completedAt: { $exists: false },
    });

    if (!attempt) {
      return res.status(400).json({ 
        success: false,
        message: 'No active quiz attempt found' 
      });
    }

    // Calculate score
    let score = 0;
    const processedAnswers = answers.map(answer => {
      const question = quiz.questions.id(answer.questionId);
      const correctOption = question.options.findIndex(opt => opt.isCorrect);
      const isCorrect = correctOption === answer.selectedOption;
      
      if (isCorrect) {
        score += question.points || 10;
      }

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        timeSpent: answer.timeSpent || 0,
      };
    });

    const percentage = (score / quiz.totalPoints) * 100;
    const passed = percentage >= quiz.passingScore;

    // Update attempt
    attempt.answers = processedAnswers;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.timeSpent = timeSpent;
    attempt.completedAt = new Date();

    await attempt.save();

    // Update quiz stats
    quiz.attempts += 1;
    quiz.averageScore = (quiz.averageScore * (quiz.attempts - 1) + percentage) / quiz.attempts;
    if (percentage > quiz.bestScore) {
      quiz.bestScore = percentage;
    }

    // Add to leaderboard if score is good
    if (percentage >= 80) {
      quiz.leaderboard.push({
        user: req.user.id,
        score: percentage,
        timeSpent,
        completedAt: new Date(),
      });
      
      // Sort leaderboard and keep top 100
      quiz.leaderboard.sort((a, b) => b.score - a.score || a.timeSpent - b.timeSpent);
      if (quiz.leaderboard.length > 100) {
        quiz.leaderboard = quiz.leaderboard.slice(0, 100);
      }
    }

    await quiz.save();

    // Update user's quiz scores
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        quizScores: {
          quizId: quiz._id,
          score: percentage,
          timeSpent,
          completedAt: new Date(),
        },
      },
    });

    // Generate certificate if passed
    let certificateUrl = null;
    if (passed) {
      certificateUrl = await generateCertificate({
        username: req.user.username,
        quizTitle: quiz.title,
        score: percentage,
        date: new Date(),
      });

      attempt.certificateGenerated = true;
      attempt.certificateUrl = certificateUrl;
      await attempt.save();

      // Award achievement
      const userQuizCount = await QuizAttempt.countDocuments({ 
        user: req.user.id,
        passed: true,
      });

      if (userQuizCount === 1) {
        await User.findByIdAndUpdate(req.user.id, {
          $push: {
            achievements: {
              name: 'Quiz Master',
              description: 'Passed your first quiz',
              earnedAt: new Date(),
            },
          },
        });
      }
    }

    // Emit socket events
    const io = getIO();
    io.to(`quiz-${quiz._id}`).emit('quiz-submitted', {
      userId: req.user.id,
      score: percentage,
      passed,
    });

    io.to(`user-${req.user.id}`).emit('quiz-result', {
      quizId: quiz._id,
      quizTitle: quiz.title,
      score: percentage,
      passed,
      certificateUrl,
    });

    res.json({
      success: true,
      data: {
        score: percentage,
        passed,
        totalQuestions: quiz.questions.length,
        correctAnswers: processedAnswers.filter(a => a.isCorrect).length,
        certificateUrl,
      },
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get leaderboard for a quiz
// @route   GET /api/quiz/:id/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const quiz = await Quiz.findById(req.params.id)
      .populate('leaderboard.user', 'username profilePicture');

    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
    }

    // Get global leaderboard from attempts
    const globalLeaderboard = await QuizAttempt.aggregate([
      { $match: { quiz: quiz._id, passed: true } },
      { $group: {
          _id: '$user',
          bestScore: { $max: '$percentage' },
          bestTime: { $min: '$timeSpent' },
          attempts: { $sum: 1 },
          lastAttempt: { $max: '$completedAt' },
      }},
      { $sort: { bestScore: -1, bestTime: 1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          'user.username': 1,
          'user.profilePicture': 1,
          bestScore: 1,
          bestTime: 1,
          attempts: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        quizLeaderboard: quiz.leaderboard,
        globalLeaderboard,
      },
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get user's quiz history
// @route   GET /api/quiz/user/history
// @access  Private
exports.getUserHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const attempts = await QuizAttempt.find({ user: req.user.id })
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('quiz', 'title category difficulty');

    const total = await QuizAttempt.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: attempts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Create new quiz (Admin only)
// @route   POST /api/quiz
// @access  Private/Admin
exports.createQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const quizData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const quiz = await Quiz.create(quizData);

    // Emit socket event
    const io = getIO();
    io.emit('new-quiz', quiz);

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Update quiz (Admin only)
// @route   PUT /api/quiz/:id
// @access  Private/Admin
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Emit socket event
    const io = getIO();
    io.emit('quiz-updated', updatedQuiz);

    res.json({
      success: true,
      data: updatedQuiz,
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Delete quiz (Admin only)
// @route   DELETE /api/quiz/:id
// @access  Private/Admin
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
    }

    // Delete all associated attempts
    await QuizAttempt.deleteMany({ quiz: quiz._id });

    await quiz.deleteOne();

    // Emit socket event
    const io = getIO();
    io.emit('quiz-deleted', { quizId: req.params.id });

    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};
