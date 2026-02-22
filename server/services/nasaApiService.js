const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize cache
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

class NasaApiService {
  constructor() {
    this.baseURL = 'https://api.nasa.gov';
    this.apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
  }

  /**
   * Make API request with caching
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async makeRequest(endpoint, params = {}) {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${cacheKey}`);
      return cached;
    }

    try {
      const response = await this.client.get(endpoint, {
        params: { ...params, api_key: this.apiKey },
      });

      // Cache successful response
      cache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`NASA API Error: ${error.message}`);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.msg || error.response.data?.error || 'NASA API error';
      
      if (status === 404) {
        return new Error('Resource not found');
      } else if (status === 429) {
        return new Error('Rate limit exceeded. Please try again later.');
      } else if (status === 400) {
        return new Error('Invalid request parameters');
      } else if (status >= 500) {
        return new Error('NASA API server error');
      }
      return new Error(message);
    } else if (error.request) {
      return new Error('No response from NASA API');
    } else {
      return new Error('Request configuration error');
    }
  }

  // ===== APOD (Astronomy Picture of the Day) =====

  /**
   * Get Astronomy Picture of the Day
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} APOD data
   */
  async getAPOD(params = {}) {
    return this.makeRequest('/planetary/apod', params);
  }

  /**
   * Get APOD for specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} APOD data
   */
  async getAPODByDate(date) {
    return this.getAPOD({ date });
  }

  /**
   * Get APOD for date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Array>} APOD data array
   */
  async getAPODRange(startDate, endDate) {
    return this.getAPOD({ start_date: startDate, end_date: endDate });
  }

  /**
   * Get random APODs
   * @param {number} count - Number of random APODs
   * @returns {Promise<Array>} APOD data array
   */
  async getRandomAPOD(count = 1) {
    return this.getAPOD({ count });
  }

  // ===== Mars Rover Photos =====

  /**
   * Get Mars Rover photos
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Rover photos
   */
  async getMarsRoverPhotos(params = {}) {
    const { rover = 'curiosity', ...rest } = params;
    return this.makeRequest(`/mars-photos/api/v1/rovers/${rover}/photos`, rest);
  }

  /**
   * Get Mars Rover manifest
   * @param {string} rover - Rover name
   * @returns {Promise<Object>} Rover manifest
   */
  async getRoverManifest(rover) {
    return this.makeRequest(`/mars-photos/api/v1/manifests/${rover}`);
  }

  /**
   * Get Mars Rover photos by sol
   * @param {string} rover - Rover name
   * @param {number} sol - Martian sol
   * @param {string} camera - Camera type
   * @returns {Promise<Object>} Rover photos
   */
  async getPhotosBySol(rover, sol, camera = null) {
    const params = { sol };
    if (camera) params.camera = camera;
    return this.getMarsRoverPhotos({ rover, ...params });
  }

  /**
   * Get Mars Rover photos by earth date
   * @param {string} rover - Rover name
   * @param {string} earthDate - Earth date
   * @param {string} camera - Camera type
   * @returns {Promise<Object>} Rover photos
   */
  async getPhotosByEarthDate(rover, earthDate, camera = null) {
    const params = { earth_date: earthDate };
    if (camera) params.camera = camera;
    return this.getMarsRoverPhotos({ rover, ...params });
  }

  /**
   * Get latest Mars Rover photos
   * @param {string} rover - Rover name
   * @returns {Promise<Object>} Latest photos
   */
  async getLatestPhotos(rover) {
    const manifest = await this.getRoverManifest(rover);
    const latestSol = manifest.photo_manifest.max_sol;
    return this.getPhotosBySol(rover, latestSol);
  }

  // ===== Asteroid NeoWs (Near Earth Object Web Service) =====

  /**
   * Get asteroid feed
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Asteroid data
   */
  async getAsteroidFeed(params = {}) {
    return this.makeRequest('/neo/rest/v1/feed', params);
  }

  /**
   * Get asteroids for specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} Asteroid data
   */
  async getAsteroidsByDate(date) {
    return this.getAsteroidFeed({ start_date: date, end_date: date });
  }

  /**
   * Get asteroids for date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} Asteroid data
   */
  async getAsteroidsInRange(startDate, endDate) {
    return this.getAsteroidFeed({ start_date: startDate, end_date: endDate });
  }

  /**
   * Get asteroid by ID
   * @param {string} asteroidId - Asteroid ID
   * @returns {Promise<Object>} Asteroid data
   */
  async getAsteroidById(asteroidId) {
    return this.makeRequest(`/neo/rest/v1/neo/${asteroidId}`);
  }

  /**
   * Browse asteroids
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise<Object>} Asteroid list
   */
  async browseAsteroids(page = 0, size = 20) {
    return this.makeRequest('/neo/rest/v1/neo/browse', { page, size });
  }

  /**
   * Get today's asteroids
   * @returns {Promise<Object>} Today's asteroids
   */
  async getTodaysAsteroids() {
    const today = new Date().toISOString().split('T')[0];
    return this.getAsteroidsByDate(today);
  }

  // ===== Earth Imagery =====

  /**
   * Get Earth imagery
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Earth imagery
   */
  async getEarthImagery(params) {
    return this.makeRequest('/planetary/earth/imagery', params);
  }

  /**
   * Get Earth assets
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Earth assets
   */
  async getEarthAssets(params) {
    return this.makeRequest('/planetary/earth/assets', params);
  }

  // ===== EPIC (Earth Polychromatic Imaging Camera) =====

  /**
   * Get EPIC images
   * @param {string} type - Image type (natural or enhanced)
   * @param {string} date - Date
   * @returns {Promise<Array>} EPIC images
   */
  async getEPIC(type = 'natural', date = null) {
    let endpoint = `/EPIC/api/${type}`;
    if (date) {
      endpoint += `/date/${date}`;
    }
    return this.makeRequest(endpoint);
  }

  /**
   * Get EPIC available dates
   * @param {string} type - Image type
   * @returns {Promise<Array>} Available dates
   */
  async getEPICAvailableDates(type = 'natural') {
    return this.makeRequest(`/EPIC/api/${type}/available`);
  }

  /**
   * Get EPIC image by date and index
   * @param {string} type - Image type
   * @param {string} date - Date
   * @param {number} index - Image index
   * @returns {Promise<Object>} EPIC image
   */
  async getEPICImage(type, date, index) {
    return this.makeRequest(`/EPIC/api/${type}/date/${date}/${index}`);
  }

  // ===== TechTransfer (NASA Technology Transfer) =====

  /**
   * Search NASA patents
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Patent search results
   */
  async searchPatents(params = {}) {
    return this.makeRequest('/techtransfer/api/patents', params);
  }

  /**
   * Get patent by ID
   * @param {string} patentId - Patent ID
   * @returns {Promise<Object>} Patent details
   */
  async getPatentById(patentId) {
    return this.makeRequest(`/techtransfer/api/patents/${patentId}`);
  }

  /**
   * Get software by ID
   * @param {string} softwareId - Software ID
   * @returns {Promise<Object>} Software details
   */
  async getSoftwareById(softwareId) {
    return this.makeRequest(`/techtransfer/api/software/${softwareId}`);
  }

  // ===== TLE (Two-Line Element) API =====

  /**
   * Get TLE data from external source
   * @param {string} noradId - NORAD ID
   * @returns {Promise<Object>} TLE data
   */
  async getTLE(noradId) {
    try {
      const response = await axios.get(`https://celestrak.com/NORAD/elements/gp.php`, {
        params: {
          NORAD: noradId,
          FORMAT: 'tle',
        },
      });
      return response.data;
    } catch (error) {
      console.error('TLE API Error:', error.message);
      throw new Error('Failed to fetch TLE data');
    }
  }

  /**
   * Get satellite predictions
   * @param {string} noradId - NORAD ID
   * @param {Object} params - Prediction parameters
   * @returns {Promise<Object>} Predictions
   */
  async getSatellitePredictions(noradId, params) {
    // This would use a separate API for predictions
    throw new Error('Not implemented');
  }

  // ===== Utility Methods =====

  /**
   * Clear cache
   */
  clearCache() {
    cache.flushAll();
    console.log('NASA API cache cleared');
  }

  /**
   * Get cache stats
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
    };
  }

  /**
   * Check API status
   * @returns {Promise<boolean>} API status
   */
  async checkStatus() {
    try {
      await this.getAPOD({ count: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new NasaApiService();
