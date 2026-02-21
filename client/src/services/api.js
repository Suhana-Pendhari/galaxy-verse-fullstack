import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
export const refreshToken = () => api.post('/auth/refresh-token');
export const verifyEmail = (token) => api.get(`/auth/verify-email/${token}`);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post(`/auth/reset-password/${token}`, { password });
export const changePassword = (data) => api.put('/auth/change-password', data);

// Missions API
export const getMissions = (params) => api.get('/missions', { params });
export const getMissionById = (id) => api.get(`/missions/${id}`);
export const createMission = (data) => api.post('/missions', data);
export const updateMission = (id, data) => api.put(`/missions/${id}`, data);
export const deleteMission = (id) => api.delete(`/missions/${id}`);
export const toggleMissionLike = (id) => api.post(`/missions/${id}/like`);
export const addToWatchlist = (id) => api.post(`/missions/${id}/watchlist`);
export const removeFromWatchlist = (id) => api.delete(`/missions/${id}/watchlist`);
export const addMissionComment = (id, text) => api.post(`/missions/${id}/comments`, { text });
export const getUpcomingMissions = (limit) => api.get('/missions/upcoming', { params: { limit } });
export const getMissionStats = () => api.get('/missions/stats');

// Space Data API
export const getAPOD = (params) => api.get('/space-data/apod', { params });
export const getMarsRoverPhotos = (params) => api.get('/space-data/mars-rover', { params });
export const getAsteroids = (params) => api.get('/space-data/asteroids', { params });
export const getAsteroidById = (id) => api.get(`/space-data/asteroids/${id}`);
export const getEarthImagery = (params) => api.get('/space-data/earth', { params });
export const getEPIC = (params) => api.get('/space-data/epic', { params });
export const searchSpaceData = (params) => api.get('/space-data/search', { params });
export const toggleFavorite = (type, id) => api.post('/space-data/favorite', { type, id });
export const getFavorites = () => api.get('/space-data/favorites');

// Community API
export const getPosts = (params) => api.get('/community/posts', { params });
export const getPostById = (id) => api.get(`/community/posts/${id}`);
export const createPost = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'tags' && Array.isArray(data[key])) {
      formData.append(key, data[key].join(','));
    } else {
      formData.append(key, data[key]);
    }
  });
  return api.post('/community/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updatePost = (id, data) => api.put(`/community/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/community/posts/${id}`);
export const likePost = (id) => api.post(`/community/posts/${id}/like`);
export const savePost = (id) => api.post(`/community/posts/${id}/save`);
export const reportPost = (id, data) => api.post(`/community/posts/${id}/report`, data);
export const getTrendingTopics = () => api.get('/community/trending');

// Comments API
export const getComments = (targetType, targetId, params) => 
  api.get(`/comments/${targetType}/${targetId}`, { params });
export const createComment = (data) => api.post('/comments', data);
export const updateComment = (id, data) => api.put(`/comments/${id}`, data);
export const deleteComment = (id) => api.delete(`/comments/${id}`);
export const likeComment = (id) => api.post(`/comments/${id}/like`);
export const reportComment = (id, data) => api.post(`/comments/${id}/report`, data);

// Quiz API
export const getQuizzes = (params) => api.get('/quiz', { params });
export const getQuizById = (id) => api.get(`/quiz/${id}`);
export const startQuiz = (id) => api.post(`/quiz/${id}/start`);
export const submitQuiz = (id, data) => api.post(`/quiz/${id}/submit`, data);
export const getLeaderboard = (id) => api.get(`/quiz/${id}/leaderboard`);
export const getUserQuizHistory = (params) => api.get('/quiz/user/history', { params });
export const createQuiz = (data) => api.post('/quiz', data);
export const updateQuiz = (id, data) => api.put(`/quiz/${id}`, data);
export const deleteQuiz = (id) => api.delete(`/quiz/${id}`);

// Satellite API
export const getSatellites = (params) => api.get('/satellite', { params });
export const getSatelliteById = (id) => api.get(`/satellite/${id}`);
export const getISSPosition = () => api.get('/satellite/iss');
export const getSatellitePasses = (params) => api.get('/satellite/passes', { params });
export const getSatellitesInView = (params) => api.get('/satellite/in-view', { params });
export const getSatelliteOrbit = (id) => api.get(`/satellite/${id}/orbit`);

// User API
export const getUserProfile = (username) => api.get(`/users/${username}`);
export const updateProfile = (data) => api.put('/users/profile', data);
export const updateProfilePicture = (formData) => 
  api.put('/users/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateCoverPicture = (formData) => 
  api.put('/users/cover-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const toggleFollow = (userId) => api.post(`/users/${userId}/follow`);
export const getFollowers = (userId, params) => api.get(`/users/${userId}/followers`, { params });
export const getFollowing = (userId, params) => api.get(`/users/${userId}/following`, { params });
export const getUserPosts = (userId, params) => api.get(`/users/${userId}/posts`, { params });
export const getWatchlist = () => api.get('/users/watchlist');
export const getAchievements = () => api.get('/users/achievements');
export const getNotifications = (params) => api.get('/users/notifications', { params });
export const markNotificationRead = (id) => api.put(`/users/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/users/notifications/read-all');
export const searchUsers = (params) => api.get('/users/search', { params });
export const getSuggestions = () => api.get('/users/suggestions');
export const deleteAccount = (password) => api.delete('/users/account', { data: { password } });

// Admin API
export const getDashboardStats = () => api.get('/admin/dashboard/stats');
export const getUsers = (params) => api.get('/admin/users', { params });
export const updateUserRole = (userId, role) => api.put(`/admin/users/${userId}/role`, { role });
export const toggleUserStatus = (userId, reason) => 
  api.put(`/admin/users/${userId}/toggle-status`, { reason });
export const getReportedContent = (params) => api.get('/admin/reported-content', { params });
export const moderateContent = (data) => api.post('/admin/moderate', data);
export const getSystemLogs = (params) => api.get('/admin/logs', { params });
export const getAnalytics = (params) => api.get('/admin/analytics', { params });

export default api;
