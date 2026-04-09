const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Airline = require('../models/Airline');
const Airport = require('../models/Airport');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const Voucher = require('../models/Voucher');
const router = express.Router();

router.get('/users', async (req, res) => {
  const data = await User.find().sort({ createdAt: -1 }).lean();
  res.json(data);
});

router.post('/users', async (req, res) => {
  const { fullName, email, role = 'user', password = '123456' } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const created = await User.create({ fullName, email, role, password: hashed });
  res.status(201).json(created);
});

router.put('/users/:id', async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(updated);
});

router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.get('/airlines', async (req, res) => {
  const data = await Airline.find().sort({ createdAt: -1 }).lean();
  res.json(data);
});

router.post('/airlines', async (req, res) => {
  const created = await Airline.create(req.body);
  res.status(201).json(created);
});

router.put('/airlines/:id', async (req, res) => {
  const updated = await Airline.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(updated);
});

router.delete('/airlines/:id', async (req, res) => {
  await Airline.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.get('/airports', async (req, res) => {
  const data = await Airport.find().sort({ createdAt: -1 }).lean();
  res.json(data);
});

router.post('/airports', async (req, res) => {
  const payload = { ...req.body, code: String(req.body.code || '').toUpperCase() };
  const created = await Airport.create(payload);
  res.status(201).json(created);
});

router.put('/airports/:id', async (req, res) => {
  const payload = { ...req.body };
  if (payload.code) payload.code = String(payload.code).toUpperCase();
  const updated = await Airport.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  res.json(updated);
});

router.delete('/airports/:id', async (req, res) => {
  await Airport.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.get('/flights', async (req, res) => {
  const data = await Flight.find()
    .populate('airline', 'name code')
    .populate('departureAirport', 'code name')
    .populate('arrivalAirport', 'code name')
    .sort({ departureTime: 1 })
    .lean();
  res.json(data);
});

router.post('/flights', async (req, res) => {
  const { airlineCode, departureAirportCode, arrivalAirportCode, ...rest } = req.body;
  const airline = await Airline.findOne({ code: String(airlineCode || '').toUpperCase() });
  const departureAirport = await Airport.findOne({ code: String(departureAirportCode || '').toUpperCase() });
  const arrivalAirport = await Airport.findOne({ code: String(arrivalAirportCode || '').toUpperCase() });

  if (!airline || !departureAirport || !arrivalAirport) {
    return res.status(400).json({ message: 'Khong tim thay airline/airport theo code.' });
  }

  const created = await Flight.create({
    ...rest,
    airline: airline._id,
    departureAirport: departureAirport._id,
    arrivalAirport: arrivalAirport._id,
  });
  const populated = await created.populate(['airline', 'departureAirport', 'arrivalAirport']);
  res.status(201).json(populated);
});

router.put('/flights/:id', async (req, res) => {
  const payload = { ...req.body };
  if (payload.airlineCode || payload.departureAirportCode || payload.arrivalAirportCode) {
    const airline = payload.airlineCode ? await Airline.findOne({ code: String(payload.airlineCode).toUpperCase() }) : null;
    const dep = payload.departureAirportCode ? await Airport.findOne({ code: String(payload.departureAirportCode).toUpperCase() }) : null;
    const arr = payload.arrivalAirportCode ? await Airport.findOne({ code: String(payload.arrivalAirportCode).toUpperCase() }) : null;
    if (payload.airlineCode && !airline) return res.status(400).json({ message: 'Khong tim thay airlineCode.' });
    if (payload.departureAirportCode && !dep) return res.status(400).json({ message: 'Khong tim thay departureAirportCode.' });
    if (payload.arrivalAirportCode && !arr) return res.status(400).json({ message: 'Khong tim thay arrivalAirportCode.' });
    if (airline) payload.airline = airline._id;
    if (dep) payload.departureAirport = dep._id;
    if (arr) payload.arrivalAirport = arr._id;
    delete payload.airlineCode;
    delete payload.departureAirportCode;
    delete payload.arrivalAirportCode;
  }
  const updated = await Flight.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    .populate('airline', 'name code')
    .populate('departureAirport', 'code name')
    .populate('arrivalAirport', 'code name');
  res.json(updated);
});

router.delete('/flights/:id', async (req, res) => {
  await Flight.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.get('/bookings', async (req, res) => {
  const data = await Booking.find()
    .populate('user', 'fullName email')
    .populate('flight', 'flightNumber')
    .populate('appliedVoucher', 'code')
    .sort({ createdAt: -1 })
    .lean();
  res.json(data);
});

router.post('/bookings', async (req, res) => {
  const { userEmail, flightNumber, voucherCode, ...rest } = req.body;
  const user = await User.findOne({ email: userEmail });
  const flight = await Flight.findOne({ flightNumber });
  const voucher = voucherCode ? await Voucher.findOne({ code: String(voucherCode).toUpperCase() }) : null;

  if (!user || !flight) {
    return res.status(400).json({ message: 'Khong tim thay userEmail hoac flightNumber.' });
  }

  const created = await Booking.create({
    ...rest,
    user: user._id,
    flight: flight._id,
    appliedVoucher: voucher ? voucher._id : null,
    passengers: rest.passengers || [],
  });

  const populated = await created.populate(['user', 'flight', 'appliedVoucher']);
  res.status(201).json(populated);
});

router.put('/bookings/:id', async (req, res) => {
  const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('user', 'fullName email')
    .populate('flight', 'flightNumber')
    .populate('appliedVoucher', 'code');
  res.json(updated);
});

router.delete('/bookings/:id', async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.get('/vouchers', async (req, res) => {
  const data = await Voucher.find().sort({ createdAt: -1 }).lean();
  res.json(data);
});

router.post('/vouchers', async (req, res) => {
  const payload = { ...req.body, code: String(req.body.code || '').toUpperCase() };
  const created = await Voucher.create(payload);
  res.status(201).json(created);
});

router.put('/vouchers/:id', async (req, res) => {
  const payload = { ...req.body };
  if (payload.code) payload.code = String(payload.code).toUpperCase();
  const updated = await Voucher.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  res.json(updated);
});

router.delete('/vouchers/:id', async (req, res) => {
  await Voucher.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.post('/vouchers/validate', async (req, res) => {
  const { code, amount = 0 } = req.body;
  const voucher = await Voucher.findOne({ code: String(code || '').toUpperCase(), isActive: true });
  if (!voucher) return res.status(404).json({ valid: false, message: 'Mã giảm giá không tồn tại.' });

  const now = new Date();
  if (now < voucher.validFrom || now > voucher.validUntil) {
    return res.status(400).json({ valid: false, message: 'Mã giảm giá đã hết hạn hoặc chưa tới ngày áp dụng.' });
  }
  if (voucher.usedCount >= voucher.usageLimit) {
    return res.status(400).json({ valid: false, message: 'Mã giảm giá đã hết lượt sử dụng.' });
  }
  if (Number(amount) < Number(voucher.minPurchaseValue || 0)) {
    return res.status(400).json({ valid: false, message: 'Đơn hàng chưa đạt giá trị tối thiểu.' });
  }

  const discount = voucher.discountType === 'Percentage'
    ? Math.round((Number(amount) * Number(voucher.discountValue)) / 100)
    : Number(voucher.discountValue);

  res.json({ valid: true, code: voucher.code, discount, finalAmount: Math.max(Number(amount) - discount, 0) });
});

module.exports = router;
