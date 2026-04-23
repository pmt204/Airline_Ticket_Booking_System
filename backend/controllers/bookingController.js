const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User'); 
const nodemailer = require('nodemailer');

const sendETicketEmail = async (passengerEmail, booking) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const inboundHtml = booking.inboundFlight ? `
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 10px 0;">
        <p style="color: #2b6cb0; font-weight: bold; margin-bottom: 5px;">🛬 CHUYẾN VỀ</p>
        <p><strong>Chuyến bay:</strong> ${booking.inboundFlight.flightNumber}</p>
        <p><strong>Ngày giờ:</strong> ${new Date(booking.inboundFlight.departureTime).toLocaleString('vi-VN')}</p>
      </div>
    ` : '';

    const mailOptions = {
      from: '"VIETTICKET" <' + process.env.EMAIL_USER + '>', 
      to: passengerEmail,
      subject: `✈️ VIETTICKET - Xác nhận đặt vé thành công (Mã: ${booking.bookingCode})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #e53e3e; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-style: italic;">VIETTICKET</h1>
            <p style="margin: 5px 0 0;">Vé Điện Tử (E-Ticket)</p>
          </div>
          <div style="padding: 20px;">
            <h2 style="color: #2b6cb0;">Cảm ơn bạn đã sử dụng dịch vụ!</h2>
            <p>Mã đặt chỗ (PNR) của bạn là: <strong style="color: #e53e3e; font-size: 20px;">${booking.bookingCode}</strong></p>
            
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #2b6cb0; font-weight: bold; margin-bottom: 5px;">🛫 CHUYẾN ĐI</p>
              <p><strong>Chuyến bay:</strong> ${booking.outboundFlight.flightNumber}</p>
              <p><strong>Ngày giờ:</strong> ${new Date(booking.outboundFlight.departureTime).toLocaleString('vi-VN')}</p>
            </div>
            
            ${inboundHtml}
            
            <p><strong>Tổng Tiền:</strong> ${booking.totalAmount.toLocaleString()} VNĐ</p>
            <p>Vui lòng có mặt tại sân bay trước 120 phút để làm thủ tục. Chúc bạn một chuyến bay tốt đẹp!</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) { console.error('Lỗi khi gửi Email:', error); }
};

const createBooking = async (req, res) => {
  try {
    const { outboundFlightId, inboundFlightId, userId, passengers, totalAmount } = req.body;

    const outFlight = await Flight.findById(outboundFlightId);
    if (!outFlight) return res.status(404).json({ message: 'Không tìm thấy chuyến đi' });
    passengers.forEach(p => { if(p.outboundSeat) outFlight.bookedSeats.push(p.outboundSeat); });
    outFlight.availableSeats -= passengers.length;
    await outFlight.save();

    if (inboundFlightId) {
      const inFlight = await Flight.findById(inboundFlightId);
      if (!inFlight) return res.status(404).json({ message: 'Không tìm thấy chuyến về' });
      passengers.forEach(p => { if(p.inboundSeat) inFlight.bookedSeats.push(p.inboundSeat); });
      inFlight.availableSeats -= passengers.length;
      await inFlight.save();
    }

    const bookingCode = 'VN-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const booking = await Booking.create({
      user: userId || null, 
      outboundFlight: outboundFlightId,
      inboundFlight: inboundFlightId || null,
      bookingCode, passengers, totalAmount,
      bookingStatus: 'Pending', paymentStatus: 'Unpaid'
    });

    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ message: 'Lỗi khi đặt vé' }); }
};

const confirmVNPayPayment = async (req, res) => {
  try {
    const { bookingCode } = req.body;
    const booking = await Booking.findOne({ bookingCode })
      .populate('outboundFlight')
      .populate('inboundFlight');
      
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    booking.paymentStatus = 'Paid';
    booking.bookingStatus = 'Confirmed';
    await booking.save();

    const passengerEmail = booking.passengers[0]?.email;
    if (passengerEmail) await sendETicketEmail(passengerEmail, booking);

    res.json({ message: 'Cập nhật thành công!', booking });
  } catch (err) { res.status(500).json({ message: 'Lỗi xác nhận thanh toán' }); }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('outboundFlight', 'flightNumber departureTime arrivalTime')
      .populate('inboundFlight', 'flightNumber departureTime arrivalTime')
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: 'Lỗi lấy danh sách vé' }); }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body; 
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy vé' });
    booking.bookingStatus = status;
    await booking.save();
    res.json({ message: 'Cập nhật trạng thái thành công', booking });
  } catch (err) { res.status(500).json({ message: 'Lỗi cập nhật' }); }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalFlights = await Flight.countDocuments();
    const totalUsers = await User.countDocuments(); 
    
    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    res.json({ totalBookings, totalFlights, totalUsers, revenue });
  } catch (err) { res.json({ totalBookings: 0, totalFlights: 0, totalUsers: 0, revenue: 0 }); }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: 'outboundFlight', populate: [{ path: 'airline' }, { path: 'departureAirport' }, { path: 'arrivalAirport' }] })
      .populate({ path: 'inboundFlight', populate: [{ path: 'airline' }, { path: 'departureAirport' }, { path: 'arrivalAirport' }] })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: 'Lỗi lấy chuyến bay cá nhân' }); }
};

const getTicketDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'outboundFlight', populate: [{ path: 'airline' }, { path: 'departureAirport' }, { path: 'arrivalAirport' }] })
      .populate({ path: 'inboundFlight', populate: [{ path: 'airline' }, { path: 'departureAirport' }, { path: 'arrivalAirport' }] });
    res.json(booking);
  } catch (err) { res.status(500).json({ message: 'Lỗi lấy E-Ticket' }); }
};

const onlineCheckin = async (req, res) => {
  try {
    const { bookingCode, lastName } = req.body;
    const booking = await Booking.findOne({ bookingCode: bookingCode.toUpperCase() })
      .populate({ path: 'outboundFlight', populate: [{ path: 'airline' }, { path: 'departureAirport' }, { path: 'arrivalAirport' }] })
      .populate({ path: 'inboundFlight', populate: [{ path: 'airline' }, { path: 'departureAirport' }, { path: 'arrivalAirport' }] });

    if (!booking) return res.status(404).json({ message: 'Không tìm thấy Mã đặt chỗ.' });
    if (booking.bookingStatus !== 'Confirmed') return res.status(400).json({ message: 'Vé chưa thanh toán hoặc đã hủy!' });
    
    const isValidPassenger = booking.passengers.some(p => p.lastName.trim().toUpperCase() === lastName.trim().toUpperCase());
    if (!isValidPassenger) return res.status(400).json({ message: 'Họ hành khách không khớp.' });

    if (!booking.isCheckedIn) {
      booking.isCheckedIn = true;
      await booking.save();
    }
    res.json({ message: 'Làm thủ tục thành công!', boardingPass: booking });
  } catch (err) { res.status(500).json({ message: 'Lỗi hệ thống khi check-in.' }); }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('outboundFlight')
      .populate('inboundFlight');

    if (!booking) return res.status(404).json({ message: 'Không tìm thấy vé' });

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Vé này đã được hủy từ trước.' });
    }
    if (booking.isCheckedIn) {
      return res.status(400).json({ message: 'Không thể hủy vé vì hành khách đã làm thủ tục (Check-in).' });
    }

    const timeToDeparture = new Date(booking.outboundFlight.departureTime).getTime() - new Date().getTime();
    const hoursToDeparture = timeToDeparture / (1000 * 60 * 60);
    
    if (hoursToDeparture < 24) {
      return res.status(400).json({ message: 'Chỉ được phép hủy vé trước giờ khởi hành ít nhất 24 tiếng.' });
    }

    const outFlight = await Flight.findById(booking.outboundFlight._id);
    const outSeatsToRelease = booking.passengers.map(p => p.outboundSeat).filter(Boolean);
    
    outFlight.bookedSeats = outFlight.bookedSeats.filter(seat => !outSeatsToRelease.includes(seat));
    outFlight.availableSeats += outSeatsToRelease.length;
    await outFlight.save();

    if (booking.inboundFlight) {
      const inFlight = await Flight.findById(booking.inboundFlight._id);
      const inSeatsToRelease = booking.passengers.map(p => p.inboundSeat).filter(Boolean);
      
      inFlight.bookedSeats = inFlight.bookedSeats.filter(seat => !inSeatsToRelease.includes(seat));
      inFlight.availableSeats += inSeatsToRelease.length;
      await inFlight.save();
    }

    booking.bookingStatus = 'Cancelled';
    if (booking.paymentStatus === 'Paid') {
      booking.paymentStatus = 'Refunded'; 
    }
    
    await booking.save();

    res.json({ message: 'Hủy vé thành công. Hệ thống đang tiến hành hoàn tiền (nếu có).', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi hệ thống khi hủy vé.' });
  }
};

const submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Không tìm thấy vé' });
    
    if (booking.bookingStatus !== 'Completed') {
      return res.status(400).json({ message: 'Bạn chỉ có thể đánh giá sau khi chuyến bay hoàn tất.' });
    }

    booking.rating = rating;
    booking.reviewComment = comment;
    await booking.save();

    res.json({ message: 'Cảm ơn bạn đã gửi đánh giá!', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi gửi đánh giá.' });
  }
};

module.exports = {
  createBooking, confirmVNPayPayment, getAllBookings, updateBookingStatus, getDashboardStats, getTicketDetails, getMyBookings, onlineCheckin, cancelBooking, submitReview
};