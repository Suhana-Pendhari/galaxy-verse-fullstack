const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

class SpaceXApiService {
  constructor() {
    this.baseURL = 'https://api.spacexdata.com/v4';
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
    
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get(endpoint, { params });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`SpaceX API Error: ${error.message}`);
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
      if (status === 404) return new Error('Resource not found');
      if (status === 429) return new Error('Rate limit exceeded');
      if (status >= 500) return new Error('SpaceX API server error');
      return new Error(error.response.data?.message || 'SpaceX API error');
    }
    return new Error('No response from SpaceX API');
  }

  // ===== Launches =====

  /**
   * Get all launches
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Launches
   */
  async getAllLaunches(params = {}) {
    return this.makeRequest('/launches', params);
  }

  /**
   * Get upcoming launches
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Upcoming launches
   */
  async getUpcomingLaunches(params = {}) {
    return this.makeRequest('/launches/upcoming', params);
  }

  /**
   * Get past launches
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Past launches
   */
  async getPastLaunches(params = {}) {
    return this.makeRequest('/launches/past', params);
  }

  /**
   * Get latest launch
   * @returns {Promise<Object>} Latest launch
   */
  async getLatestLaunch() {
    return this.makeRequest('/launches/latest');
  }

  /**
   * Get next launch
   * @returns {Promise<Object>} Next launch
   */
  async getNextLaunch() {
    return this.makeRequest('/launches/next');
  }

  /**
   * Get launch by ID
   * @param {string} id - Launch ID
   * @returns {Promise<Object>} Launch details
   */
  async getLaunchById(id) {
    return this.makeRequest(`/launches/${id}`);
  }

  // ===== Rockets =====

  /**
   * Get all rockets
   * @returns {Promise<Array>} Rockets
   */
  async getAllRockets() {
    return this.makeRequest('/rockets');
  }

  /**
   * Get rocket by ID
   * @param {string} id - Rocket ID
   * @returns {Promise<Object>} Rocket details
   */
  async getRocketById(id) {
    return this.makeRequest(`/rockets/${id}`);
  }

  /**
   * Get Falcon 9 details
   * @returns {Promise<Object>} Falcon 9 details
   */
  async getFalcon9() {
    return this.getRocketById('5e9d0d95eda69955f709d1eb');
  }

  /**
   * Get Falcon Heavy details
   * @returns {Promise<Object>} Falcon Heavy details
   */
  async getFalconHeavy() {
    return this.getRocketById('5e9d0d95eda69974db09d1ed');
  }

  /**
   * Get Starship details
   * @returns {Promise<Object>} Starship details
   */
  async getStarship() {
    return this.getRocketById('5e9d0d96eda699382d09d1ee');
  }

  // ===== Crew =====

  /**
   * Get all crew members
   * @returns {Promise<Array>} Crew members
   */
  async getAllCrew() {
    return this.makeRequest('/crew');
  }

  /**
   * Get crew member by ID
   * @param {string} id - Crew ID
   * @returns {Promise<Object>} Crew member details
   */
  async getCrewById(id) {
    return this.makeRequest(`/crew/${id}`);
  }

  // ===== Dragons =====

  /**
   * Get all Dragon capsules
   * @returns {Promise<Array>} Dragon capsules
   */
  async getAllDragons() {
    return this.makeRequest('/dragons');
  }

  /**
   * Get Dragon by ID
   * @param {string} id - Dragon ID
   * @returns {Promise<Object>} Dragon details
   */
  async getDragonById(id) {
    return this.makeRequest(`/dragons/${id}`);
  }

  // ===== Capsules =====

  /**
   * Get all capsules
   * @returns {Promise<Array>} Capsules
   */
  async getAllCapsules() {
    return this.makeRequest('/capsules');
  }

  /**
   * Get capsule by serial
   * @param {string} serial - Capsule serial
   * @returns {Promise<Object>} Capsule details
   */
  async getCapsuleBySerial(serial) {
    return this.makeRequest(`/capsules/${serial}`);
  }

  // ===== Cores =====

  /**
   * Get all cores
   * @returns {Promise<Array>} Cores
   */
  async getAllCores() {
    return this.makeRequest('/cores');
  }

  /**
   * Get core by serial
   * @param {string} serial - Core serial
   * @returns {Promise<Object>} Core details
   */
  async getCoreBySerial(serial) {
    return this.makeRequest(`/cores/${serial}`);
  }

  // ===== Launchpads =====

  /**
   * Get all launchpads
   * @returns {Promise<Array>} Launchpads
   */
  async getAllLaunchpads() {
    return this.makeRequest('/launchpads');
  }

  /**
   * Get launchpad by ID
   * @param {string} id - Launchpad ID
   * @returns {Promise<Object>} Launchpad details
   */
  async getLaunchpadById(id) {
    return this.makeRequest(`/launchpads/${id}`);
  }

  // ===== Landing Pads =====

  /**
   * Get all landing pads
   * @returns {Promise<Array>} Landing pads
   */
  async getAllLandingPads() {
    return this.makeRequest('/landpads');
  }

  /**
   * Get landing pad by ID
   * @param {string} id - Landing pad ID
   * @returns {Promise<Object>} Landing pad details
   */
  async getLandingPadById(id) {
    return this.makeRequest(`/landpads/${id}`);
  }

  // ===== Ships =====

  /**
   * Get all ships
   * @returns {Promise<Array>} Ships
   */
  async getAllShips() {
    return this.makeRequest('/ships');
  }

  /**
   * Get ship by ID
   * @param {string} id - Ship ID
   * @returns {Promise<Object>} Ship details
   */
  async getShipById(id) {
    return this.makeRequest(`/ships/${id}`);
  }

  // ===== Company Info =====

  /**
   * Get company info
   * @returns {Promise<Object>} Company info
   */
  async getCompanyInfo() {
    return this.makeRequest('/company');
  }

  // ===== Roadster Info =====

  /**
   * Get Tesla Roadster info
   * @returns {Promise<Object>} Roadster info
   */
  async getRoadsterInfo() {
    return this.makeRequest('/roadster');
  }

  // ===== History =====

  /**
   * Get historical events
   * @returns {Promise<Array>} Historical events
   */
  async getHistory() {
    return this.makeRequest('/history');
  }

  /**
   * Get historical event by ID
   * @param {string} id - Event ID
   * @returns {Promise<Object>} Event details
   */
  async getHistoryById(id) {
    return this.makeRequest(`/history/${id}`);
  }

  // ===== Payloads =====

  /**
   * Get all payloads
   * @returns {Promise<Array>} Payloads
   */
  async getAllPayloads() {
    return this.makeRequest('/payloads');
  }

  /**
   * Get payload by ID
   * @param {string} id - Payload ID
   * @returns {Promise<Object>} Payload details
   */
  async getPayloadById(id) {
    return this.makeRequest(`/payloads/${id}`);
  }

  // ===== Starlink =====

  /**
   * Get all Starlink satellites
   * @returns {Promise<Array>} Starlink satellites
   */
  async getAllStarlink() {
    return this.makeRequest('/starlink');
  }

  /**
   * Get Starlink satellite by ID
   * @param {string} id - Starlink ID
   * @returns {Promise<Object>} Starlink details
   */
  async getStarlinkById(id) {
    return this.makeRequest(`/starlink/${id}`);
  }

  /**
   * Get Starlink by launch
   * @param {string} launchId - Launch ID
   * @returns {Promise<Array>} Starlink satellites from launch
   */
  async getStarlinkByLaunch(launchId) {
    return this.makeRequest('/starlink', { query: { launch: launchId } });
  }

  // ===== Utility Methods =====

  /**
   * Clear cache
   */
  clearCache() {
    cache.flushAll();
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
      await this.getCompanyInfo();
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new SpaceXApiService();
