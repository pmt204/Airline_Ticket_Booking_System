const express = require('express');
const router = express.Router();
const { createBooking, processPayment, getAllBookings, updateBookingStatus, getDashboardStats, getTicketDetails, confirmVNPayPayment, getMyBookings, onlineCheckin } = require('../controllers/bookingController');

// IMPORT MIDDLEWARE
const { protect, admin } = require('../middleware/authMiddleware');

// KHÁCH HÀNG (Cần đăng nhập)
router.post('/', protect, createBooking); 
router.post('/:id/pay', protect, processPayment); 
router.get('/:id/ticket', protect, getTicketDetails); 
router.post('/confirm', confirmVNPayPayment);
router.get('/my-bookings', protect, getMyBookings);
router.post('/checkin', onlineCheckin);

// ADMIN (Cần quyền Admin)
router.get('/', protect, admin, getAllBookings); 
router.get('/stats', protect, admin, getDashboardStats); 
router.put('/:id/status', protect, admin, updateBookingStatus); 

module.exports = router;