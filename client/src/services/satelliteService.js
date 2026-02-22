import api from './api';

class SatelliteService {
  // Get all satellites
  async getSatellites(params = {}) {
    try {
      const response = await api.get('/satellite', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get single satellite by ID
  async getSatelliteById(id) {
    try {
      const response = await api.get(`/satellite/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get ISS current position
  async getISSPosition() {
    try {
      const response = await api.get('/satellite/iss');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get satellite passes for a location
  async getSatellitePasses(params) {
    try {
      const response = await api.get('/satellite/passes', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get satellites in view for a location
  async getSatellitesInView(params) {
    try {
      const response = await api.get('/satellite/in-view', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get satellite orbit path
  async getSatelliteOrbit(id) {
    try {
      const response = await api.get(`/satellite/${id}/orbit`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search satellites
  async searchSatellites(query) {
    try {
      const response = await api.get('/satellite/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get satellite by NORAD ID
  async getSatelliteByNoradId(noradId) {
    try {
      const response = await api.get(`/satellite/norad/${noradId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get satellite TLE data
  async getSatelliteTLE(noradId) {
    try {
      const response = await api.get(`/satellite/tle/${noradId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get visible satellites for a location
  async getVisibleSatellites(lat, lng, params = {}) {
    try {
      const response = await api.get('/satellite/visible', {
        params: { lat, lng, ...params },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get satellite prediction
  async getSatellitePrediction(noradId, days = 7) {
    try {
      const response = await api.get(`/satellite/predict/${noradId}`, {
        params: { days },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get satellite statistics
  async getSatelliteStats() {
    try {
      const response = await api.get('/satellite/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Track multiple satellites
  async trackSatellites(satelliteIds) {
    try {
      const response = await api.post('/satellite/track', { satelliteIds });
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
        return new Error('Satellite not found');
      } else if (status === 400) {
        return new Error(error.response.data?.message || 'Invalid request');
      } else if (status === 429) {
        return new Error('Too many requests. Please try again later.');
      }
      
      return new Error(message);
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error('An unexpected error occurred.');
    }
  }
}

export default new SatelliteService();
