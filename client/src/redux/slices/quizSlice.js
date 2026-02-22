import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api';

// Async thunks
export const fetchQuizzes = createAsyncThunk(
  'quiz/fetchQuizzes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getQuizzes(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quizzes');
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  'quiz/fetchQuizById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getQuizById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz');
    }
  }
);

export const startQuiz = createAsyncThunk(
  'quiz/startQuiz',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.startQuiz(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start quiz');
    }
  }
);

export const submitQuiz = createAsyncThunk(
  'quiz/submitQuiz',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.submitQuiz(id, data);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit quiz');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'quiz/fetchLeaderboard',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const response = await api.getLeaderboard(id, params);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

export const fetchUserHistory = createAsyncThunk(
  'quiz/fetchUserHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getUserQuizHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user history');
    }
  }
);

// Initial state
const initialState = {
  quizzes: [],
  currentQuiz: null,
  currentAttempt: null,
  quizResults: null,
  leaderboards: {},
  userHistory: [],
  filters: {
    category: '',
    difficulty: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  submitting: false,
  error: null,
  success: false,
};

// Slice
const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
      state.currentAttempt = null;
      state.quizResults = null;
    },
    clearResults: (state) => {
      state.quizResults = null;
    },
    setAnswer: (state, action) => {
      const { questionIndex, answer } = action.payload;
      if (state.currentAttempt) {
        if (!state.currentAttempt.answers) {
          state.currentAttempt.answers = [];
        }
        state.currentAttempt.answers[questionIndex] = {
          questionId: state.currentQuiz?.questions[questionIndex]?._id,
          selectedOption: answer,
        };
      }
    },
    setQuestionTime: (state, action) => {
      const { questionIndex, timeSpent } = action.payload;
      if (state.currentAttempt?.answers?.[questionIndex]) {
        state.currentAttempt.answers[questionIndex].timeSpent = timeSpent;
      }
    },
    toggleFlagQuestion: (state, action) => {
      const questionIndex = action.payload;
      if (!state.currentAttempt.flaggedQuestions) {
        state.currentAttempt.flaggedQuestions = [];
      }
      const index = state.currentAttempt.flaggedQuestions.indexOf(questionIndex);
      if (index === -1) {
        state.currentAttempt.flaggedQuestions.push(questionIndex);
      } else {
        state.currentAttempt.flaggedQuestions.splice(index, 1);
      }
    },
    setTimeSpent: (state, action) => {
      if (state.currentAttempt) {
        state.currentAttempt.timeSpent = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quizzes = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Quiz By Id
      .addCase(fetchQuizById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuiz = action.payload;
        state.currentAttempt = action.payload.userAttempt || null;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Start Quiz
      .addCase(startQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAttempt = action.payload;
        // Initialize answers array
        if (state.currentQuiz) {
          state.currentAttempt.answers = new Array(state.currentQuiz.questions.length).fill(null);
          state.currentAttempt.flaggedQuestions = [];
          state.currentAttempt.timeSpent = 0;
        }
      })
      .addCase(startQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Submit Quiz
      .addCase(submitQuiz.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.submitting = false;
        state.quizResults = action.payload;
        state.success = true;
        // Update quiz stats
        const quizIndex = state.quizzes.findIndex(q => q._id === action.payload.id);
        if (quizIndex !== -1) {
          state.quizzes[quizIndex].attempts += 1;
          state.quizzes[quizIndex].averageScore = 
            (state.quizzes[quizIndex].averageScore * (state.quizzes[quizIndex].attempts - 1) + 
             action.payload.score) / state.quizzes[quizIndex].attempts;
        }
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Fetch Leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaderboards[action.payload.id] = {
          quiz: action.payload.quizLeaderboard,
          global: action.payload.globalLeaderboard,
        };
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch User History
      .addCase(fetchUserHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userHistory = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  resetFilters,
  setPage,
  clearCurrentQuiz,
  clearResults,
  setAnswer,
  setQuestionTime,
  toggleFlagQuestion,
  setTimeSpent,
  clearError,
  clearSuccess,
} = quizSlice.actions;

// Selectors
export const selectQuizzes = (state) => state.quiz.quizzes;
export const selectCurrentQuiz = (state) => state.quiz.currentQuiz;
export const selectCurrentAttempt = (state) => state.quiz.currentAttempt;
export const selectQuizResults = (state) => state.quiz.quizResults;
export const selectLeaderboard = (state, quizId) => state.quiz.leaderboards[quizId];
export const selectUserHistory = (state) => state.quiz.userHistory;
export const selectQuizFilters = (state) => state.quiz.filters;
export const selectQuizPagination = (state) => state.quiz.pagination;
export const selectQuizLoading = (state) => state.quiz.isLoading;
export const selectQuizSubmitting = (state) => state.quiz.submitting;
export const selectQuizError = (state) => state.quiz.error;
export const selectQuizSuccess = (state) => state.quiz.success;

export default quizSlice.reducer;
