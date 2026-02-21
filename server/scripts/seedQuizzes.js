const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const quizzes = [
  // Astronomy Basics
  {
    title: 'Astronomy 101',
    description: 'Test your knowledge of basic astronomy concepts and celestial objects.',
    category: 'Astronomy',
    difficulty: 'easy',
    timeLimit: 15,
    passingScore: 60,
    questions: [
      {
        question: 'What is a light-year?',
        options: [
          { text: 'The time it takes light to travel from the Sun to Earth', isCorrect: false },
          { text: 'The distance light travels in one year', isCorrect: true },
          { text: 'The brightness of a star', isCorrect: false },
          { text: 'The age of a galaxy', isCorrect: false },
        ],
        explanation: 'A light-year is the distance light travels in one year, about 9.46 trillion kilometers.',
        points: 10,
        difficulty: 'easy',
      },
      {
        question: 'Which of these is not a type of galaxy?',
        options: [
          { text: 'Spiral', isCorrect: false },
          { text: 'Elliptical', isCorrect: false },
          { text: 'Circular', isCorrect: true },
          { text: 'Irregular', isCorrect: false },
        ],
        explanation: 'Galaxies come in spiral, elliptical, and irregular shapes. "Circular" is not a galaxy classification.',
        points: 10,
        difficulty: 'easy',
      },
      {
        question: 'What is the closest star to Earth?',
        options: [
          { text: 'Alpha Centauri', isCorrect: false },
          { text: 'Proxima Centauri', isCorrect: false },
          { text: 'The Sun', isCorrect: true },
          { text: 'Barnard\'s Star', isCorrect: false },
        ],
        explanation: 'The Sun is the closest star to Earth at about 150 million kilometers away.',
        points: 10,
        difficulty: 'easy',
      },
      {
        question: 'What causes the phases of the Moon?',
        options: [
          { text: 'Earth\'s shadow on the Moon', isCorrect: false },
          { text: 'The Moon\'s changing position relative to Earth and Sun', isCorrect: true },
          { text: 'Clouds in Earth\'s atmosphere', isCorrect: false },
          { text: 'The Moon\'s rotation', isCorrect: false },
        ],
        explanation: 'Moon phases are caused by the changing angles of the Sun, Earth, and Moon.',
        points: 10,
        difficulty: 'easy',
      },
      {
        question: 'What is a nebula?',
        options: [
          { text: 'A cloud of gas and dust in space', isCorrect: true },
          { text: 'A type of star', isCorrect: false },
          { text: 'A small galaxy', isCorrect: false },
          { text: 'A comet', isCorrect: false },
        ],
        explanation: 'A nebula is an interstellar cloud of dust, hydrogen, helium, and other ionized gases.',
        points: 10,
        difficulty: 'easy',
      },
    ],
  },

  // Stars and Galaxies
  {
    title: 'Stars & Galaxies',
    description: 'Explore the fascinating world of stars, galaxies, and stellar evolution.',
    category: 'Stars & Galaxies',
    difficulty: 'medium',
    timeLimit: 20,
    passingScore: 70,
    questions: [
      {
        question: 'What is the life cycle of a star like our Sun?',
        options: [
          { text: 'Main sequence → Red giant → White dwarf', isCorrect: true },
          { text: 'Main sequence → Supernova → Black hole', isCorrect: false },
          { text: 'Protostar → Red dwarf → Black dwarf', isCorrect: false },
          { text: 'Blue giant → Neutron star → Pulsar', isCorrect: false },
        ],
        explanation: 'Stars like our Sun become red giants after main sequence, then end as white dwarfs.',
        points: 15,
        difficulty: 'medium',
      },
      {
        question: 'What is the Milky Way?',
        options: [
          { text: 'A band of asteroids', isCorrect: false },
          { text: 'Our home galaxy', isCorrect: true },
          { text: 'A nearby nebula', isCorrect: false },
          { text: 'A star cluster', isCorrect: false },
        ],
        explanation: 'The Milky Way is the galaxy that contains our Solar System.',
        points: 10,
        difficulty: 'easy',
      },
      {
        question: 'What type of galaxy is the Milky Way?',
        options: [
          { text: 'Elliptical', isCorrect: false },
          { text: 'Irregular', isCorrect: false },
          { text: 'Spiral', isCorrect: true },
          { text: 'Lenticular', isCorrect: false },
        ],
        explanation: 'The Milky Way is a barred spiral galaxy with a diameter of about 100,000 light-years.',
        points: 10,
        difficulty: 'medium',
      },
      {
        question: 'What is a supernova?',
        options: [
          { text: 'The birth of a new star', isCorrect: false },
          { text: 'A collision of galaxies', isCorrect: false },
          { text: 'A massive star explosion', isCorrect: true },
          { text: 'A type of black hole', isCorrect: false },
        ],
        explanation: 'A supernova is a powerful stellar explosion that occurs at the end of a massive star\'s life.',
        points: 15,
        difficulty: 'medium',
      },
      {
        question: 'What remains after a supernova of a very massive star?',
        options: [
          { text: 'White dwarf', isCorrect: false },
          { text: 'Neutron star', isCorrect: false },
          { text: 'Black hole', isCorrect: true },
          { text: 'Red dwarf', isCorrect: false },
        ],
        explanation: 'Very massive stars (over 20 solar masses) collapse into black holes after supernova.',
        points: 15,
        difficulty: 'hard',
      },
    ],
  },

  // Astronauts and Human Spaceflight
  {
    title: 'Astronauts & Human Spaceflight',
    description: 'Test your knowledge about the brave men and women who venture into space.',
    category: 'Astronauts',
    difficulty: 'medium',
    timeLimit: 15,
    passingScore: 65,
    questions: [
      {
        question: 'Who was the first human in space?',
        options: [
          { text: 'Neil Armstrong', isCorrect: false },
          { text: 'Yuri Gagarin', isCorrect: true },
          { text: 'Alan Shepard', isCorrect: false },
          { text: 'John Glenn', isCorrect: false },
        ],
        explanation: 'Yuri Gagarin of the Soviet Union became the first human in space on April 12, 1961.',
        points: 10,
        difficulty: 'easy',
      },
      {
        question: 'Who was the first woman in space?',
        options: [
          { text: 'Sally Ride', isCorrect: false },
          { text: 'Valentina Tereshkova', isCorrect: true },
          { text: 'Mae Jemison', isCorrect: false },
          { text: 'Eileen Collins', isCorrect: false },
        ],
        explanation: 'Valentina Tereshkova flew on Vostok 6 in 1963, becoming the first woman in space.',
        points: 10,
        difficulty: 'medium',
      },
      {
        question: 'How many people have walked on the Moon?',
        options: [
          { text: '8', isCorrect: false },
          { text: '10', isCorrect: false },
          { text: '12', isCorrect: true },
          { text: '14', isCorrect: false },
        ],
        explanation: '12 NASA astronauts walked on the Moon between 1969 and 1972.',
        points: 15,
        difficulty: 'medium',
      },
      {
        question: 'Who was the first American in space?',
        options: [
          { text: 'Neil Armstrong', isCorrect: false },
          { text: 'Alan Shepard', isCorrect: true },
          { text: 'John Glenn', isCorrect: false },
          { text: 'Gus Grissom', isCorrect: false },
        ],
        explanation: 'Alan Shepard flew on Freedom 7 in 1961, becoming the first American in space.',
        points: 10,
        difficulty: 'medium',
      },
      {
        question: 'What was the name of the first Space Shuttle?',
        options: [
          { text: 'Atlantis', isCorrect: false },
          { text: 'Discovery', isCorrect: false },
          { text: 'Columbia', isCorrect: true },
          { text: 'Endeavour', isCorrect: false },
        ],
        explanation: 'Space Shuttle Columbia made its first flight on April 12, 1981.',
        points: 10,
        difficulty: 'medium',
      },
    ],
  },

  // Space Technology
  {
    title: 'Space Technology',
    description: 'Questions about rockets, spacecraft, and space exploration technology.',
    category: 'Space Technology',
    difficulty: 'hard',
    timeLimit: 25,
    passingScore: 75,
    questions: [
      {
        question: 'What type of rocket engine is used in the Space Shuttle Main Engines?',
        options: [
          { text: 'Solid rocket', isCorrect: false },
          { text: 'Liquid hydrogen/oxygen', isCorrect: true },
          { text: 'Ion thruster', isCorrect: false },
          { text: 'Nuclear thermal', isCorrect: false },
        ],
        explanation: 'SSMEs used liquid hydrogen and liquid oxygen in a staged combustion cycle.',
        points: 15,
        difficulty: 'hard',
      },
      {
        question: 'What is the principle that allows rockets to work in space?',
        options: [
          { text: 'Bernoulli\'s principle', isCorrect: false },
          { text: 'Newton\'s Third Law', isCorrect: true },
          { text: 'Archimedes\' principle', isCorrect: false },
          { text: 'Pascal\'s law', isCorrect: false },
        ],
        explanation: 'Rockets work by expelling mass in one direction to move in the opposite direction (Newton\'s Third Law).',
        points: 10,
        difficulty: 'medium',
      },
      {
        question: 'What is the function of a heat shield on a spacecraft?',
        options: [
          { text: 'Protect from solar radiation', isCorrect: false },
          { text: 'Insulate from cold', isCorrect: false },
          { text: 'Protect during atmospheric reentry', isCorrect: true },
          { text: 'Reflect sunlight', isCorrect: false },
        ],
        explanation: 'Heat shields protect spacecraft from extreme temperatures during atmospheric reentry.',
        points: 10,
        difficulty: 'medium',
      },
      {
        question: 'What type of orbit is used by geostationary satellites?',
        options: [
          { text: 'LEO (Low Earth Orbit)', isCorrect: false },
          { text: 'MEO (Medium Earth Orbit)', isCorrect: false },
          { text: 'GEO (Geostationary Orbit)', isCorrect: true },
          { text: 'HEO (Highly Elliptical Orbit)', isCorrect: false },
        ],
        explanation: 'Geostationary orbit at 35,786 km allows satellites to remain fixed over one point on Earth.',
        points: 15,
        difficulty: 'hard',
      },
      {
        question: 'What is the specific impulse (Isp) a measure of?',
        options: [
          { text: 'Rocket thrust', isCorrect: false },
          { text: 'Rocket efficiency', isCorrect: true },
          { text: 'Rocket weight', isCorrect: false },
          { text: 'Rocket speed', isCorrect: false },
        ],
        explanation: 'Specific impulse measures how efficiently a rocket engine uses its propellant.',
        points: 20,
        difficulty: 'hard',
      },
    ],
  },

  // General Space Knowledge - Hard
  {
    title: 'Ultimate Space Challenge',
    description: 'The hardest space quiz for true space enthusiasts.',
    category: 'General Space',
    difficulty: 'hard',
    timeLimit: 30,
    passingScore: 80,
    questions: [
      {
        question: 'What is the temperature of the cosmic microwave background radiation?',
        options: [
          { text: '2.7 Kelvin', isCorrect: true },
          { text: '27 Kelvin', isCorrect: false },
          { text: '270 Kelvin', isCorrect: false },
          { text: '0 Kelvin', isCorrect: false },
        ],
        explanation: 'The CMB has a temperature of 2.72548 ± 0.00057 K, a relic of the Big Bang.',
        points: 20,
        difficulty: 'hard',
      },
      {
        question: 'What is the most distant object visible to the naked eye?',
        options: [
          { text: 'Andromeda Galaxy', isCorrect: true },
          { text: 'Triangulum Galaxy', isCorrect: false },
          { text: 'Large Magellanic Cloud', isCorrect: false },
          { text: 'Whirlpool Galaxy', isCorrect: false },
        ],
        explanation: 'The Andromeda Galaxy is 2.5 million light-years away and visible to the naked eye.',
        points: 15,
        difficulty: 'hard',
      },
      {
        question: 'What is the estimated age of the universe?',
        options: [
          { text: '10.3 billion years', isCorrect: false },
          { text: '13.8 billion years', isCorrect: true },
          { text: '15.2 billion years', isCorrect: false },
          { text: '20.1 billion years', isCorrect: false },
        ],
        explanation: 'The universe is approximately 13.8 billion years old based on Planck mission data.',
        points: 15,
        difficulty: 'medium',
      },
      {
        question: 'What is the name of the boundary where the solar wind meets the interstellar medium?',
        options: [
          { text: 'Magnetopause', isCorrect: false },
          { text: 'Heliopause', isCorrect: true },
          { text: 'Termination shock', isCorrect: false },
          { text: 'Bow shock', isCorrect: false },
        ],
        explanation: 'The heliopause is the boundary where the Sun\'s solar wind is stopped by the interstellar medium.',
        points: 20,
        difficulty: 'hard',
      },
      {
        question: 'What element is formed by the fusion of two helium nuclei?',
        options: [
          { text: 'Lithium', isCorrect: false },
          { text: 'Beryllium', isCorrect: true },
          { text: 'Boron', isCorrect: false },
          { text: 'Carbon', isCorrect: false },
        ],
        explanation: 'Two helium-4 nuclei fuse to form beryllium-8 in the triple-alpha process.',
        points: 20,
        difficulty: 'hard',
      },
    ],
  },
];

const seedQuizzes = async () => {
  try {
    console.log('🎯 Starting quiz seeding...\n');

    // Find admin user
    console.log('Looking for admin user...');
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ No admin user found. Please run seedData.js first.');
      process.exit(1);
    }
    console.log(`✅ Found admin user: ${admin.username}\n`);

    // Clear existing quizzes
    console.log('Clearing existing quizzes...');
    await Quiz.deleteMany({});
    console.log('✅ Existing quizzes cleared\n');

    // Create new quizzes
    console.log('Creating new quizzes...');
    const quizzesWithAuthor = quizzes.map(quiz => ({
      ...quiz,
      createdBy: admin._id,
    }));
    
    const createdQuizzes = await Quiz.create(quizzesWithAuthor);
    console.log(`✅ Created ${createdQuizzes.length} quizzes\n`);

    console.log('📊 Quiz summary:');
    createdQuizzes.forEach(quiz => {
      console.log(`   - ${quiz.title} (${quiz.difficulty}): ${quiz.questions.length} questions`);
    });

    console.log('\n📊 Quizzes by difficulty:');
    const difficultyCounts = {};
    createdQuizzes.forEach(quiz => {
      difficultyCounts[quiz.difficulty] = (difficultyCounts[quiz.difficulty] || 0) + 1;
    });
    
    Object.entries(difficultyCounts).forEach(([difficulty, count]) => {
      console.log(`   - ${difficulty}: ${count}`);
    });

    console.log('\n📊 Quizzes by category:');
    const categoryCounts = {};
    createdQuizzes.forEach(quiz => {
      categoryCounts[quiz.category] = (categoryCounts[quiz.category] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count}`);
    });

    console.log('\n✅ Quiz seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding quizzes:', error);
    process.exit(1);
  }
};

seedQuizzes();
