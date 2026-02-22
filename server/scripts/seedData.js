const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Mission = require('../models/Mission');
const Quiz = require('../models/Quiz');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Satellite = require('../models/Satellite');

// MongoDB connection options
const connectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds
};

// Connect to DB with error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, connectOptions);
    console.log('✅ MongoDB Connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection error:', error.message);
    return false;
  }
};

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
      missionType: 'Crewed Mission',
      status: 'Upcoming',
      tags: ['moon', 'crewed', 'nasa', 'artemis'],
      isFeatured: true,
    },
    {
      name: 'Starship Orbital Flight Test',
      description: 'First integrated orbital flight test of SpaceX Starship, the most powerful launch vehicle ever developed.',
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
      missionType: 'Test Flight',
      status: 'Upcoming',
      tags: ['starship', 'spacex', 'test'],
      isFeatured: true,
    },
    {
      name: 'Gaganyaan-1',
      description: 'India\'s first human spaceflight mission, carrying three astronauts to low Earth orbit for a 7-day mission.',
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
      missionType: 'Crewed Mission',
      status: 'Upcoming',
      tags: ['gaganyaan', 'isro', 'crewed'],
      isFeatured: true,
    },
    {
      name: 'Europa Clipper',
      description: 'Mission to study Jupiter\'s moon Europa, investigating its habitability through detailed reconnaissance.',
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
      missionType: 'Planetary Exploration',
      status: 'Upcoming',
      tags: ['jupiter', 'europa', 'nasa'],
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
          explanation: 'There are 8 planets in our solar system.',
          points: 10,
        },
        {
          question: 'Which is the largest planet?',
          options: [
            { text: 'Earth', isCorrect: false },
            { text: 'Saturn', isCorrect: false },
            { text: 'Jupiter', isCorrect: true },
            { text: 'Neptune', isCorrect: false },
          ],
          explanation: 'Jupiter is the largest planet.',
          points: 10,
        },
        {
          question: 'Which planet is known as the Red Planet?',
          options: [
            { text: 'Venus', isCorrect: false },
            { text: 'Mars', isCorrect: true },
            { text: 'Jupiter', isCorrect: false },
            { text: 'Saturn', isCorrect: false },
          ],
          explanation: 'Mars appears red due to iron oxide.',
          points: 10,
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
  ];
  
  for (let i = 0; i < 5; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    posts.push({
      title: titles[Math.floor(Math.random() * titles.length)],
      content: 'This is a sample post content for testing purposes.',
      author: user._id,
      tags: ['astronomy', 'space'],
      category: 'Discussion',
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
    },
  ];
};

const seedDatabase = async () => {
  try {
    console.log('🌌 Starting database seeding...\n');

    // Connect to MongoDB
    const isConnected = await connectDB();
    if (!isConnected) {
      console.error('❌ Failed to connect to MongoDB. Please check if MongoDB is running.');
      process.exit(1);
    }

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
    const userData = generateUsers(5);
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
      createdBy: users[0]._id,
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

    console.log('📊 Seeding Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Missions: ${missions.length}`);
    console.log(`   - Quizzes: ${quizzes.length}`);
    console.log(`   - Posts: ${posts.length}`);
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
