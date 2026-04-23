const express = require('express');
const router = express.Router();
const { getAirports, createAirport, getAirlines, createAirline, getAllFlights, createFlight, deleteFlight, updateFlightPricing, searchFlights, getFlightById, getSeatMap, toggleAirlineStatus, toggleAirportStatus, updateFlightPrice } = require('../controllers/flightController');

const { protect, admin } = require('../middleware/authMiddleware');

router.get('/search', searchFlights);
router.get('/airports', getAirports);
router.get('/airlines', getAirlines);
router.get('/:id', getFlightById);
router.get('/:id/seats', getSeatMap);

router.post('/airports', protect, admin, createAirport);
router.post('/airlines', protect, admin, createAirline);
router.get('/', protect, admin, getAllFlights);
router.post('/', protect, admin, createFlight);
router.delete('/:id', protect, admin, deleteFlight);
router.put('/:id/price', protect, admin, updateFlightPricing);
router.put('/airlines/:id/status', protect, admin, toggleAirlineStatus);
router.put('/airports/:id/status', protect, admin, toggleAirportStatus);
router.put('/:id/price', protect, admin, updateFlightPrice);

module.exports = router;