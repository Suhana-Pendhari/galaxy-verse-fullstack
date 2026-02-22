import api from './api';

class QuizService {
  // Get all quizzes
  async getQuizzes(params = {}) {
    try {
      const response = await api.get('/quiz', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get single quiz by ID
  async getQuizById(id) {
    try {
      const response = await api.get(`/quiz/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Start quiz attempt
  async startQuiz(id) {
    try {
      const response = await api.post(`/quiz/${id}/start`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Submit quiz answers
  async submitQuiz(id, answers, timeSpent) {
    try {
      const response = await api.post(`/quiz/${id}/submit`, { answers, timeSpent });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get leaderboard
  async getLeaderboard(id, params = {}) {
    try {
      const response = await api.get(`/quiz/${id}/leaderboard`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user's quiz history
  async getUserHistory(params = {}) {
    try {
      const response = await api.get('/quiz/user/history', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create new quiz (admin only)
  async createQuiz(quizData) {
    try {
      const response = await api.post('/quiz', quizData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update quiz (admin only)
  async updateQuiz(id, quizData) {
    try {
      const response = await api.put(`/quiz/${id}`, quizData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete quiz (admin only)
  async deleteQuiz(id) {
    try {
      const response = await api.delete(`/quiz/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get quiz categories
  async getCategories() {
    try {
      const response = await api.get('/quiz/categories');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get quiz statistics
  async getQuizStats() {
    try {
      const response = await api.get('/quiz/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generate certificate
  async generateCertificate(quizId, attemptId) {
    try {
      const response = await api.get(`/quiz/${quizId}/certificate/${attemptId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get recommended quizzes
  async getRecommendedQuizzes() {
    try {
      const response = await api.get('/quiz/recommended');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper method for error handling
  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      const status = error.response.status;
      
      if (status === 404) {
        return new Error('Quiz not found');
      } else if (status === 403) {
        return new Error('You do not have permission to perform this action');
      } else if (status === 401) {
        return new Error('Please login to continue');
      } else if (status === 400) {
        return new Error(error.response.data?.message || 'Invalid request');
      }
      
      return new Error(message);
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error('An unexpected error occurred.');
    }
  }
}

export default new QuizService();
