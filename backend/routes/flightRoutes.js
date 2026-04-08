const express = require('express');
const router = express.Router();
const {
  getAirports, createAirport,
  getAirlines, createAirline,
  getAllFlights, createFlight, deleteFlight, updateFlightPricing,
  searchFlights, getFlightById, getSeatMap
} = require('../controllers/flightController');

// -------------------------
// PUBLIC ROUTES
// -------------------------
router.get('/search', searchFlights);
router.get('/airports', getAirports);
router.get('/airlines', getAirlines);
router.get('/:id', getFlightById);
router.get('/:id/seats', getSeatMap);

// -------------------------
// ADMIN ROUTES 
// -------------------------
router.post('/airports', createAirport);
router.post('/airlines', createAirline);
router.get('/', getAllFlights);       
router.post('/', createFlight);
router.delete('/:id', deleteFlight);
router.put('/:id/price', updateFlightPricing);

module.exports = router;