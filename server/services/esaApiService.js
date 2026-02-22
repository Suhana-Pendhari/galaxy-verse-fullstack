const axios = require('axios');
const NodeCache = require('node-cache');
const xml2js = require('xml2js');

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

class EsaApiService {
  constructor() {
    this.baseURL = 'https://esa.es',
    this.client = axios.create({
      timeout: 10000,
    });
    this.parser = new xml2js.Parser({ explicitArray: false });
  }

  /**
   * Make API request with caching
   * @param {string} url - Full URL
   * @returns {Promise<Object>} API response
   */
  async makeRequest(url) {
    const cached = cache.get(url);
    if (cached) return cached;

    try {
      const response = await this.client.get(url);
      
      // Try to parse as JSON, fallback to XML
      let data;
      if (response.headers['content-type']?.includes('application/json')) {
        data = response.data;
      } else {
        data = await this.parser.parseStringPromise(response.data);
      }
      
      cache.set(url, data);
      return data;
    } catch (error) {
      console.error(`ESA API Error: ${error.message}`);
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
      if (status >= 500) return new Error('ESA API server error');
      return new Error('ESA API error');
    }
    return new Error('No response from ESA API');
  }

  // ===== ESA News =====

  /**
   * Get ESA news
   * @returns {Promise<Object>} News feed
   */
  async getNews() {
    return this.makeRequest('https://www.esa.int/rssfeed/ESA_Main_headlines');
  }

  /**
   * Get ESA blog posts
   * @returns {Promise<Object>} Blog feed
   */
  async getBlog() {
    return this.makeRequest('https://www.esa.int/rssfeed/ESA_Blog');
  }

  // ===== Space in Images =====

  /**
   * Get ESA images
   * @returns {Promise<Object>} Images feed
   */
  async getImages() {
    return this.makeRequest('https://www.esa.int/rssfeed/ESA_Space_in_Images');
  }

  /**
   * Get image of the week
   * @returns {Promise<Object>} Image of the week
   */
  async getImageOfTheWeek() {
    const images = await this.getImages();
    // Parse RSS feed and get latest image
    return images?.rss?.channel?.item?.[0] || null;
  }

  // ===== Space in Videos =====

  /**
   * Get ESA videos
   * @returns {Promise<Object>} Videos feed
   */
  async getVideos() {
    return this.makeRequest('https://www.esa.int/rssfeed/ESA_Space_in_Videos');
  }

  /**
   * Get video of the week
   * @returns {Promise<Object>} Video of the week
   */
  async getVideoOfTheWeek() {
    const videos = await this.getVideos();
    return videos?.rss?.channel?.item?.[0] || null;
  }

  // ===== ESA Missions =====

  /**
   * Get current missions
   * @returns {Promise<Array>} Current missions
   */
  async getCurrentMissions() {
    // This would typically come from an API endpoint
    return [
      { id: 'juice', name: 'JUICE', description: 'Jupiter Icy Moons Explorer' },
      { id: 'gaia', name: 'Gaia', description: 'Mapping the Milky Way' },
      { id: 'cheops', name: 'Cheops', description: 'Exoplanet characterization' },
      { id: 'solar-orbiter', name: 'Solar Orbiter', description: 'Studying the Sun' },
      { id: 'euclid', name: 'Euclid', description: 'Dark universe explorer' },
      { id: 'hera', name: 'Hera', description: 'Asteroid deflection mission' },
    ];
  }

  /**
   * Get future missions
   * @returns {Promise<Array>} Future missions
   */
  async getFutureMissions() {
    return [
      { id: 'ariane-6', name: 'Ariane 6', description: 'Next-generation launch vehicle' },
      { id: 'exomars', name: 'ExoMars', description: 'Mars rover mission' },
      { id: 'plato', name: 'PLATO', description: 'Exoplanet hunter' },
      { id: 'arrakihs', name: 'Arrakihs', description: 'Astronomy mission' },
    ];
  }

  /**
   * Get completed missions
   * @returns {Promise<Array>} Completed missions
   */
  async getCompletedMissions() {
    return [
      { id: 'giotto', name: 'Giotto', description: 'Halley\'s comet encounter' },
      { id: 'huygens', name: 'Huygens', description: 'Titan landing' },
      { id: 'rosetta', name: 'Rosetta', description: 'Comet rendezvous' },
      { id: 'herschel', name: 'Herschel', description: 'Infrared space observatory' },
    ];
  }

  // ===== ESA Programmes =====

  /**
   * Get science programme
   * @returns {Promise<Object>} Science programme details
   */
  async getScienceProgramme() {
    return {
      name: 'Science Programme',
      description: 'ESA\'s scientific missions',
      missions: await this.getCurrentMissions(),
    };
  }

  /**
   * Get human spaceflight programme
   * @returns {Promise<Object>} Human spaceflight details
   */
  async getHumanSpaceflight() {
    return {
      name: 'Human Spaceflight',
      description: 'European astronauts and ISS missions',
      astronauts: await this.getAstronauts(),
    };
  }

  /**
   * Get space transportation programme
   * @returns {Promise<Object>} Launch vehicles
   */
  async getSpaceTransportation() {
    return {
      name: 'Space Transportation',
      description: 'European launch vehicles',
      vehicles: ['Ariane 5', 'Ariane 6', 'Vega', 'Vega-C'],
    };
  }

  // ===== Astronauts =====

  /**
   * Get ESA astronauts
   * @returns {Promise<Array>} Astronauts list
   */
  async getAstronauts() {
    return [
      { name: 'Samantha Cristoforetti', country: 'Italy', missions: 2 },
      { name: 'Thomas Pesquet', country: 'France', missions: 2 },
      { name: 'Alexander Gerst', country: 'Germany', missions: 2 },
      { name: 'Luca Parmitano', country: 'Italy', missions: 2 },
      { name: 'Tim Peake', country: 'UK', missions: 1 },
      { name: 'Andreas Mogensen', country: 'Denmark', missions: 1 },
    ];
  }

  /**
   * Get current astronauts in space
   * @returns {Promise<Array>} Astronauts currently in space
   */
  async getAstronautsInSpace() {
    const astronauts = await this.getAstronauts();
    // This would check ISS crew status
    return astronauts.filter(a => a.name === 'Samantha Cristoforetti');
  }

  // ===== ESA Centres =====

  /**
   * Get ESA centres
   * @returns {Promise<Array>} ESA centres
   */
  async getCentres() {
    return [
      { name: 'ESOC', location: 'Darmstadt, Germany', function: 'Operations Centre' },
      { name: 'ESTEC', location: 'Noordwijk, Netherlands', function: 'Technical Centre' },
      { name: 'ESRIN', location: 'Frascati, Italy', function: 'Earth Observation' },
      { name: 'ESAC', location: 'Madrid, Spain', function: 'Astronomy Centre' },
      { name: 'EAC', location: 'Cologne, Germany', function: 'Astronaut Centre' },
      { name: 'ECSAT', location: 'Harwell, UK', function: 'Innovation Centre' },
    ];
  }

  /**
   * Get centre by name
   * @param {string} name - Centre name
   * @returns {Promise<Object>} Centre details
   */
  async getCentreByName(name) {
    const centres = await this.getCentres();
    return centres.find(c => c.name === name.toUpperCase()) || null;
  }

  // ===== Earth Observation =====

  /**
   * Get Earth observation missions
   * @returns {Promise<Array>} EO missions
   */
  async getEarthObservationMissions() {
    return [
      { id: 'sentinel-1', name: 'Sentinel-1', type: 'Radar imaging' },
      { id: 'sentinel-2', name: 'Sentinel-2', type: 'Optical imaging' },
      { id: 'sentinel-3', name: 'Sentinel-3', type: 'Ocean monitoring' },
      { id: 'sentinel-5p', name: 'Sentinel-5P', type: 'Atmospheric monitoring' },
      { id: 'cryosat', name: 'CryoSat', type: 'Ice monitoring' },
      { id: 'smos', name: 'SMOS', type: 'Soil moisture' },
    ];
  }

  /**
   * Get Copernicus programme details
   * @returns {Promise<Object>} Copernicus details
   */
  async getCopernicus() {
    return {
      name: 'Copernicus',
      description: 'Earth observation programme',
      satellites: await this.getEarthObservationMissions(),
    };
  }

  // ===== Space Science =====

  /**
   * Get space science missions
   * @returns {Promise<Array>} Science missions
   */
  async getScienceMissions() {
    return [
      { id: 'juice', name: 'JUICE', type: 'Planetary science' },
      { id: 'gaia', name: 'Gaia', type: 'Astronomy' },
      { id: 'cheops', name: 'Cheops', type: 'Exoplanet science' },
      { id: 'solar-orbiter', name: 'Solar Orbiter', type: 'Heliophysics' },
      { id: 'euclid', name: 'Euclid', type: 'Cosmology' },
      { id: 'lisa-pathfinder', name: 'LISA Pathfinder', type: 'Gravitational waves' },
    ];
  }

  /**
   * Get mission by ID
   * @param {string} id - Mission ID
   * @returns {Promise<Object>} Mission details
   */
  async getMissionById(id) {
    const allMissions = [
      ...await this.getCurrentMissions(),
      ...await this.getFutureMissions(),
      ...await this.getCompletedMissions(),
    ];
    return allMissions.find(m => m.id === id) || null;
  }

  // ===== Technology =====

  /**
   * Get technology programmes
   * @returns {Promise<Array>} Technology programmes
   */
  async getTechnologyProgrammes() {
    return [
      { name: 'ARTES', description: 'Advanced Research in Telecommunications' },
      { name: 'GSTP', description: 'General Support Technology Programme' },
      { name: 'FLPP', description: 'Future Launchers Preparatory Programme' },
      { name: 'EMITS', description: 'Electronic Mail Invitation to Tender System' },
    ];
  }

  // ===== Education =====

  /**
   * Get education programmes
   * @returns {Promise<Array>} Education programmes
   */
  async getEducationProgrammes() {
    return [
      { name: 'ESERO', description: 'European Space Education Resource Office' },
      { name: 'Fly Your Satellite', description: 'Student satellite programme' },
      { name: 'Moon Camp', description: 'Student Moon base design' },
      { name: 'CanSat', description: 'Student can-sized satellite programme' },
    ];
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
      await this.getNews();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Search ESA data
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results
   */
  async search(query) {
    const [
      currentMissions,
      futureMissions,
      completedMissions,
      astronauts,
      centres,
    ] = await Promise.all([
      this.getCurrentMissions(),
      this.getFutureMissions(),
      this.getCompletedMissions(),
      this.getAstronauts(),
      this.getCentres(),
    ]);

    const results = {
      missions: [
        ...currentMissions.filter(m => m.name.toLowerCase().includes(query.toLowerCase())),
        ...futureMissions.filter(m => m.name.toLowerCase().includes(query.toLowerCase())),
        ...completedMissions.filter(m => m.name.toLowerCase().includes(query.toLowerCase())),
      ],
      astronauts: astronauts.filter(a => 
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.country.toLowerCase().includes(query.toLowerCase())
      ),
      centres: centres.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.location.toLowerCase().includes(query.toLowerCase())
      ),
    };

    return results;
  }
}

module.exports = new EsaApiService();
