import api from './api';

class SpaceDataService {
  // APOD (Astronomy Picture of the Day)
  async getAPOD(params = {}) {
    try {
      const response = await api.get('/space-data/apod', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAPODByDate(date) {
    try {
      const response = await api.get('/space-data/apod', { params: { date } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAPODRange(startDate, endDate) {
    try {
      const response = await api.get('/space-data/apod', {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRandomAPOD(count = 1) {
    try {
      const response = await api.get('/space-data/apod', { params: { count } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mars Rover Photos
  async getMarsRoverPhotos(params = {}) {
    try {
      const response = await api.get('/space-data/mars-rover', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMarsRoverManifest(rover) {
    try {
      const response = await api.get(`/space-data/mars-rover/manifest/${rover}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMarsRoverLatestPhotos(rover) {
    try {
      const response = await api.get('/space-data/mars-rover/latest', { params: { rover } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMarsRoverPhotoById(id) {
    try {
      const response = await api.get(`/space-data/mars-rover/photo/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Asteroids
  async getAsteroids(params = {}) {
    try {
      const response = await api.get('/space-data/asteroids', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAsteroidById(id) {
    try {
      const response = await api.get(`/space-data/asteroids/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAsteroidsByDate(date) {
    try {
      const response = await api.get('/space-data/asteroids', { params: { date } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAsteroidsInRange(startDate, endDate) {
    try {
      const response = await api.get('/space-data/asteroids', {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getHazardousAsteroids() {
    try {
      const response = await api.get('/space-data/asteroids/hazardous');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Earth Imagery
  async getEarthImagery(params) {
    try {
      const response = await api.get('/space-data/earth', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEarthAssets(lat, lon, date) {
    try {
      const response = await api.get('/space-data/earth/assets', {
        params: { lat, lon, date },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // EPIC
  async getEPIC(params = {}) {
    try {
      const response = await api.get('/space-data/epic', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEPICByDate(date) {
    try {
      const response = await api.get('/space-data/epic', { params: { date } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEPICNatural() {
    try {
      const response = await api.get('/space-data/epic', { params: { type: 'natural' } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEPICEnhanced() {
    try {
      const response = await api.get('/space-data/epic', { params: { type: 'enhanced' } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search
  async searchSpaceData(query, type = 'all') {
    try {
      const response = await api.get('/space-data/search', {
        params: { q: query, type },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Favorites
  async toggleFavorite(type, id) {
    try {
      const response = await api.post('/space-data/favorite', { type, id });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFavorites() {
    try {
      const response = await api.get('/space-data/favorites');
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
      } else if (status === 400) {
        return new Error(error.response.data?.message || 'Invalid request');
      } else if (status === 429) {
        return new Error('NASA API rate limit exceeded. Please try again later.');
      } else if (status === 500) {
        return new Error('NASA API server error. Please try again later.');
      }
      
      return new Error(message);
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error('An unexpected error occurred.');
    }
  }
}

export default new SpaceDataService();
