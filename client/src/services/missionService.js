import api from './api';

class MissionService {
  // Get all missions with filters
  async getMissions(params = {}) {
    try {
      const response = await api.get('/missions', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get single mission by ID
  async getMissionById(id) {
    try {
      const response = await api.get(`/missions/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create new mission (admin only)
  async createMission(missionData) {
    try {
      const response = await api.post('/missions', missionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update mission (admin only)
  async updateMission(id, missionData) {
    try {
      const response = await api.put(`/missions/${id}`, missionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete mission (admin only)
  async deleteMission(id) {
    try {
      const response = await api.delete(`/missions/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Toggle mission like
  async toggleLike(id) {
    try {
      const response = await api.post(`/missions/${id}/like`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Add to watchlist
  async addToWatchlist(id) {
    try {
      const response = await api.post(`/missions/${id}/watchlist`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Remove from watchlist
  async removeFromWatchlist(id) {
    try {
      const response = await api.delete(`/missions/${id}/watchlist`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Add comment to mission
  async addComment(id, text) {
    try {
      const response = await api.post(`/missions/${id}/comments`, { text });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get upcoming launches
  async getUpcomingLaunches(limit = 5) {
    try {
      const response = await api.get('/missions/upcoming', { params: { limit } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get mission statistics
  async getMissionStats() {
    try {
      const response = await api.get('/missions/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search missions
  async searchMissions(query) {
    try {
      const response = await api.get('/missions/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get missions by organization
  async getMissionsByOrganization(organization, params = {}) {
    try {
      const response = await api.get('/missions', { 
        params: { ...params, organization } 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get missions by status
  async getMissionsByStatus(status, params = {}) {
    try {
      const response = await api.get('/missions', { 
        params: { ...params, status } 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get mission timeline
  async getMissionTimeline(id) {
    try {
      const response = await api.get(`/missions/${id}/timeline`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get mission crew
  async getMissionCrew(id) {
    try {
      const response = await api.get(`/missions/${id}/crew`);
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
        return new Error('Mission not found');
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

export default new MissionService();
