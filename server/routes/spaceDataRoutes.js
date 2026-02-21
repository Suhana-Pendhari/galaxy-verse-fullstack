const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getAPOD,
  getMarsRoverPhotos,
  getAsteroids,
  getAsteroidById,
  getEarthImagery,
  getEPIC,
  toggleFavorite,
  getFavorites,
  searchSpaceData,
} = require('../controllers/spaceDataController');

const router = express.Router();

// Public routes
router.get('/apod', getAPOD);
router.get('/mars-rover', getMarsRoverPhotos);
router.get('/asteroids', getAsteroids);
router.get('/asteroids/:id', getAsteroidById);
router.get('/earth', getEarthImagery);
router.get('/epic', getEPIC);
router.get('/search', searchSpaceData);

// Protected routes
router.use(protect);

router.get('/favorites', getFavorites);
router.post('/favorite', toggleFavorite);

module.exports = router;
