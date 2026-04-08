const mongoose = require('mongoose');

// Sub-schema (Schema con) cho Hành khách, được nhúng vào Booking
const passengerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  identityNumber: { type: String, required: true }, // CMND/CCCD/Passport
  passengerType: { type: String, enum: ['Adult', 'Child', 'Infant'], default: 'Adult' },
  seatNumber: { type: String }, // Ghế mà hành khách này chọn
  extraBaggage: { type: Number, default: 0 } // Hành lý mua thêm (kg)
});

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true }, // Mã đặt chỗ (Vd: PNR-8A9X)
  
  // Tham chiếu
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  appliedVoucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', default: null }, // Có thể null nếu không dùng mã
  
  // Nhúng danh sách hành khách
  passengers: [passengerSchema],
  
  // Tiền bạc & Trạng thái
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['VNPay', 'MoMo', 'CreditCard', 'PayLater'], default: 'PayLater' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  bookingStatus: { type: String, enum: ['Confirmed', 'Cancelled', 'Completed'], default: 'Confirmed' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);