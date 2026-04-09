const express = require('express');
const router = express.Router();
const {
  updateUserProfile, getUserBookings, cancelBooking, createReview, getAllUsers, toggleUserStatus
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route cho User
router.put('/profile', protect, updateUserProfile);
router.get('/my-bookings', protect, getUserBookings);
router.put('/cancel-booking/:id', protect, cancelBooking);
router.post('/reviews', protect, createReview);

// Route cho Admin
router.get('/', protect, admin, getAllUsers);
router.put('/toggle-status/:id', protect, admin, toggleUserStatus);

module.exports = router;