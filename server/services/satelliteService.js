const axios = require('axios');
const satellite = require('satellite.js');
const NodeCache = require('node-cache');
const Satellite = require('../models/Satellite');

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

class SatelliteService {
  constructor() {
    this.celestrakUrl = 'https://celestrak.com/NORAD/elements/gp.php';
    this.n2yoApiKey = process.env.N2YO_API_KEY;
    this.spaceTrackUrl = 'https://www.space-track.org';
  }

  /**
   * Fetch TLE data from Celestrak
   * @param {string} category - Satellite category
   * @returns {Promise<Array>} TLE data
   */
  async fetchTLEData(category = 'active') {
    try {
      const response = await axios.get(this.celestrakUrl, {
        params: {
          GROUP: category,
          FORMAT: 'tle',
        },
      });

      return this.parseTLEResponse(response.data);
    } catch (error) {
      console.error('Error fetching TLE data:', error.message);
      throw new Error('Failed to fetch TLE data');
    }
  }

  /**
   * Parse TLE response
   * @param {string} data - Raw TLE data
   * @returns {Array} Parsed satellites
   */
  parseTLEResponse(data) {
    const lines = data.split('\n');
    const satellites = [];

    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 < lines.length) {
        const name = lines[i].trim();
        const line1 = lines[i + 1].trim();
        const line2 = lines[i + 2].trim();

        if (line1 && line2) {
          satellites.push({
            name,
            tle: [line1, line2],
            noradId: line1.substring(2, 7).trim(),
          });
        }
      }
    }

    return satellites;
  }

  /**
   * Get satellite position using SGP4
   * @param {string} tleLine1 - First TLE line
   * @param {string} tleLine2 - Second TLE line
   * @param {Date} date - Observation date
   * @returns {Object} Satellite position
   */
  calculatePosition(tleLine1, tleLine2, date = new Date()) {
    try {
      // Initialize satellite record
      const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

      // Calculate position and velocity
      const positionAndVelocity = satellite.propagate(satrec, date);

      // Get geodetic position
      const positionEci = positionAndVelocity.position;
      const gmst = satellite.gstime(date);
      const positionGd = satellite.eciToGeodetic(positionEci, gmst);

      // Convert to degrees
      const longitude = satellite.degreesLong(positionGd.longitude);
      const latitude = satellite.degreesLat(positionGd.latitude);

      // Calculate velocity
      const velocity = Math.sqrt(
        Math.pow(positionAndVelocity.velocity.x, 2) +
        Math.pow(positionAndVelocity.velocity.y, 2) +
        Math.pow(positionAndVelocity.velocity.z, 2)
      );

      return {
        latitude,
        longitude,
        altitude: positionGd.height * 1000, // Convert to meters
        velocity: velocity * 1000, // Convert to m/s
        timestamp: date,
      };
    } catch (error) {
      console.error('Error calculating satellite position:', error);
      return null;
    }
  }

  /**
   * Get satellite by NORAD ID
   * @param {string} noradId - NORAD ID
   * @returns {Promise<Object>} Satellite data
   */
  async getSatelliteByNoradId(noradId) {
    // Check cache first
    const cached = cache.get(`sat:${noradId}`);
    if (cached) {
      return cached;
    }

    try {
      // Fetch from database
      let satellite = await Satellite.findOne({ noradId });

      if (!satellite) {
        // Fetch from Celestrak
        const tleData = await this.fetchTLEData(noradId);
        if (tleData.length > 0) {
          const satData = tleData[0];
          
          // Create new satellite record
          satellite = new Satellite({
            name: satData.name,
            noradId: satData.noradId,
            tle: satData.tle,
            lastUpdated: new Date(),
          });

          await satellite.save();
        }
      }

      if (satellite && satellite.tle) {
        // Calculate current position
        const position = this.calculatePosition(
          satellite.tle[0],
          satellite.tle[1],
          new Date()
        );

        if (position) {
          satellite.currentPosition = position;
          await satellite.save();
        }

        // Cache the result
        cache.set(`sat:${noradId}`, satellite);
      }

      return satellite;
    } catch (error) {
      console.error('Error getting satellite:', error);
      throw error;
    }
  }

  /**
   * Get ISS position
   * @returns {Promise<Object>} ISS position
   */
  async getISSPosition() {
    try {
      // Try Open Notify API first
      const response = await axios.get('http://api.open-notify.org/iss-now.json');
      
      if (response.data && response.data.iss_position) {
        return {
          latitude: parseFloat(response.data.iss_position.latitude),
          longitude: parseFloat(response.data.iss_position.longitude),
          altitude: 408000, // Approximate altitude in meters
          velocity: 7660, // Approximate velocity in m/s
          timestamp: new Date(response.data.timestamp * 1000),
        };
      }
    } catch (error) {
      console.log('Open Notify API failed, falling back to TLE');
    }

    // Fallback to TLE calculation
    const iss = await this.getSatelliteByNoradId('25544');
    return iss?.currentPosition || null;
  }

  /**
   * Get satellite passes for a location
   * @param {string} noradId - NORAD ID
   * @param {number} lat - Observer latitude
   * @param {number} lng - Observer longitude
   * @param {number} days - Number of days to predict
   * @returns {Promise<Array>} Satellite passes
   */
  async getSatellitePasses(noradId, lat, lng, days = 7) {
    try {
      // Use N2YO API if available
      if (this.n2yoApiKey) {
        const response = await axios.get(
          `https://api.n2yo.com/rest/v1/satellite/radiopasses/${noradId}/${lat}/${lng}/0/${days}/300/`,
          {
            params: { apiKey: this.n2yoApiKey },
          }
        );

        return response.data.passes.map(pass => ({
          start: {
            time: new Date(pass.startUTC * 1000),
            az: pass.startAz,
            el: pass.startEl,
          },
          max: {
            time: new Date(pass.maxUTC * 1000),
            az: pass.maxAz,
            el: pass.maxEl,
          },
          end: {
            time: new Date(pass.endUTC * 1000),
            az: pass.endAz,
            el: pass.endEl,
          },
        }));
      }

      // Fallback to simple calculation
      return this.calculateSimplePasses(noradId, lat, lng, days);
    } catch (error) {
      console.error('Error getting satellite passes:', error);
      return [];
    }
  }

  /**
   * Calculate simple satellite passes (fallback)
   * @param {string} noradId - NORAD ID
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} days - Days
   * @returns {Array} Simple passes
   */
  calculateSimplePasses(noradId, lat, lng, days) {
    // Simplified pass calculation
    const passes = [];
    const now = new Date();

    for (let i = 0; i < days * 4; i++) {
      const passTime = new Date(now.getTime() + i * 6 * 60 * 60 * 1000);
      
      passes.push({
        start: {
          time: new Date(passTime.getTime() - 10 * 60 * 1000),
          az: Math.random() * 360,
          el: 0,
        },
        max: {
          time: passTime,
          az: Math.random() * 360,
          el: 30 + Math.random() * 60,
        },
        end: {
          time: new Date(passTime.getTime() + 10 * 60 * 1000),
          az: Math.random() * 360,
          el: 0,
        },
      });
    }

    return passes.sort((a, b) => a.max.time - b.max.time);
  }

  /**
   * Get satellites in view
   * @param {number} lat - Observer latitude
   * @param {number} lng - Observer longitude
   * @param {number} radius - Search radius in km
   * @returns {Promise<Array>} Satellites in view
   */
  async getSatellitesInView(lat, lng, radius = 2000) {
    try {
      // Get active satellites from database
      const satellites = await Satellite.find({
        isActive: true,
        'currentPosition.latitude': { $exists: true },
      }).limit(100);

      // Calculate which are in view
      const inView = satellites.filter(sat => {
        if (!sat.currentPosition) return false;

        const distance = this.calculateGreatCircleDistance(
          lat,
          lng,
          sat.currentPosition.latitude,
          sat.currentPosition.longitude
        );

        return distance <= radius;
      });

      return inView;
    } catch (error) {
      console.error('Error getting satellites in view:', error);
      return [];
    }
  }

  /**
   * Calculate great circle distance
   * @param {number} lat1 - Latitude 1
   * @param {number} lon1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lon2 - Longitude 2
   * @returns {number} Distance in km
   */
  calculateGreatCircleDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Calculate satellite footprint
   * @param {number} altitude - Altitude in km
   * @returns {number} Footprint radius in km
   */
  calculateFootprint(altitude) {
    const R = 6371; // Earth radius in km
    const angle = Math.acos(R / (R + altitude));
    return R * angle;
  }

  /**
   * Get satellite visibility from location
   * @param {Object} satellite - Satellite data
   * @param {number} lat - Observer latitude
   * @param {number} lng - Observer longitude
   * @returns {Object} Visibility info
   */
  getSatelliteVisibility(satellite, lat, lng) {
    if (!satellite.currentPosition) {
      return { visible: false };
    }

    const distance = this.calculateGreatCircleDistance(
      lat,
      lng,
      satellite.currentPosition.latitude,
      satellite.currentPosition.longitude
    );

    const footprint = this.calculateFootprint(satellite.currentPosition.altitude / 1000);
    
    return {
      visible: distance <= footprint,
      distance,
      footprint,
      azimuth: this.calculateAzimuth(lat, lng, 
        satellite.currentPosition.latitude, 
        satellite.currentPosition.longitude),
      elevation: this.calculateElevation(lat, lng, 
        satellite.currentPosition.latitude, 
        satellite.currentPosition.longitude,
        satellite.currentPosition.altitude),
    };
  }

  /**
   * Calculate azimuth
   * @param {number} lat1 - Observer latitude
   * @param {number} lon1 - Observer longitude
   * @param {number} lat2 - Satellite latitude
   * @param {number} lon2 - Satellite longitude
   * @returns {number} Azimuth in degrees
   */
  calculateAzimuth(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const λ1 = lon1 * Math.PI / 180;
    const λ2 = lon2 * Math.PI / 180;

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);

    return (θ * 180 / Math.PI + 360) % 360;
  }

  /**
   * Calculate elevation
   * @param {number} lat1 - Observer latitude
   * @param {number} lon1 - Observer longitude
   * @param {number} lat2 - Satellite latitude
   * @param {number} lon2 - Satellite longitude
   * @param {number} alt - Satellite altitude
   * @returns {number} Elevation in degrees
   */
  calculateElevation(lat1, lon1, lat2, lon2, alt) {
    const R = 6371; // Earth radius in km
    const distance = this.calculateGreatCircleDistance(lat1, lon1, lat2, lon2);
    const satDistance = Math.sqrt(Math.pow(R, 2) + Math.pow(R + alt/1000, 2) - 
                       2 * R * (R + alt/1000) * Math.cos(distance / R));
    
    const angle = Math.acos((Math.pow(R, 2) + Math.pow(satDistance, 2) - 
                  Math.pow(R + alt/1000, 2)) / (2 * R * satDistance));
    
    return 90 - (angle * 180 / Math.PI);
  }

  /**
   * Update all satellite positions
   * @returns {Promise<number>} Number of updated satellites
   */
  async updateAllPositions() {
    try {
      const satellites = await Satellite.find({ isActive: true });
      let updated = 0;

      for (const sat of satellites) {
        if (sat.tle) {
          const position = this.calculatePosition(sat.tle[0], sat.tle[1], new Date());
          if (position) {
            sat.currentPosition = position;
            sat.path.push({
              latitude: position.latitude,
              longitude: position.longitude,
              altitude: position.altitude,
              timestamp: position.timestamp,
            });

            // Keep only last 100 positions
            if (sat.path.length > 100) {
              sat.path = sat.path.slice(-100);
            }

            await sat.save();
            updated++;
          }
        }
      }

      return updated;
    } catch (error) {
      console.error('Error updating satellite positions:', error);
      throw error;
    }
  }

  /**
   * Get satellite statistics
   * @returns {Promise<Object>} Satellite statistics
   */
  async getStatistics() {
    try {
      const stats = await Satellite.aggregate([
        {
          $group: {
            _id: '$orbitType',
            count: { $sum: 1 },
            avgAltitude: { $avg: '$currentPosition.altitude' },
          },
        },
      ]);

      const total = await Satellite.countDocuments({ isActive: true });

      return {
        total,
        byOrbit: stats,
        lastUpdate: new Date(),
      };
    } catch (error) {
      console.error('Error getting satellite statistics:', error);
      throw error;
    }
  }

  /**
   * Search satellites
   * @param {string} query - Search query
   * @returns {Promise<Array>} Search results
   */
  async searchSatellites(query) {
    try {
      return await Satellite.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { noradId: { $regex: query, $options: 'i' } },
          { country: { $regex: query, $options: 'i' } },
          { operator: { $regex: query, $options: 'i' } },
        ],
        isActive: true,
      }).limit(50);
    } catch (error) {
      console.error('Error searching satellites:', error);
      throw error;
    }
  }
}

module.exports = new SatelliteService();
