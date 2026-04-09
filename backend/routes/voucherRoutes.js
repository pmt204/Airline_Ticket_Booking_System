const express = require('express');
const router = express.Router();
const { getAllVouchers, createVoucher, toggleVoucherStatus } = require('../controllers/voucherController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAllVouchers); 
router.post('/', protect, admin, createVoucher);
router.put('/:id/status', protect, admin, toggleVoucherStatus);

module.exports = router;