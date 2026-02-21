const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Mission = require('../models/Mission');
const Quiz = require('../models/Quiz');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Satellite = require('../models/Satellite');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data generators
const generateUsers = (count = 10) => {
  const users = [];
  const names = ['john', 'jane', 'bob', 'alice', 'charlie', 'diana', 'eve', 'frank', 'grace', 'henry'];
  const adjectives = ['space', 'cosmic', 'stellar', 'galactic', 'lunar', 'solar', 'astral', 'orbital', 'rocket', 'nova'];
  
  for (let i = 0; i < count; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const num = Math.floor(Math.random() * 1000);
    
    users.push({
      username: `${adj}_${name}${num}`,
      email: `${adj}_${name}${num}@example.com`,
      password: 'Password123!',
      role: i === 0 ? 'admin' : (i < 3 ? 'moderator' : 'user'),
      isVerified: true,
      bio: `Passionate about space exploration! ${adj} enthusiast.`,
      profilePicture: `https://ui-avatars.com/api/?name=${adj}+${name}&background=6b21a5&color=fff&size=128`,
      achievements: [
        {
          name: 'First Login',
          description: 'Logged in for the first time',
          earnedAt: new Date(),
        },
      ],
    });
  }
  return users;
};

const generateMissions = () => {
  return [
    {
      name: 'Artemis II',
      description: 'First crewed mission of the Orion spacecraft around the Moon. Will carry four astronauts on a 10-day mission testing life support systems and performing a lunar flyby.',
      organization: 'NASA',
      launchDate: new Date('2024-11-01'),
      launchSite: {
        name: 'Kennedy Space Center',
        coordinates: { lat: 28.5721, lng: -80.6480 },
        country: 'USA',
        timezone: 'America/New_York',
      },
      rocket: {
        name: 'SLS Block 1',
        type: 'Heavy-lift',
        stages: 2,
        height: 98,
        diameter: 8.4,
        mass: 2600000,
        thrust: 39000,
      },
      payload: [
        {
          name: 'Orion Crew Module',
          type: 'Crew',
          mass: 25800,
          destination: 'Lunar Orbit',
        }
      ],
      missionType: 'Crewed Mission',
      status: 'Upcoming',
      crew: [
        {
          name: 'Reid Wiseman',
          role: 'Commander',
          nationality: 'USA',
          bio: 'NASA astronaut and former Chief of the Astronaut Office',
        },
        {
          name: 'Victor Glover',
          role: 'Pilot',
          nationality: 'USA',
          bio: 'NASA astronaut and pilot of SpaceX Crew-1',
        },
        {
          name: 'Christina Koch',
          role: 'Mission Specialist',
          nationality: 'USA',
          bio: 'NASA astronaut who holds record for longest single spaceflight by a woman',
        },
        {
          name: 'Jeremy Hansen',
          role: 'Mission Specialist',
          nationality: 'Canada',
          bio: 'Canadian Space Agency astronaut',
        },
      ],
      missionHighlights: [
        'First crewed mission to the Moon since Apollo 17',
        'Test Orion life support systems',
        'Perform lunar flyby and return to Earth',
      ],
      timeline: [
        { time: 'T-00:00:00', event: 'Launch', description: 'Liftoff from KSC LC-39B' },
        { time: 'T+00:08:00', event: 'Main Engine Cutoff', description: 'Core stage separation' },
        { time: 'T+02:00:00', event: 'Trans-Lunar Injection', description: 'Burn to leave Earth orbit' },
        { time: 'T+4 days', event: 'Lunar Flyby', description: 'Closest approach to Moon' },
        { time: 'T+10 days', event: 'Return to Earth', description: 'Splashdown in Pacific Ocean' },
      ],
      tags: ['moon', 'crewed', 'nasa', 'artemis', 'orion'],
      isFeatured: true,
    },
    {
      name: 'Starship Orbital Flight Test',
      description: 'First integrated orbital flight test of SpaceX Starship, the most powerful launch vehicle ever developed. Will demonstrate orbital capability and reentry of both stages.',
      organization: 'SpaceX',
      launchDate: new Date('2024-03-01'),
      launchSite: {
        name: 'Starbase',
        coordinates: { lat: 25.997, lng: -97.156 },
        country: 'USA',
        timezone: 'America/Chicago',
      },
      rocket: {
        name: 'Starship',
        type: 'Super Heavy-lift',
        stages: 2,
        height: 120,
        diameter: 9,
        mass: 5000000,
        thrust: 74000,
      },
      payload: [
        {
          name: 'Starlink Simulators',
          type: 'Satellite',
          mass: 10000,
          destination: 'LEO',
        }
      ],
      missionType: 'Test Flight',
      status: 'Upcoming',
      missionHighlights: [
        'Most powerful rocket ever launched',
        'First orbital attempt of Starship',
        'Test reentry and landing systems',
      ],
      timeline: [
        { time: 'T-00:00:00', event: 'Launch', description: 'Liftoff from Starbase' },
        { time: 'T+00:02:40', event: 'Booster Separation', description: 'Super Heavy separates' },
        { time: 'T+00:08:00', event: 'Stage 2 Engine Cutoff', description: 'Starship reaches orbit' },
        { time: 'T+01:30:00', event: 'Reentry', description: 'Starship reenters atmosphere' },
        { time: 'T+01:35:00', event: 'Landing', description: 'Splashdown near Hawaii' },
      ],
      tags: ['starship', 'spacex', 'test', 'orbital', 'super-heavy'],
      isFeatured: true,
    },
    {
      name: 'Gaganyaan-1',
      description: 'India\'s first human spaceflight mission, carrying three astronauts to low Earth orbit for a 7-day mission. Marks India\'s entry into crewed space exploration.',
      organization: 'ISRO',
      launchDate: new Date('2024-12-01'),
      launchSite: {
        name: 'Satish Dhawan Space Centre',
        coordinates: { lat: 13.7199, lng: 80.2303 },
        country: 'India',
        timezone: 'Asia/Kolkata',
      },
      rocket: {
        name: 'HLVM3',
        type: 'Heavy-lift',
        stages: 3,
        height: 43.5,
        diameter: 3.5,
        mass: 640000,
        thrust: 10500,
      },
      payload: [
        {
          name: 'Gaganyaan Crew Module',
          type: 'Crew',
          mass: 8200,
          destination: 'LEO',
        }
      ],
      missionType: 'Crewed Mission',
      status: 'Upcoming',
      crew: [
        {
          name: 'Group Captain',
          role: 'Commander',
          nationality: 'India',
          bio: 'Indian Air Force test pilot',
        },
      ],
      missionHighlights: [
        'India\'s first crewed space mission',
        '7-day mission in low Earth orbit',
        'Test human spaceflight capabilities',
      ],
      timeline: [
        { time: 'T-00:00:00', event: 'Launch', description: 'Liftoff from SDSC' },
        { time: 'T+00:10:00', event: 'Orbit Insertion', description: 'Crew module reaches orbit' },
        { time: 'T+7 days', event: 'Deorbit Burn', description: 'Begin return to Earth' },
        { time: 'T+7 days 20 min', event: 'Splashdown', description: 'Landing in Bay of Bengal' },
      ],
      tags: ['gaganyaan', 'isro', 'crewed', 'india', 'space'],
      isFeatured: true,
    },
    {
      name: 'Europa Clipper',
      description: 'Mission to study Jupiter\'s moon Europa, investigating its habitability through detailed reconnaissance. Will perform multiple flybys to map surface and study subsurface ocean.',
      organization: 'NASA',
      launchDate: new Date('2024-10-10'),
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
          name: 'Europa Clipper Orbiter',
          type: 'Spacecraft',
          mass: 6000,
          destination: 'Jupiter Orbit',
        }
      ],
      missionType: 'Planetary Exploration',
      status: 'Upcoming',
      missionHighlights: [
        'Search for signs of habitability on Europa',
        'Map ice shell thickness',
        'Study subsurface ocean composition',
      ],
      timeline: [
        { time: 'Launch', event: 'October 2024', description: 'Launch from Kennedy Space Center' },
        { time: 'Mars Flyby', event: 'February 2025', description: 'Gravity assist at Mars' },
        { time: 'Earth Flyby', event: 'December 2026', description: 'Gravity assist at Earth' },
        { time: 'Jupiter Arrival', event: 'April 2030', description: 'Enter Jupiter orbit' },
      ],
      tags: ['jupiter', 'europa', 'nasa', 'exploration', 'ocean'],
      isFeatured: true,
    },
  ];
};

const generateQuizzes = () => {
  return [
    {
      title: 'Solar System Basics',
      description: 'Test your knowledge about our solar system with these beginner-friendly questions.',
      category: 'Solar System',
      difficulty: 'easy',
      timeLimit: 10,
      passingScore: 60,
      questions: [
        {
          question: 'How many planets are in our solar system?',
          options: [
            { text: '7', isCorrect: false },
            { text: '8', isCorrect: true },
            { text: '9', isCorrect: false },
            { text: '10', isCorrect: false },
          ],
          explanation: 'There are 8 planets in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.',
          points: 10,
          difficulty: 'easy',
        },
        {
          question: 'Which is the largest planet?',
          options: [
            { text: 'Earth', isCorrect: false },
            { text: 'Saturn', isCorrect: false },
            { text: 'Jupiter', isCorrect: true },
            { text: 'Neptune', isCorrect: false },
          ],
          explanation: 'Jupiter is the largest planet, with a diameter of 139,820 km - more than 11 times that of Earth.',
          points: 10,
          difficulty: 'easy',
        },
        {
          question: 'Which planet is known as the Red Planet?',
          options: [
            { text: 'Venus', isCorrect: false },
            { text: 'Mars', isCorrect: true },
            { text: 'Jupiter', isCorrect: false },
            { text: 'Saturn', isCorrect: false },
          ],
          explanation: 'Mars appears red due to iron oxide (rust) on its surface.',
          points: 10,
          difficulty: 'easy',
        },
        {
          question: 'What is the closest planet to the Sun?',
          options: [
            { text: 'Venus', isCorrect: false },
            { text: 'Earth', isCorrect: false },
            { text: 'Mercury', isCorrect: true },
            { text: 'Mars', isCorrect: false },
          ],
          explanation: 'Mercury is the closest planet to the Sun, orbiting at an average distance of 58 million km.',
          points: 10,
          difficulty: 'easy',
        },
        {
          question: 'Which planet has the most moons?',
          options: [
            { text: 'Jupiter', isCorrect: false },
            { text: 'Saturn', isCorrect: true },
            { text: 'Uranus', isCorrect: false },
            { text: 'Neptune', isCorrect: false },
          ],
          explanation: 'Saturn has 83 confirmed moons, the most of any planet in our solar system.',
          points: 10,
          difficulty: 'easy',
        },
      ],
    },
    {
      title: 'Space Missions Expert',
      description: 'Advanced questions about historic and current space missions.',
      category: 'Space Missions',
      difficulty: 'hard',
      timeLimit: 20,
      passingScore: 70,
      questions: [
        {
          question: 'Which mission first discovered water ice on the Moon?',
          options: [
            { text: 'Apollo 11', isCorrect: false },
            { text: 'LCROSS', isCorrect: true },
            { text: 'Lunar Prospector', isCorrect: false },
            { text: 'Chandrayaan-1', isCorrect: false },
          ],
          explanation: 'NASA\'s LCROSS mission confirmed water ice in permanently shadowed craters at the lunar south pole in 2009.',
          points: 15,
          difficulty: 'hard',
        },
        {
          question: 'What was the name of the first spacecraft to orbit Mercury?',
          options: [
            { text: 'Mariner 10', isCorrect: false },
            { text: 'MESSENGER', isCorrect: true },
            { text: 'BepiColombo', isCorrect: false },
            { text: 'Mercury Orbiter', isCorrect: false },
          ],
          explanation: 'MESSENGER (MErcury Surface, Space ENvironment, GEochemistry, and Ranging) was the first to orbit Mercury in 2011.',
          points: 15,
          difficulty: 'hard',
        },
        {
          question: 'Which mission returned samples from asteroid Ryugu?',
          options: [
            { text: 'OSIRIS-REx', isCorrect: false },
            { text: 'Hayabusa2', isCorrect: true },
            { text: 'Dawn', isCorrect: false },
            { text: 'New Horizons', isCorrect: false },
          ],
          explanation: 'Japan\'s Hayabusa2 mission successfully returned samples from asteroid Ryugu in December 2020.',
          points: 15,
          difficulty: 'hard',
        },
        {
          question: 'What was the primary mission of the Planck spacecraft?',
          options: [
            { text: 'Study Mars', isCorrect: false },
            { text: 'Map cosmic microwave background', isCorrect: true },
            { text: 'Search for exoplanets', isCorrect: false },
            { text: 'Study Jupiter', isCorrect: false },
          ],
          explanation: 'The Planck mission mapped the cosmic microwave background radiation with unprecedented precision from 2009 to 2013.',
          points: 15,
          difficulty: 'hard',
        },
        {
          question: 'Which mission first landed on a comet?',
          options: [
            { text: 'Rosetta', isCorrect: true },
            { text: 'Stardust', isCorrect: false },
            { text: 'Deep Impact', isCorrect: false },
            { text: 'Giotto', isCorrect: false },
          ],
          explanation: 'The Rosetta mission\'s Philae lander made the first soft landing on a comet (67P/Churyumov-Gerasimenko) in 2014.',
          points: 15,
          difficulty: 'hard',
        },
      ],
    },
  ];
};

const generatePosts = (users) => {
  const posts = [];
  const titles = [
    'Just spotted the International Space Station!',
    'My best astrophotography shot yet',
    'Question about black holes',
    'SpaceX launch viewing experience',
    'New space documentary recommendation',
    'Understanding orbital mechanics',
    'The future of space tourism',
    'Mars colonization challenges',
    'Best telescopes for beginners',
    'Observing the Perseid meteor shower',
  ];
  
  const contents = [
    'I was able to see the ISS pass overhead tonight and it was absolutely breathtaking! The timing was perfect and it was so bright.',
    'After months of practice, I finally captured this amazing image of the Andromeda Galaxy. The details are incredible!',
    'I\'ve been reading about black holes and I\'m trying to understand how time dilation works near the event horizon.',
    'Watching a Falcon 9 launch in person was the most incredible experience of my life. The sound and vibration are something you have to feel.',
    'Just watched an amazing documentary about the Voyager missions. The fact that they\'re still sending data after 45 years is mind-blowing.',
    'Can someone explain how orbital transfers work? I\'m trying to understand the Hohmann transfer concept.',
    'What do you think about the future of space tourism? Will it become affordable in our lifetime?',
    'The challenges of Mars colonization are fascinating. The radiation exposure alone is a huge hurdle.',
    'Looking for recommendations for a first telescope under $500. What would be good for viewing planets?',
    'The Perseid meteor shower was spectacular this year! Saw dozens of shooting stars.',
  ];

  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const titleIndex = Math.floor(Math.random() * titles.length);
    
    posts.push({
      title: titles[titleIndex],
      content: contents[Math.floor(Math.random() * contents.length)],
      author: user._id,
      tags: ['astronomy', 'space', 'discussion'].concat(
        Math.random() > 0.5 ? ['observation'] : ['question']
      ),
      category: ['Astronomy', 'Discussion', 'Space News'][Math.floor(Math.random() * 3)],
      isPublished: true,
      stats: {
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 10),
        views: Math.floor(Math.random() * 500),
      },
    });
  }
  
  return posts;
};

const generateSatellites = () => {
  return [
    {
      name: 'International Space Station',
      noradId: '25544',
      country: 'International',
      operator: 'NASA/Roscosmos/ESA/JAXA/CSA',
      purpose: 'Space station research',
      launchDate: new Date('1998-11-20'),
      orbitType: 'LEO',
      orbitDetails: {
        perigee: 408,
        apogee: 418,
        inclination: 51.64,
        period: 92.68,
        eccentricity: 0.0007,
      },
      isActive: true,
      description: 'The largest modular space station in low Earth orbit.',
    },
    {
      name: 'Hubble Space Telescope',
      noradId: '20580',
      country: 'USA',
      operator: 'NASA/ESA',
      purpose: 'Astronomical observation',
      launchDate: new Date('1990-04-24'),
      orbitType: 'LEO',
      orbitDetails: {
        perigee: 535,
        apogee: 540,
        inclination: 28.5,
        period: 95.4,
        eccentricity: 0.0003,
      },
      isActive: true,
      description: 'Revolutionary space telescope that has transformed astronomy.',
    },
    {
      name: 'Starlink-1000',
      noradId: '44713',
      country: 'USA',
      operator: 'SpaceX',
      purpose: 'Internet communication',
      launchDate: new Date('2019-11-11'),
      orbitType: 'LEO',
      orbitDetails: {
        perigee: 550,
        apogee: 560,
        inclination: 53,
        period: 95.5,
        eccentricity: 0.0001,
      },
      isActive: true,
      description: 'Part of SpaceX\'s satellite internet constellation.',
    },
  ];
};

const seedDatabase = async () => {
  try {
    console.log('🌌 Starting database seeding...\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Mission.deleteMany({});
    await Quiz.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Satellite.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create users
    console.log('Creating users...');
    const userData = generateUsers(10);
    const users = await User.create(userData);
    console.log(`✅ Created ${users.length} users\n`);

    // Create missions
    console.log('Creating missions...');
    const missionData = generateMissions();
    const missions = await Mission.create(missionData);
    console.log(`✅ Created ${missions.length} missions\n`);

    // Create quizzes
    console.log('Creating quizzes...');
    const quizData = generateQuizzes();
    const quizzes = await Quiz.create(quizData.map(quiz => ({
      ...quiz,
      createdBy: users[0]._id, // Admin created
    })));
    console.log(`✅ Created ${quizzes.length} quizzes\n`);

    // Create posts
    console.log('Creating community posts...');
    const postData = generatePosts(users);
    const posts = await Post.create(postData);
    console.log(`✅ Created ${posts.length} posts\n`);

    // Create satellites
    console.log('Creating satellite data...');
    const satelliteData = generateSatellites();
    const satellites = await Satellite.create(satelliteData);
    console.log(`✅ Created ${satellites.length} satellites\n`);

    // Create some comments
    console.log('Creating comments...');
    const comments = [];
    for (let i = 0; i < 30; i++) {
      const post = posts[Math.floor(Math.random() * posts.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      
      comments.push({
        content: `Great post! Really interesting perspective. ${Math.random() > 0.5 ? 'Thanks for sharing!' : 'Keep up the good work!'}`,
        author: user._id,
        targetType: 'post',
        targetId: post._id,
        targetModel: 'Post',
      });
    }
    await Comment.create(comments);
    console.log(`✅ Created ${comments.length} comments\n`);

    // Update user achievements
    console.log('Updating user achievements...');
    for (const user of users) {
      await User.findByIdAndUpdate(user._id, {
        $push: {
          achievements: {
            name: 'Space Explorer',
            description: 'Viewed space data',
            earnedAt: new Date(),
          },
        },
      });
    }
    console.log('✅ User achievements updated\n');

    // Create admin log
    console.log('Creating admin log entry...');
    const AdminLog = require('../models/AdminLog');
    await AdminLog.create({
      admin: users[0]._id,
      action: 'database_seeded',
      targetType: 'system',
      changes: { 
        users: users.length,
        missions: missions.length,
        quizzes: quizzes.length,
        posts: posts.length,
        satellites: satellites.length,
        comments: comments.length,
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Seeder Script',
    });
    console.log('✅ Admin log created\n');

    console.log('📊 Seeding Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Missions: ${missions.length}`);
    console.log(`   - Quizzes: ${quizzes.length}`);
    console.log(`   - Posts: ${posts.length}`);
    console.log(`   - Comments: ${comments.length}`);
    console.log(`   - Satellites: ${satellites.length}\n`);

    console.log('✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
