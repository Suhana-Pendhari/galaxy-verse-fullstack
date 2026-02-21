const express = require('express');
const {
  getSatellites,
  getSatelliteById,
  getISSPosition,
  getSatellitePasses,
  getSatellitesInView,
  getSatelliteOrbit,
} = require('../controllers/satelliteController');

const router = express.Router();

router.get('/', getSatellites);
router.get('/iss', getISSPosition);
router.get('/passes', getSatellitePasses);
router.get('/in-view', getSatellitesInView);
router.get('/:id', getSatelliteById);
router.get('/:id/orbit', getSatelliteOrbit);

module.exports = router;
