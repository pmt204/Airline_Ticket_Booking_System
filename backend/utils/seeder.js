require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { mockUsers, mockAirlines, mockAirports, mockFlights, mockVouchers } = require('./mockData');

// Import đủ 7 Models
const User = require('../models/User');
const Airline = require('../models/Airline');
const Airport = require('../models/Airport');
const Flight = require('../models/Flight');
const Voucher = require('../models/Voucher');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const importData = async () => {
  try {
    await connectDB();

    // 1. Xóa toàn bộ dữ liệu cũ ở tất cả các bảng
    await User.deleteMany();
    await Airline.deleteMany();
    await Airport.deleteMany();
    await Flight.deleteMany();
    await Voucher.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    console.log('🧹 Đã dọn dẹp Database cũ!');

    // 2. Insert Dữ liệu độc lập
    await User.insertMany(mockUsers);
    const createdAirlines = await Airline.insertMany(mockAirlines);
    const createdAirports = await Airport.insertMany(mockAirports);
    await Voucher.insertMany(mockVouchers);
    console.log('👤 Đã thêm Users, Sân bay, Hãng bay và Voucher!');

    // 3. Xử lý Chuyến bay (Map String Code thành Object ID)
    const formattedFlights = mockFlights.map(flight => {
      const airline = createdAirlines.find(a => a.code === flight.airlineCode);
      const depAirport = createdAirports.find(a => a.code === flight.departureAirportCode);
      const arrAirport = createdAirports.find(a => a.code === flight.arrivalAirportCode);
      
      return {
        flightNumber: flight.flightNumber,
        airline: airline._id,
        departureAirport: depAirport._id,
        arrivalAirport: arrAirport._id,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        basePrice: flight.basePrice,
        seatCapacity: flight.seatCapacity,
        availableSeats: flight.seatCapacity, // Ban đầu số ghế trống = tổng số ghế
        bookedSeats: flight.bookedSeats,
        status: flight.status
      };
    });

    await Flight.insertMany(formattedFlights);
    console.log('✈️ Đã thêm Chuyến bay thành công!');

    console.log('🎉 HOÀN TẤT SEED DỮ LIỆU! Có thể bắt đầu test API.');
    await disconnectDB(); // Ngắt kết nối cho code chạy xong thoát sạch sẽ
    process.exit();
  } catch (error) {
    console.error('❌ Lỗi Seeder:', error);
    process.exit(1);
  }
};

importData();