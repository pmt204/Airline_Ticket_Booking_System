const express = require('express');
const router = express.Router();

const { 
  createBooking, 
  confirmVNPayPayment, 
  getAllBookings, 
  updateBookingStatus, 
  getDashboardStats, 
  getTicketDetails, 
  getMyBookings, 
  onlineCheckin,
  cancelBooking,
  submitReview
} = require('../controllers/bookingController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', createBooking);                      
router.post('/confirm', confirmVNPayPayment);         
router.post('/checkin', onlineCheckin);               

router.get('/dashboard', getDashboardStats);          
router.get('/all', getAllBookings);                   

router.get('/my-bookings', protect, getMyBookings);   

router.get('/:id', getTicketDetails);                 
router.put('/:id/status', updateBookingStatus);  

router.put('/:id/cancel', cancelBooking);

router.put('/:id/review', protect, submitReview);

module.exports = router;