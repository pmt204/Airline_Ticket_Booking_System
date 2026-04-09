const mongoose = require('mongoose');

// ==========================================
// 1. SCHEMA HÀNH KHÁCH (Đã đồng bộ với React Form)
// ==========================================
const passengerSchema = new mongoose.Schema({
  lastName: { type: String, required: true },   // Khớp với frontend
  firstName: { type: String, required: true },  // Khớp với frontend
  email: { type: String, required: true },      // Để gửi E-Ticket
  phone: { type: String, required: true },
  
  // Các trường mở rộng (Không bắt buộc, dành cho nâng cấp sau này)
  identityNumber: { type: String, default: '' }, 
  passengerType: { type: String, enum: ['Adult', 'Child', 'Infant'], default: 'Adult' },
  seatNumber: { type: String, default: '' }, 
  extraBaggage: { type: Number, default: 0 } 
});

// ==========================================
// 2. SCHEMA ĐƠN ĐẶT VÉ (BOOKING)
// ==========================================
const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true }, // Vd: VN-8A9X
  
  // Tham chiếu
  // LƯU Ý: Bỏ required: true ở user để Khách vãng lai (Guest) có thể mua vé
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, 
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  appliedVoucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', default: null }, 
  
  // Nhúng danh sách hành khách
  passengers: [passengerSchema],
  
  // Tiền bạc & Trạng thái (Đã bổ sung Pending và Unpaid)
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['VNPay', 'MoMo', 'CreditCard', 'PayLater'], default: 'VNPay' }, // Đổi mặc định sang VNPay
  
  // Thêm 'Unpaid' vào danh sách và làm mặc định
  paymentStatus: { type: String, enum: ['Unpaid', 'Pending', 'Paid', 'Failed', 'Refunded'], default: 'Unpaid' },
  
  // Thêm 'Pending' vào danh sách và làm mặc định
  bookingStatus: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' },

  isCheckedIn: { type: Boolean, default: false }
  
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);