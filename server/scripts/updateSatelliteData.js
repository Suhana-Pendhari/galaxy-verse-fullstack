const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const Satellite = require('../models/Satellite');
const { getIO } = require('../config/socket');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// TLE sources
const TLE_SOURCES = {
  CELESTRAK: 'https://celestrak.com/NORAD/elements/gp.php',
  SPACE_TRACK: 'https://www.space-track.org',
};

// Satellite categories to track
const SATELLITE_CATEGORIES = {
  ISS: '25544',
  HUBBLE: '20580',
  GPS: 'NAVSTAR',
  STARLINK: 'STARLINK',
  IRIDIUM: 'IRIDIUM',
};

// Fetch TLE data from Celestrak
const fetchTLEData = async (category = 'active') => {
  try {
    console.log(`📡 Fetching TLE data for category: ${category}...`);
    
    const response = await axios.get(`${TLE_SOURCES.CELESTRAK}?GROUP=${category}&FORMAT=tle`);
    
    if (!response.data) {
      throw new Error('No data received from Celestrak');
    }

    // Parse TLE data
    const lines = response.data.split('\n');
    const satellites = [];

    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 < lines.length) {
        const name = lines[i].trim();
        const line1 = lines[i + 1].trim();
        const line2 = lines[i + 2].trim();

        // Extract NORAD ID from line1 (positions 2-7)
        const noradId = line1.substring(2, 7).trim();

        satellites.push({
          name,
          noradId,
          tle: [line1, line2],
          lastUpdated: new Date(),
        });
      }
    }

    console.log(`✅ Fetched ${satellites.length} satellites`);
    return satellites;
  } catch (error) {
    console.error('❌ Error fetching TLE data:', error.message);
    return [];
  }
};

// Calculate satellite position using SGP4 (simplified)
const calculatePosition = (tleLine1, tleLine2) => {
  // This is a simplified position calculation
  // In production, you would use a proper SGP4 library
  
  try {
    // Parse TLE elements
    const inclination = parseFloat(tleLine2.substring(8, 16));
    const raan = parseFloat(tleLine2.substring(17, 25));
    const eccentricity = parseFloat('0.' + tleLine2.substring(26, 33));
    const argPerigee = parseFloat(tleLine2.substring(34, 42));
    const meanAnomaly = parseFloat(tleLine2.substring(43, 51));
    const meanMotion = parseFloat(tleLine2.substring(52, 63));
    
    // Calculate period in minutes
    const period = 1440 / meanMotion;
    
    // Current time factor
    const now = Date.now();
    const timeSinceEpoch = (now - new Date().setHours(0, 0, 0, 0)) / (1000 * 60); // minutes since midnight
    
    // Simplified position calculation
    const anomaly = (meanAnomaly + timeSinceEpoch * 360 / period) % 360;
    const lat = Math.sin(anomaly * Math.PI / 180) * inclination;
    const lon = (anomaly + raan + now / (1000 * 60 * 60 * 24) * 360) % 360 - 180;
    
    // Approximate altitude based on mean motion
    const altitude = Math.pow(1440 / (meanMotion * 2 * Math.PI), 2/3) * 42300 - 6371;
    
    return {
      latitude: lat,
      longitude: lon,
      altitude: Math.round(altitude),
      velocity: Math.round(2 * Math.PI * (6371 + altitude) / (period * 60) * 3.6), // km/h
      timestamp: now,
    };
  } catch (error) {
    console.error('Error calculating position:', error);
    return null;
  }
};

// Update satellite positions in database
const updateSatellitePositions = async () => {
  try {
    console.log('🛰️ Starting satellite position update...\n');

    // Fetch latest TLE data
    const satellites = await fetchTLEData('active');
    
    if (satellites.length === 0) {
      console.log('No satellite data to process');
      return;
    }

    let updated = 0;
    let created = 0;

    // Process each satellite
    for (const sat of satellites.slice(0, 100)) { // Limit to first 100 for demo
      try {
        // Calculate current position
        const position = calculatePosition(sat.tle[0], sat.tle[1]);
        
        if (!position) continue;

        // Update or create satellite in database
        const existingSat = await Satellite.findOne({ noradId: sat.noradId });

        if (existingSat) {
          // Update existing satellite
          existingSat.currentPosition = position;
          existingSat.lastUpdated = new Date();
          
          // Add to path history (keep last 100 positions)
          existingSat.path.push({
            latitude: position.latitude,
            longitude: position.longitude,
            altitude: position.altitude,
            timestamp: position.timestamp,
          });
          
          if (existingSat.path.length > 100) {
            existingSat.path = existingSat.path.slice(-100);
          }
          
          await existingSat.save();
          updated++;
        } else {
          // Create new satellite
          const newSat = new Satellite({
            name: sat.name,
            noradId: sat.noradId,
            currentPosition: position,
            path: [{
              latitude: position.latitude,
              longitude: position.longitude,
              altitude: position.altitude,
              timestamp: position.timestamp,
            }],
            orbitType: determineOrbitType(position.altitude),
            isActive: true,
            lastUpdated: new Date(),
          });
          
          await newSat.save();
          created++;
        }

        // Progress indicator
        if ((updated + created) % 10 === 0) {
          process.stdout.write('.');
        }
      } catch (error) {
        console.error(`\nError processing satellite ${sat.noradId}:`, error.message);
      }
    }

    console.log('\n\n📊 Update Summary:');
    console.log(`   - Updated: ${updated} satellites`);
    console.log(`   - Created: ${created} satellites`);
    console.log(`   - Total: ${updated + created} satellites processed`);

    // Update ISS specifically (NORAD ID: 25544)
    await updateISS();

    console.log('\n✅ Satellite data update completed!');
  } catch (error) {
    console.error('❌ Error updating satellite data:', error);
  }
};

// Determine orbit type based on altitude
const determineOrbitType = (altitude) => {
  if (altitude < 2000) return 'LEO';
  if (altitude < 20000) return 'MEO';
  if (altitude < 35786) return 'GEO';
  return 'Elliptical';
};

// Special update for ISS (more frequent)
const updateISS = async () => {
  try {
    console.log('\n🛰️ Updating ISS position...');
    
    // Try to fetch from Open Notify API for more accurate position
    try {
      const response = await axios.get('http://api.open-notify.org/iss-now.json');
      
      if (response.data && response.data.iss_position) {
        const position = {
          latitude: parseFloat(response.data.iss_position.latitude),
          longitude: parseFloat(response.data.iss_position.longitude),
          altitude: 408, // Approximate altitude
          velocity: 27600 / 3600, // km/s
          timestamp: response.data.timestamp * 1000,
        };

        await Satellite.findOneAndUpdate(
          { noradId: '25544' },
          {
            currentPosition: position,
            $push: {
              path: {
                latitude: position.latitude,
                longitude: position.longitude,
                altitude: position.altitude,
                timestamp: position.timestamp,
              },
            },
            lastUpdated: new Date(),
          },
          { upsert: true }
        );

        console.log('✅ ISS position updated from Open Notify API');
        return;
      }
    } catch (apiError) {
      console.log('Open Notify API unavailable, using TLE data...');
    }

    // Fallback to TLE data
    const issTLE = await fetchTLEData('25544');
    if (issTLE.length > 0) {
      const position = calculatePosition(issTLE[0].tle[0], issTLE[0].tle[1]);
      if (position) {
        await Satellite.findOneAndUpdate(
          { noradId: '25544' },
          {
            name: 'INTERNATIONAL SPACE STATION',
            currentPosition: position,
            $push: {
              path: {
                latitude: position.latitude,
                longitude: position.longitude,
                altitude: position.altitude,
                timestamp: position.timestamp,
              },
            },
            orbitType: 'LEO',
            isActive: true,
            lastUpdated: new Date(),
          },
          { upsert: true }
        );
        console.log('✅ ISS position updated from TLE data');
      }
    }
  } catch (error) {
    console.error('Error updating ISS:', error.message);
  }
};

// Get statistics about satellites
const getSatelliteStats = async () => {
  try {
    const stats = await Satellite.aggregate([
      {
        $group: {
          _id: '$orbitType',
          count: { $sum: 1 },
          avgAltitude: { $avg: '$currentPosition.altitude' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = await Satellite.countDocuments();

    console.log('\n📊 Satellite Statistics:');
    console.log(`   Total Active Satellites: ${total}`);
    console.log('   By Orbit Type:');
    stats.forEach(stat => {
      console.log(`     - ${stat._id}: ${stat.count} (avg altitude: ${Math.round(stat.avgAltitude)} km)`);
    });

    return stats;
  } catch (error) {
    console.error('Error getting satellite stats:', error);
    return [];
  }
};

// Clean up old path data
const cleanupOldPaths = async () => {
  try {
    console.log('\n🧹 Cleaning up old path data...');
    
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 24); // Keep last 24 hours

    const result = await Satellite.updateMany(
      {},
      {
        $pull: {
          path: {
            timestamp: { $lt: cutoffDate },
          },
        },
      }
    );

    console.log(`✅ Removed old path data from ${result.modifiedCount} satellites`);
  } catch (error) {
    console.error('Error cleaning up paths:', error);
  }
};

// Main update function
const runUpdate = async () => {
  try {
    console.log('='.repeat(50));
    console.log('🛰️ SATELLITE DATA UPDATE SCRIPT');
    console.log('='.repeat(50));
    console.log();

    const startTime = Date.now();

    // Update satellite positions
    await updateSatellitePositions();

    // Get statistics
    await getSatelliteStats();

    // Clean up old data
    await cleanupOldPaths();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️ Update completed in ${duration} seconds`);

    console.log('\n✅ Satellite update script finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error in satellite update:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runUpdate();
}

module.exports = {
  updateSatellitePositions,
  getSatelliteStats,
  cleanupOldPaths,
  fetchTLEData,
};
