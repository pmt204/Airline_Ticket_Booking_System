const express = require('express');
const router = express.Router();
const {
  createBooking, processPayment, getAllBookings, updateBookingStatus, getDashboardStats, getTicketDetails
} = require('../controllers/bookingController');

// Khách hàng
router.post('/', createBooking); // Chức năng 1
router.post('/:id/pay', processPayment); // Chức năng 2 & 6
router.get('/:id/ticket', getTicketDetails); // Chức năng 7

// Admin
router.get('/', getAllBookings); // Chức năng 3
router.get('/stats', getDashboardStats); // Chức năng 5
router.put('/:id/status', updateBookingStatus); // Chức năng 4

module.exports = router;