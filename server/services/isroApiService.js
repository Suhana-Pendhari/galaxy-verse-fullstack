const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

class IsroApiService {
  constructor() {
    this.baseURL = 'https://isro.vercel.app/api';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
  }

  /**
   * Make API request with caching
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} API response
   */
  async makeRequest(endpoint) {
    const cached = cache.get(endpoint);
    if (cached) return cached;

    try {
      const response = await this.client.get(endpoint);
      cache.set(endpoint, response.data);
      return response.data;
    } catch (error) {
      console.error(`ISRO API Error: ${error.message}`);
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
      if (status >= 500) return new Error('ISRO API server error');
      return new Error(error.response.data?.message || 'ISRO API error');
    }
    return new Error('No response from ISRO API');
  }

  // ===== Spacecraft =====

  /**
   * Get all spacecraft
   * @returns {Promise<Array>} Spacecraft list
   */
  async getAllSpacecraft() {
    return this.makeRequest('/spacecrafts');
  }

  /**
   * Get spacecraft by ID
   * @param {string} id - Spacecraft ID
   * @returns {Promise<Object>} Spacecraft details
   */
  async getSpacecraftById(id) {
    return this.makeRequest(`/spacecrafts/${id}`);
  }

  // ===== Launchers =====

  /**
   * Get all launchers
   * @returns {Promise<Array>} Launcher list
   */
  async getAllLaunchers() {
    return this.makeRequest('/launchers');
  }

  /**
   * Get launcher by ID
   * @param {string} id - Launcher ID
   * @returns {Promise<Object>} Launcher details
   */
  async getLauncherById(id) {
    return this.makeRequest(`/launchers/${id}`);
  }

  // ===== Satellites =====

  /**
   * Get all satellites
   * @returns {Promise<Array>} Satellite list
   */
  async getAllSatellites() {
    return this.makeRequest('/satellites');
  }

  /**
   * Get satellite by ID
   * @param {string} id - Satellite ID
   * @returns {Promise<Object>} Satellite details
   */
  async getSatelliteById(id) {
    return this.makeRequest(`/satellites/${id}`);
  }

  /**
   * Get customer satellites
   * @returns {Promise<Array>} Customer satellites
   */
  async getCustomerSatellites() {
    return this.makeRequest('/customer_satellites');
  }

  // ===== Missions =====

  /**
   * Get all missions
   * @returns {Promise<Array>} Mission list
   */
  async getAllMissions() {
    return this.makeRequest('/missions');
  }

  /**
   * Get mission by ID
   * @param {string} id - Mission ID
   * @returns {Promise<Object>} Mission details
   */
  async getMissionById(id) {
    return this.makeRequest(`/missions/${id}`);
  }

  // ===== Centers =====

  /**
   * Get all centers
   * @returns {Promise<Array>} Center list
   */
  async getAllCenters() {
    return this.makeRequest('/centers');
  }

  /**
   * Get center by ID
   * @param {string} id - Center ID
   * @returns {Promise<Object>} Center details
   */
  async getCenterById(id) {
    return this.makeRequest(`/centers/${id}`);
  }

  // ===== Launch Centers =====

  /**
   * Get all launch centers
   * @returns {Promise<Array>} Launch center list
   */
  async getLaunchCenters() {
    return this.makeRequest('/launchers');
  }

  /**
   * Get launch center by ID
   * @param {string} id - Launch center ID
   * @returns {Promise<Object>} Launch center details
   */
  async getLaunchCenterById(id) {
    return this.makeRequest(`/launchers/${id}`);
  }

  // ===== ISRO Timeline =====

  /**
   * Get ISRO timeline
   * @returns {Promise<Array>} Timeline events
   */
  async getTimeline() {
    // This endpoint might not exist, combining data from multiple endpoints
    const [spacecraft, launchers, satellites] = await Promise.all([
      this.getAllSpacecraft(),
      this.getAllLaunchers(),
      this.getAllSatellites(),
    ]);

    return {
      spacecraft: spacecraft?.spacecrafts || [],
      launchers: launchers?.launchers || [],
      satellites: satellites?.satellites || [],
    };
  }

  // ===== Upcoming Missions =====

  /**
   * Get upcoming missions
   * @returns {Promise<Array>} Upcoming missions
   */
  async getUpcomingMissions() {
    const missions = await this.getAllMissions();
    // Filter upcoming missions based on date if available
    return missions?.missions?.filter(m => m.status === 'Upcoming') || [];
  }

  // ===== Past Missions =====

  /**
   * Get past missions
   * @returns {Promise<Array>} Past missions
   */
  async getPastMissions() {
    const missions = await this.getAllMissions();
    return missions?.missions?.filter(m => m.status === 'Completed') || [];
  }

  // ===== Vehicle Specifications =====

  /**
   * Get PSLV specifications
   * @returns {Promise<Object>} PSLV details
   */
  async getPSLVDetails() {
    const launchers = await this.getAllLaunchers();
    return launchers?.launchers?.find(l => l.id === 'pslv');
  }

  /**
   * Get GSLV specifications
   * @returns {Promise<Object>} GSLV details
   */
  async getGSLVDetails() {
    const launchers = await this.getAllLaunchers();
    return launchers?.launchers?.find(l => l.id === 'gslv');
  }

  /**
   * Get LVM3 specifications
   * @returns {Promise<Object>} LVM3 details
   */
  async getLVM3Details() {
    const launchers = await this.getAllLaunchers();
    return launchers?.launchers?.find(l => l.id === 'lvm3');
  }

  // ===== Chandrayaan Missions =====

  /**
   * Get Chandrayaan missions
   * @returns {Promise<Array>} Chandrayaan missions
   */
  async getChandrayaanMissions() {
    const missions = await this.getAllMissions();
    return missions?.missions?.filter(m => 
      m.name?.toLowerCase().includes('chandrayaan')
    ) || [];
  }

  /**
   * Get Chandrayaan-3 details
   * @returns {Promise<Object>} Chandrayaan-3 details
   */
  async getChandrayaan3() {
    const missions = await this.getAllMissions();
    return missions?.missions?.find(m => m.id === 'chandrayaan3');
  }

  // ===== Mangalyaan Missions =====

  /**
   * Get Mangalyaan details
   * @returns {Promise<Object>} Mangalyaan details
   */
  async getMangalyaan() {
    const spacecraft = await this.getAllSpacecraft();
    return spacecraft?.spacecrafts?.find(s => s.id === 'mangalyaan');
  }

  // ===== Aditya Missions =====

  /**
   * Get Aditya-L1 details
   * @returns {Promise<Object>} Aditya-L1 details
   */
  async getAdityaL1() {
    const spacecraft = await this.getAllSpacecraft();
    return spacecraft?.spacecrafts?.find(s => s.id === 'adityal1');
  }

  // ===== Gaganyaan =====

  /**
   * Get Gaganyaan details
   * @returns {Promise<Object>} Gaganyaan details
   */
  async getGaganyaan() {
    const missions = await this.getAllMissions();
    return missions?.missions?.find(m => m.id === 'gaganyaan');
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
      await this.getAllSpacecraft();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Search ISRO database
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results
   */
  async search(query) {
    const [spacecraft, launchers, satellites, missions] = await Promise.all([
      this.getAllSpacecraft(),
      this.getAllLaunchers(),
      this.getAllSatellites(),
      this.getAllMissions(),
    ]);

    const results = {
      spacecraft: spacecraft?.spacecrafts?.filter(s => 
        s.name?.toLowerCase().includes(query.toLowerCase())
      ) || [],
      launchers: launchers?.launchers?.filter(l => 
        l.name?.toLowerCase().includes(query.toLowerCase())
      ) || [],
      satellites: satellites?.satellites?.filter(s => 
        s.name?.toLowerCase().includes(query.toLowerCase())
      ) || [],
      missions: missions?.missions?.filter(m => 
        m.name?.toLowerCase().includes(query.toLowerCase())
      ) || [],
    };

    return results;
  }
}

module.exports = new IsroApiService();
