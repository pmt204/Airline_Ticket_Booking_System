const mongoose = require('mongoose');

// 1. CẬP NHẬT LẠI HÀNH KHÁCH 
const passengerSchema = new mongoose.Schema({
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  
  outboundSeat: { type: String, default: '' }, 
  inboundSeat: { type: String, default: '' },  

  identityNumber: { type: String, default: '' }, 
  passengerType: { type: String, enum: ['Adult', 'Child', 'Infant'], default: 'Adult' },
  extraBaggage: { type: Number, default: 0 } 
});

// 2. CẬP NHẬT BOOKING 
const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true }, 
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, 
  
  outboundFlight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  inboundFlight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', default: null },
  
  appliedVoucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', default: null }, 
  passengers: [passengerSchema],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['VNPay', 'MoMo', 'CreditCard', 'PayLater'], default: 'VNPay' }, 
  paymentStatus: { type: String, enum: ['Unpaid', 'Pending', 'Paid', 'Failed', 'Refunded'], default: 'Unpaid' },
  bookingStatus: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' },
  isCheckedIn: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5, default: null }, 
  reviewComment: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);