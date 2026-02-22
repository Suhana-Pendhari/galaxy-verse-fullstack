import api from './api';

class CommunityService {
  // Posts
  async getPosts(params = {}) {
    try {
      const response = await api.get('/community/posts', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPostById(id) {
    try {
      const response = await api.get(`/community/posts/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPost(postData) {
    try {
      // Handle FormData for file upload
      if (postData instanceof FormData) {
        const response = await api.post('/community/posts', postData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      } else {
        const response = await api.post('/community/posts', postData);
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePost(id, postData) {
    try {
      if (postData instanceof FormData) {
        const response = await api.put(`/community/posts/${id}`, postData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      } else {
        const response = await api.put(`/community/posts/${id}`, postData);
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deletePost(id) {
    try {
      const response = await api.delete(`/community/posts/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async likePost(id) {
    try {
      const response = await api.post(`/community/posts/${id}/like`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async savePost(id) {
    try {
      const response = await api.post(`/community/posts/${id}/save`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async reportPost(id, reason, description) {
    try {
      const response = await api.post(`/community/posts/${id}/report`, {
        reason,
        description,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Comments
  async getComments(targetType, targetId, params = {}) {
    try {
      const response = await api.get(`/comments/${targetType}/${targetId}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createComment(commentData) {
    try {
      const response = await api.post('/comments', commentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateComment(id, content) {
    try {
      const response = await api.put(`/comments/${id}`, { content });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteComment(id) {
    try {
      const response = await api.delete(`/comments/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async likeComment(id) {
    try {
      const response = await api.post(`/comments/${id}/like`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async reportComment(id, reason, description) {
    try {
      const response = await api.post(`/comments/${id}/report`, {
        reason,
        description,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Trending
  async getTrendingTopics() {
    try {
      const response = await api.get('/community/trending');
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
        return new Error('Resource not found');
      } else if (status === 403) {
        return new Error('You do not have permission to perform this action');
      } else if (status === 401) {
        return new Error('Please login to continue');
      }
      
      return new Error(message);
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error('An unexpected error occurred.');
    }
  }
}

export default new CommunityService();
