const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Mission = require('../models/Mission');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const missions = [
  // SpaceX Missions
  {
    name: 'Falcon 9 Starlink 6-25',
    description: 'SpaceX Falcon 9 launch of 22 Starlink satellites to low Earth orbit.',
    organization: 'SpaceX',
    launchDate: new Date('2024-01-15'),
    launchSite: {
      name: 'Cape Canaveral SFS',
      coordinates: { lat: 28.5623, lng: -80.5771 },
      country: 'USA',
      timezone: 'America/New_York',
    },
    rocket: {
      name: 'Falcon 9 Block 5',
      type: 'Medium-lift',
      stages: 2,
      height: 70,
      diameter: 3.7,
      mass: 549054,
      thrust: 7607,
    },
    payload: [
      {
        name: 'Starlink V2 Mini',
        type: 'Satellite',
        mass: 17600,
        destination: 'LEO',
        description: '22 Starlink internet satellites',
      }
    ],
    missionType: 'Satellite Deployment',
    status: 'Upcoming',
    missionHighlights: [
      'First launch of 2024',
      'Booster flight #12',
      'Drone ship landing',
    ],
    timeline: [
      { time: 'T-00:00:00', event: 'Launch', description: 'Liftoff from SLC-40' },
      { time: 'T+00:02:35', event: 'MECO', description: 'Main engine cutoff' },
      { time: 'T+00:02:38', event: 'Stage Separation', description: 'First stage separates' },
      { time: 'T+00:08:15', event: 'Landing', description: 'Booster lands on drone ship' },
      { time: 'T+01:05:00', event: 'Deployment', description: 'Satellites deployed' },
    ],
    tags: ['spacex', 'falcon9', 'starlink', 'leo'],
  },
  {
    name: 'Falcon Heavy GOES-U',
    description: 'Launch of NOAA\'s GOES-U weather satellite, the final spacecraft in the GOES-R series.',
    organization: 'SpaceX',
    launchDate: new Date('2024-04-30'),
    launchSite: {
      name: 'Kennedy Space Center',
      coordinates: { lat: 28.5721, lng: -80.6480 },
      country: 'USA',
      timezone: 'America/New_York',
    },
    rocket: {
      name: 'Falcon Heavy',
      type: 'Heavy-lift',
      stages: 2,
      height: 70,
      diameter: 12.2,
      mass: 1420000,
      thrust: 22800,
    },
    payload: [
      {
        name: 'GOES-U',
        type: 'Satellite',
        mass: 5200,
        destination: 'GEO',
        description: 'NOAA geostationary weather satellite',
      }
    ],
    missionType: 'Satellite Deployment',
    status: 'Upcoming',
    missionHighlights: [
      'Final GOES-R series satellite',
      'Dual booster landing',
      'Advanced weather monitoring',
    ],
    timeline: [
      { time: 'T-00:00:00', event: 'Launch', description: 'Liftoff from LC-39A' },
      { time: 'T+00:03:00', event: 'Booster Separation', description: 'Side boosters separate' },
      { time: 'T+00:08:00', event: 'Landing', description: 'Boosters land at LZ-1 and LZ-2' },
      { time: 'T+03:30:00', event: 'Upper Stage Burn', description: 'Final orbit insertion' },
    ],
    tags: ['spacex', 'falcon-heavy', 'noaa', 'weather', 'geo'],
  },

  // NASA Missions
  {
    name: 'VIPER Lunar Rover',
    description: 'Volatiles Investigating Polar Exploration Rover - NASA mission to map water ice at the Moon\'s south pole.',
    organization: 'NASA',
    launchDate: new Date('2024-11-10'),
    launchSite: {
      name: 'Kennedy Space Center',
      coordinates: { lat: 28.5721, lng: -80.6480 },
      country: 'USA',
      timezone: 'America/New_York',
    },
    rocket: {
      name: 'Falcon Heavy',
      type: 'Heavy-lift',
      stages: 2,
      height: 70,
      diameter: 12.2,
      mass: 1420000,
      thrust: 22800,
    },
    payload: [
      {
        name: 'VIPER Rover',
        type: 'Rover',
        mass: 450,
        destination: 'Lunar South Pole',
        description: 'Water-ice mapping rover',
      },
      {
        name: 'Griffin Lander',
        type: 'Lander',
        mass: 5000,
        destination: 'Lunar South Pole',
        description: 'Astrobotic lunar lander',
      }
    ],
    missionType: 'Planetary Exploration',
    status: 'Upcoming',
    missionHighlights: [
      'First resource mapping mission on Moon',
      '100-day mission duration',
      'Search for water ice deposits',
    ],
    crew: [
      {
        name: 'VIPER',
        role: 'Robotic Rover',
        bio: 'NASA\'s first mobile robotic mission to the Moon',
      }
    ],
    tags: ['nasa', 'moon', 'rover', 'viper', 'water-ice'],
  },
  {
    name: 'Crew-9',
    description: 'Ninth operational crew rotation mission to the International Space Station.',
    organization: 'NASA',
    launchDate: new Date('2024-08-01'),
    launchSite: {
      name: 'Kennedy Space Center',
      coordinates: { lat: 28.5721, lng: -80.6480 },
      country: 'USA',
      timezone: 'America/New_York',
    },
    rocket: {
      name: 'Falcon 9 Block 5',
      type: 'Medium-lift',
      stages: 2,
      height: 70,
      diameter: 3.7,
      mass: 549054,
      thrust: 7607,
    },
    payload: [
      {
        name: 'Crew Dragon',
        type: 'Crew',
        mass: 12000,
        destination: 'ISS',
        description: 'Crew Dragon spacecraft with 4 astronauts',
      }
    ],
    missionType: 'Crewed Mission',
    status: 'Upcoming',
    missionHighlights: [
      '4 crew members to ISS',
      '6-month mission',
      'Scientific research',
    ],
    crew: [
      {
        name: 'TBA',
        role: 'Commander',
        nationality: 'USA',
      },
      {
        name: 'TBA',
        role: 'Pilot',
        nationality: 'USA',
      },
    ],
    tags: ['nasa', 'iss', 'crew', 'spacex', 'dragon'],
  },

  // ISRO Missions
  {
    name: 'Chandrayaan-3',
    description: 'ISRO\'s third lunar mission featuring a lander and rover to demonstrate soft landing on the Moon.',
    organization: 'ISRO',
    launchDate: new Date('2024-06-15'),
    launchSite: {
      name: 'Satish Dhawan Space Centre',
      coordinates: { lat: 13.7199, lng: 80.2303 },
      country: 'India',
      timezone: 'Asia/Kolkata',
    },
    rocket: {
      name: 'LVM3',
      type: 'Heavy-lift',
      stages: 3,
      height: 43.5,
      diameter: 4,
      mass: 640000,
      thrust: 10500,
    },
    payload: [
      {
        name: 'Vikram Lander',
        type: 'Lander',
        mass: 1750,
        destination: 'Lunar Surface',
        description: 'Lander module',
      },
      {
        name: 'Pragyan Rover',
        type: 'Rover',
        mass: 30,
        destination: 'Lunar Surface',
        description: 'Small rover for surface exploration',
      }
    ],
    missionType: 'Planetary Exploration',
    status: 'Upcoming',
    missionHighlights: [
      'India\'s second lunar landing attempt',
      'Demonstrate soft landing capability',
      'Surface science experiments',
    ],
    tags: ['isro', 'moon', 'chandrayaan', 'lander', 'rover'],
  },
  {
    name: 'Aditya-L1',
    description: 'India\'s first solar mission to study the Sun from the L1 Lagrange point.',
    organization: 'ISRO',
    launchDate: new Date('2024-09-02'),
    launchSite: {
      name: 'Satish Dhawan Space Centre',
      coordinates: { lat: 13.7199, lng: 80.2303 },
      country: 'India',
      timezone: 'Asia/Kolkata',
    },
    rocket: {
      name: 'PSLV-XL',
      type: 'Medium-lift',
      stages: 4,
      height: 44.4,
      diameter: 2.8,
      mass: 320000,
      thrust: 4500,
    },
    payload: [
      {
        name: 'Aditya-L1 Observatory',
        type: 'Spacecraft',
        mass: 1500,
        destination: 'L1 Lagrange Point',
        description: 'Solar observation satellite',
      }
    ],
    missionType: 'Space Telescope',
    status: 'Upcoming',
    missionHighlights: [
      'First Indian mission to study Sun',
      'Located at L1 point',
      'Study solar corona and activities',
    ],
    tags: ['isro', 'sun', 'solar', 'lagrange', 'corona'],
  },

  // ESA Missions
  {
    name: 'Ariane 6 Maiden Flight',
    description: 'First launch of Europe\'s new Ariane 6 heavy-lift rocket.',
    organization: 'ESA',
    launchDate: new Date('2024-06-15'),
    launchSite: {
      name: 'Guiana Space Centre',
      coordinates: { lat: 5.2379, lng: -52.7685 },
      country: 'French Guiana',
      timezone: 'America/Cayenne',
    },
    rocket: {
      name: 'Ariane 62',
      type: 'Heavy-lift',
      stages: 2,
      height: 63,
      diameter: 5.4,
      mass: 860000,
      thrust: 13500,
    },
    payload: [
      {
        name: 'Multiple Small Satellites',
        type: 'Satellite',
        mass: 7000,
        destination: 'Various Orbits',
        description: 'Multiple payloads for first flight',
      }
    ],
    missionType: 'Test Flight',
    status: 'Upcoming',
    missionHighlights: [
      'Debut of Ariane 6 rocket',
      'European launch capability',
      'Multiple payload deployment',
    ],
    tags: ['esa', 'ariane6', 'europe', 'maiden-flight'],
  },
  {
    name: 'JUICE',
    description: 'JUpiter ICy moons Explorer mission to study Jupiter\'s icy moons.',
    organization: 'ESA',
    launchDate: new Date('2024-04-13'),
    launchSite: {
      name: 'Guiana Space Centre',
      coordinates: { lat: 5.2379, lng: -52.7685 },
      country: 'French Guiana',
      timezone: 'America/Cayenne',
    },
    rocket: {
      name: 'Ariane 5',
      type: 'Heavy-lift',
      stages: 2,
      height: 53,
      diameter: 5.4,
      mass: 777000,
      thrust: 11400,
    },
    payload: [
      {
        name: 'JUICE Orbiter',
        type: 'Spacecraft',
        mass: 6000,
        destination: 'Jupiter System',
        description: 'Mission to study Ganymede, Callisto, and Europa',
      }
    ],
    missionType: 'Planetary Exploration',
    status: 'Upcoming',
    missionHighlights: [
      'Explore Jupiter\'s icy moons',
      'Search for habitable environments',
      'First spacecraft to orbit Ganymede',
    ],
    tags: ['esa', 'jupiter', 'juice', 'icy-moons', 'ganymede'],
  },
];

const seedMissions = async () => {
  try {
    console.log('🚀 Starting mission seeding...\n');

    // Clear existing missions
    console.log('Clearing existing missions...');
    await Mission.deleteMany({});
    console.log('✅ Existing missions cleared\n');

    // Create new missions
    console.log('Creating new missions...');
    const createdMissions = await Mission.create(missions);
    console.log(`✅ Created ${createdMissions.length} missions\n`);

    console.log('📊 Missions by organization:');
    const orgCounts = {};
    createdMissions.forEach(mission => {
      orgCounts[mission.organization] = (orgCounts[mission.organization] || 0) + 1;
    });
    
    Object.entries(orgCounts).forEach(([org, count]) => {
      console.log(`   - ${org}: ${count}`);
    });

    console.log('\n📊 Missions by status:');
    const statusCounts = {};
    createdMissions.forEach(mission => {
      statusCounts[mission.status] = (statusCounts[mission.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });

    console.log('\n✅ Mission seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding missions:', error);
    process.exit(1);
  }
};

seedMissions();
