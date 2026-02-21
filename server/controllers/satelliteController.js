const Satellite = require('../models/Satellite');
const axios = require('axios');
const { getIO } = require('../config/socket');
const cron = require('node-cron');

// Cache for satellite positions
let satelliteCache = new Map();
let lastUpdate = null;

// @desc    Get all satellites
// @route   GET /api/satellite
// @access  Public
exports.getSatellites = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, orbitType } = req.query;

    const filter = { isActive: true };
    
    if (orbitType) filter.orbitType = orbitType;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { operator: { $regex: search, $options: 'i' } },
      ];
    }

    const satellites = await Satellite.find(filter)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ name: 1 });

    const total = await Satellite.countDocuments(filter);

    res.json({
      success: true,
      data: satellites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get satellites error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get single satellite by ID
// @route   GET /api/satellite/:id
// @access  Public
exports.getSatelliteById = async (req, res) => {
  try {
    const satellite = await Satellite.findById(req.params.id);

    if (!satellite) {
      return res.status(404).json({ 
        success: false,
        message: 'Satellite not found' 
      });
    }

    // Get current position from cache or calculate
    let currentPosition = satelliteCache.get(satellite.noradId);
    if (!currentPosition) {
      currentPosition = await calculateSatellitePosition(satellite);
      if (currentPosition) {
        satelliteCache.set(satellite.noradId, currentPosition);
      }
    }

    res.json({
      success: true,
      data: {
        ...satellite.toObject(),
        currentPosition,
      },
    });
  } catch (error) {
    console.error('Get satellite by id error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get ISS current position
// @route   GET /api/satellite/iss
// @access  Public
exports.getISSPosition = async (req, res) => {
  try {
    // Try to get from cache first
    let iss = satelliteCache.get('25544');
    
    if (!iss || (Date.now() - (lastUpdate || 0)) > 60000) { // Update every minute
      // Fetch from Open Notify API
      const response = await axios.get('http://api.open-notify.org/iss-now.json');
      
      if (response.data && response.data.iss_position) {
        iss = {
          latitude: parseFloat(response.data.iss_position.latitude),
          longitude: parseFloat(response.data.iss_position.longitude),
          timestamp: response.data.timestamp * 1000,
          altitude: 408, // Approximate altitude in km
          velocity: 27600 / 3600, // km/s (approx)
        };
        
        satelliteCache.set('25544', iss);
        lastUpdate = Date.now();

        // Also update in database
        await Satellite.findOneAndUpdate(
          { noradId: '25544' },
          {
            currentPosition: iss,
            lastUpdated: new Date(),
          }
        );

        // Emit socket event for real-time tracking
        const io = getIO();
        io.emit('iss-position-update', iss);
      }
    }

    // Get ISS info from database
    const issSatellite = await Satellite.findOne({ noradId: '25544' });

    res.json({
      success: true,
      data: {
        position: iss,
        satellite: issSatellite,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get ISS position error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching ISS position',
      error: error.message,
    });
  }
};

// @desc    Get satellite pass times for a location
// @route   GET /api/satellite/passes
// @access  Public
exports.getSatellitePasses = async (req, res) => {
  try {
    const { lat, lon, days = 7, noradId = '25544' } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false,
        message: 'Latitude and longitude are required' 
      });
    }

    // Use N2YO API or similar for pass predictions
    // This is a simplified version - in production, use a proper API
    const response = await axios.get(
      `https://api.n2yo.com/rest/v1/satellite/radiopasses/${noradId}/${lat}/${lon}/0/${days}/300/&apiKey=${process.env.N2YO_API_KEY}`
    );

    const passes = response.data.passes.map(pass => ({
      startAz: pass.startAz,
      startAzCompass: pass.startAzCompass,
      startEl: pass.startEl,
      startUTC: pass.startUTC * 1000,
      maxAz: pass.maxAz,
      maxAzCompass: pass.maxAzCompass,
      maxEl: pass.maxEl,
      maxUTC: pass.maxUTC * 1000,
      endAz: pass.endAz,
      endAzCompass: pass.endAzCompass,
      endEl: pass.endEl,
      endUTC: pass.endUTC * 1000,
    }));

    res.json({
      success: true,
      data: passes,
      location: { lat, lon },
      satellite: noradId,
    });
  } catch (error) {
    console.error('Get satellite passes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching satellite passes',
      error: error.message,
    });
  }
};

// @desc    Get satellites in view for a location
// @route   GET /api/satellite/in-view
// @access  Public
exports.getSatellitesInView = async (req, res) => {
  try {
    const { lat, lon, radius = 90 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false,
        message: 'Latitude and longitude are required' 
      });
    }

    // This would typically use a TLE database and SGP4 propagation
    // For now, return a simplified response
    const satellites = await Satellite.find({
      isActive: true,
      'currentPosition.latitude': { $exists: true },
    }).limit(20);

    // Calculate which satellites are in view
    const inView = satellites.filter(sat => {
      if (!sat.currentPosition) return false;
      
      // Simple distance calculation (not accurate, just for demo)
      const lat1 = parseFloat(lat) * Math.PI / 180;
      const lon1 = parseFloat(lon) * Math.PI / 180;
      const lat2 = sat.currentPosition.latitude * Math.PI / 180;
      const lon2 = sat.currentPosition.longitude * Math.PI / 180;
      
      const d = Math.acos(
        Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
      ) * 6371; // Earth radius in km
      
      return d < radius * 111; // Rough conversion
    });

    res.json({
      success: true,
      data: inView,
      count: inView.length,
      location: { lat, lon },
    });
  } catch (error) {
    console.error('Get satellites in view error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get satellite orbit path
// @route   GET /api/satellite/:id/orbit
// @access  Public
exports.getSatelliteOrbit = async (req, res) => {
  try {
    const satellite = await Satellite.findById(req.params.id);

    if (!satellite) {
      return res.status(404).json({ 
        success: false,
        message: 'Satellite not found' 
      });
    }

    // Generate orbit path points for visualization
    // This would use TLE and SGP4 for accurate prediction
    const points = [];
    const steps = 360;
    const now = Date.now();

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      
      // Simplified circular orbit - in reality use SGP4
      const lat = satellite.orbitDetails.inclination * Math.sin(angle);
      const lon = (angle * 180 / Math.PI) % 360;
      
      points.push({
        latitude: lat,
        longitude: lon,
        altitude: satellite.orbitDetails.apogee,
        timestamp: now + i * (satellite.orbitDetails.period * 60 * 1000 / steps),
      });
    }

    res.json({
      success: true,
      data: {
        satellite: {
          id: satellite._id,
          name: satellite.name,
          noradId: satellite.noradId,
        },
        orbit: points,
        currentPosition: satellite.currentPosition,
      },
    });
  } catch (error) {
    console.error('Get satellite orbit error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Update satellite data from external sources (Cron job)
// @access  Internal
exports.updateSatelliteData = async () => {
  try {
    console.log('Updating satellite data...');

    // Fetch latest TLE data from Celestrak
    const response = await axios.get('https://celestrak.com/NORAD/elements/gp.php?GROUP=active&FORMAT=tle');
    
    // Parse TLE data (simplified)
    const lines = response.data.split('\n');
    const satellites = [];

    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 < lines.length) {
        const name = lines[i].trim();
        const tle1 = lines[i + 1].trim();
        const tle2 = lines[i + 2].trim();

        // Parse NORAD ID from TLE
        const noradId = tle1.substring(2, 7).trim();

        satellites.push({
          name,
          noradId,
          tle: [tle1, tle2],
        });
      }
    }

    // Update database
    for (const sat of satellites.slice(0, 100)) { // Limit for demo
      await Satellite.findOneAndUpdate(
        { noradId: sat.noradId },
        {
          name: sat.name,
          lastUpdated: new Date(),
        },
        { upsert: true }
      );
    }

    console.log(`Updated ${satellites.length} satellites`);

    // Emit socket event
    const io = getIO();
    io.emit('satellite-data-updated', {
      count: satellites.length,
      timestamp: new Date(),
    });

  } catch (error) {
    console.error('Update satellite data error:', error);
  }
};

// Helper function to calculate satellite position (simplified)
async function calculateSatellitePosition(satellite) {
  try {
    // This would use SGP4 propagation with TLE data
    // For now, return a simplified position
    const now = Date.now();
    const period = satellite.orbitDetails?.period || 90; // minutes
    const progress = (now % (period * 60 * 1000)) / (period * 60 * 1000);
    
    // Simplified circular orbit
    const lat = Math.sin(progress * Math.PI * 2) * satellite.orbitDetails?.inclination || 0;
    const lon = (progress * 360 + now / (60 * 1000)) % 360 - 180;

    return {
      latitude: lat,
      longitude: lon,
      altitude: satellite.orbitDetails?.apogee || 400,
      velocity: 7.8, // km/s approximate
      timestamp: now,
    };
  } catch (error) {
    console.error('Calculate satellite position error:', error);
    return null;
  }
}

// Schedule satellite updates (run every 6 hours)
cron.schedule('0 */6 * * *', () => {
  exports.updateSatelliteData();
});
