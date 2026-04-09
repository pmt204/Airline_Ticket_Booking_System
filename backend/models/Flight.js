const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  
  // Tham chiếu (Relations)
  airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  departureAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  arrivalAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  
  // Thời gian
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  
  // Giá và Ghế
  basePrice: { type: Number, required: true },
  classMultipliers: {
    business: { type: Number, default: 2.0 },  // Thương gia mặc định x2
    premium: { type: Number, default: 1.3 },   // Đặc biệt mặc định x1.3
    economy: { type: Number, default: 1.0 }    // Phổ thông luôn là x1
  },
  seatCapacity: { type: Number, required: true },
  
  // Mảng lưu các mã ghế đã được đặt (Vd: ['1A', '1B', '12C']) để khóa ghế trên UI
  bookedSeats: [{ type: String }],
  
  status: { type: String, enum: ['Scheduled', 'Delayed', 'Cancelled', 'Completed'], default: 'Scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightSchema);