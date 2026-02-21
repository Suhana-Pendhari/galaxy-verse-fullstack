const axios = require('axios');
const User = require('../models/User');
const { getIO } = require('../config/socket');

// NASA API Base URL
const NASA_API_BASE = 'https://api.nasa.gov';
const API_KEY = process.env.NASA_API_KEY;

// @desc    Get Astronomy Picture of the Day
// @route   GET /api/space-data/apod
// @access  Public
exports.getAPOD = async (req, res) => {
  try {
    const { date, start_date, end_date, count, thumbs } = req.query;

    let url = `${NASA_API_BASE}/planetary/apod?api_key=${API_KEY}`;
    
    if (date) url += `&date=${date}`;
    if (start_date) url += `&start_date=${start_date}`;
    if (end_date) url += `&end_date=${end_date}`;
    if (count) url += `&count=${count}`;
    if (thumbs) url += `&thumbs=${thumbs}`;

    const response = await axios.get(url);

    // If user is logged in, check favorites
    let data = response.data;
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (Array.isArray(data)) {
        data = data.map(item => ({
          ...item,
          isFavorite: user.favorites.apod.includes(item.date),
        }));
      } else {
        data.isFavorite = user.favorites.apod.includes(data.date);
      }
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('APOD API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      success: false,
      message: 'Error fetching APOD data',
      error: error.response?.data,
    });
  }
};

// @desc    Get Mars Rover Photos
// @route   GET /api/space-data/mars-rover
// @access  Public
exports.getMarsRoverPhotos = async (req, res) => {
  try {
    const {
      rover = 'curiosity',
      sol,
      earth_date,
      camera,
      page = 1,
      per_page = 25,
    } = req.query;

    let url = `${NASA_API_BASE}/mars-photos/api/v1/rovers/${rover}/photos?api_key=${API_KEY}`;
    
    if (sol) url += `&sol=${sol}`;
    if (earth_date) url += `&earth_date=${earth_date}`;
    if (camera) url += `&camera=${camera}`;
    url += `&page=${page}`;

    const response = await axios.get(url);

    // Paginate results
    const photos = response.data.photos;
    const start = (page - 1) * per_page;
    const paginatedPhotos = photos.slice(start, start + parseInt(per_page));

    // If user is logged in, check favorites
    let processedPhotos = paginatedPhotos;
    if (req.user) {
      const user = await User.findById(req.user.id);
      processedPhotos = paginatedPhotos.map(photo => ({
        ...photo,
        isFavorite: user.favorites.roverImages.includes(photo.id.toString()),
      }));
    }

    res.json({
      success: true,
      data: processedPhotos,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: photos.length,
        total_pages: Math.ceil(photos.length / per_page),
      },
    });
  } catch (error) {
    console.error('Mars Rover API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      success: false,
      message: 'Error fetching Mars Rover photos',
      error: error.response?.data,
    });
  }
};

// @desc    Get Asteroid Data
// @route   GET /api/space-data/asteroids
// @access  Public
exports.getAsteroids = async (req, res) => {
  try {
    const { start_date, end_date, date, detailed = false } = req.query;

    let url;
    if (date) {
      // Get asteroids for specific date
      url = `${NASA_API_BASE}/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${API_KEY}`;
    } else if (start_date && end_date) {
      // Get asteroids for date range
      url = `${NASA_API_BASE}/neo/rest/v1/feed?start_date=${start_date}&end_date=${end_date}&api_key=${API_KEY}`;
    } else {
      // Get today's asteroids
      const today = new Date().toISOString().split('T')[0];
      url = `${NASA_API_BASE}/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`;
    }

    const response = await axios.get(url);

    let asteroids = [];
    // Parse NEO data
    if (response.data.near_earth_objects) {
      Object.values(response.data.near_earth_objects).forEach(dateAsteroids => {
        asteroids = [...asteroids, ...dateAsteroids];
      });
    }

    // Sort by close approach date
    asteroids.sort((a, b) => {
      const dateA = new Date(a.close_approach_data[0]?.close_approach_date);
      const dateB = new Date(b.close_approach_data[0]?.close_approach_date);
      return dateA - dateB;
    });

    // If user is logged in, check favorites
    if (req.user) {
      const user = await User.findById(req.user.id);
      asteroids = asteroids.map(asteroid => ({
        ...asteroid,
        isFavorite: user.favorites.asteroids.includes(asteroid.id),
      }));
    }

    // If detailed is false, return simplified data
    if (detailed !== 'true') {
      asteroids = asteroids.map(asteroid => ({
        id: asteroid.id,
        name: asteroid.name,
        nasa_jpl_url: asteroid.nasa_jpl_url,
        absolute_magnitude_h: asteroid.absolute_magnitude_h,
        estimated_diameter: asteroid.estimated_diameter,
        is_potentially_hazardous_asteroid: asteroid.is_potentially_hazardous_asteroid,
        close_approach_data: asteroid.close_approach_data?.map(data => ({
          close_approach_date: data.close_approach_date,
          relative_velocity: data.relative_velocity,
          miss_distance: data.miss_distance,
          orbiting_body: data.orbiting_body,
        })),
        isFavorite: asteroid.isFavorite,
      }));
    }

    res.json({
      success: true,
      data: asteroids,
      count: asteroids.length,
    });
  } catch (error) {
    console.error('Asteroid API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      success: false,
      message: 'Error fetching asteroid data',
      error: error.response?.data,
    });
  }
};

// @desc    Get single asteroid by ID
// @route   GET /api/space-data/asteroids/:id
// @access  Public
exports.getAsteroidById = async (req, res) => {
  try {
    const { id } = req.params;

    const url = `${NASA_API_BASE}/neo/rest/v1/neo/${id}?api_key=${API_KEY}`;
    const response = await axios.get(url);

    let asteroid = response.data;

    // If user is logged in, check favorite
    if (req.user) {
      const user = await User.findById(req.user.id);
      asteroid.isFavorite = user.favorites.asteroids.includes(asteroid.id);
    }

    res.json({
      success: true,
      data: asteroid,
    });
  } catch (error) {
    console.error('Asteroid detail API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      success: false,
      message: 'Error fetching asteroid details',
      error: error.response?.data,
    });
  }
};

// @desc    Get Earth imagery
// @route   GET /api/space-data/earth
// @access  Public
exports.getEarthImagery = async (req, res) => {
  try {
    const { lat, lon, date, dim } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false,
        message: 'Latitude and longitude are required' 
      });
    }

    let url = `${NASA_API_BASE}/planetary/earth/imagery?lon=${lon}&lat=${lat}&api_key=${API_KEY}`;
    
    if (date) url += `&date=${date}`;
    if (dim) url += `&dim=${dim}`;

    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');

    res.json({
      success: true,
      data: {
        image: `data:image/png;base64,${imageBase64}`,
        coordinates: { lat, lon },
        date: date || new Date().toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Earth imagery API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      success: false,
      message: 'Error fetching Earth imagery',
      error: error.response?.data,
    });
  }
};

// @desc    Get EPIC Earth images
// @route   GET /api/space-data/epic
// @access  Public
exports.getEPIC = async (req, res) => {
  try {
    const { date, type = 'natural' } = req.query;

    let url = `${NASA_API_BASE}/EPIC/api/${type}`;
    if (date) {
      url += `/date/${date}`;
    }
    url += `?api_key=${API_KEY}`;

    const response = await axios.get(url);

    const images = response.data.map(img => ({
      ...img,
      image_url: `https://epic.gsfc.nasa.gov/archive/${type}/${img.date.split(' ')[0].replace(/-/g, '/')}/png/${img.image}.png`,
      thumbnail_url: `https://epic.gsfc.nasa.gov/archive/${type}/${img.date.split(' ')[0].replace(/-/g, '/')}/thumbs/${img.image}.jpg`,
    }));

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('EPIC API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      success: false,
      message: 'Error fetching EPIC images',
      error: error.response?.data,
    });
  }
};

// @desc    Toggle favorite for space data
// @route   POST /api/space-data/favorite
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const { type, id, data } = req.body;

    if (!type || !id) {
      return res.status(400).json({ 
        success: false,
        message: 'Type and ID are required' 
      });
    }

    const user = await User.findById(req.user.id);
    const field = `favorites.${type}`;

    let isFavorite;
    switch (type) {
      case 'apod':
        isFavorite = user.favorites.apod.includes(id);
        if (isFavorite) {
          user.favorites.apod = user.favorites.apod.filter(item => item !== id);
        } else {
          user.favorites.apod.push(id);
        }
        break;
      case 'roverImages':
        isFavorite = user.favorites.roverImages.includes(id);
        if (isFavorite) {
          user.favorites.roverImages = user.favorites.roverImages.filter(item => item !== id);
        } else {
          user.favorites.roverImages.push(id);
        }
        break;
      case 'asteroids':
        isFavorite = user.favorites.asteroids.includes(id);
        if (isFavorite) {
          user.favorites.asteroids = user.favorites.asteroids.filter(item => item !== id);
        } else {
          user.favorites.asteroids.push(id);
        }
        break;
      default:
        return res.status(400).json({ 
          success: false,
          message: 'Invalid favorite type' 
        });
    }

    await user.save();

    // Emit socket event
    const io = getIO();
    io.to(`user-${user._id}`).emit('favorite-updated', {
      type,
      id,
      isFavorite: !isFavorite,
    });

    res.json({
      success: true,
      isFavorite: !isFavorite,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Get user's favorites
// @route   GET /api/space-data/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favorites');

    // Fetch actual data for favorites
    const favorites = {
      apod: [],
      roverImages: [],
      asteroids: [],
    };

    // Fetch APOD favorites
    if (user.favorites.apod.length > 0) {
      const apodPromises = user.favorites.apod.map(date => 
        axios.get(`${NASA_API_BASE}/planetary/apod?date=${date}&api_key=${API_KEY}`)
          .then(res => res.data)
          .catch(() => null)
      );
      favorites.apod = (await Promise.all(apodPromises)).filter(Boolean);
    }

    // Fetch asteroid favorites
    if (user.favorites.asteroids.length > 0) {
      const asteroidPromises = user.favorites.asteroids.map(id =>
        axios.get(`${NASA_API_BASE}/neo/rest/v1/neo/${id}?api_key=${API_KEY}`)
          .then(res => res.data)
          .catch(() => null)
      );
      favorites.asteroids = (await Promise.all(asteroidPromises)).filter(Boolean);
    }

    // Rover images are stored by ID but we don't have an API to fetch by ID
    // So we'll just return the IDs
    favorites.roverImages = user.favorites.roverImages;

    res.json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Search space data
// @route   GET /api/space-data/search
// @access  Public
exports.searchSpaceData = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q) {
      return res.status(400).json({ 
        success: false,
        message: 'Search query is required' 
      });
    }

    const results = {};

    // Search NASA Image and Video Library
    if (type === 'all' || type === 'images') {
      const imageUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image`;
      const imageResponse = await axios.get(imageUrl);
      results.images = imageResponse.data.collection.items.slice(0, 10);
    }

    // Search APOD
    if (type === 'all' || type === 'apod') {
      try {
        const apodUrl = `${NASA_API_BASE}/planetary/apod?api_key=${API_KEY}&count=10`;
        const apodResponse = await axios.get(apodUrl);
        results.apod = apodResponse.data.filter(item => 
          item.title.toLowerCase().includes(q.toLowerCase()) ||
          item.explanation.toLowerCase().includes(q.toLowerCase())
        );
      } catch (error) {
        console.error('APOD search error:', error);
      }
    }

    // Search Asteroids
    if (type === 'all' || type === 'asteroids') {
      try {
        // Get today's asteroids and filter by name
        const today = new Date().toISOString().split('T')[0];
        const asteroidUrl = `${NASA_API_BASE}/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`;
        const asteroidResponse = await axios.get(asteroidUrl);
        
        const asteroids = [];
        Object.values(asteroidResponse.data.near_earth_objects || {}).forEach(dateAsteroids => {
          asteroids.push(...dateAsteroids);
        });

        results.asteroids = asteroids.filter(asteroid =>
          asteroid.name.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 10);
      } catch (error) {
        console.error('Asteroid search error:', error);
      }
    }

    res.json({
      success: true,
      data: results,
      query: q,
    });
  } catch (error) {
    console.error('Search space data error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching space data',
      error: error.message,
    });
  }
};
