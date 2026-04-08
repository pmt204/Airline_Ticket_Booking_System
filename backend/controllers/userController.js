const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const bcrypt = require('bcryptjs');

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
      const updatedUser = await user.save();
      res.json({ _id: updatedUser._id, fullName: updatedUser.fullName, message: 'Cập nhật thành công!' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('flight', 'flightNumber departureTime arrivalTime')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy lịch sử đặt vé' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Không tìm thấy vé hợp lệ' });
    }
    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Vé này đã bị hủy từ trước' });
    }
    booking.bookingStatus = 'Cancelled';
    await booking.save();
    res.json({ message: 'Hủy vé thành công', booking });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi hủy vé' });
  }
};

const createReview = async (req, res) => {
  try {
    const { flightId, rating, comment } = req.body;
    const hasBooked = await Booking.findOne({ user: req.user._id, flight: flightId });
    if (!hasBooked) {
      return res.status(400).json({ message: 'Bạn phải đặt chuyến bay này mới được đánh giá' });
    }
    const review = await Review.create({ user: req.user._id, flight: flightId, rating: Number(rating), comment });
    res.status(201).json({ message: 'Đánh giá thành công', review });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi gửi đánh giá' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách user' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Không thể khóa Admin' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `Đã ${user.isActive ? 'mở khóa' : 'khóa'} tài khoản thành công` });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
};

module.exports = { updateUserProfile, getUserBookings, cancelBooking, createReview, getAllUsers, toggleUserStatus };