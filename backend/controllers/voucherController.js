const Voucher = require('../models/Voucher');

const getAllVouchers = async (req, res) => {
  try { res.json(await Voucher.find().sort({ createdAt: -1 })); } 
  catch (error) { res.status(500).json({ message: 'Lỗi lấy voucher' }); }
};

const createVoucher = async (req, res) => {
  try { res.status(201).json(await Voucher.create(req.body)); } 
  catch (error) { res.status(400).json({ message: 'Lỗi tạo voucher', error: error.message }); }
};

const toggleVoucherStatus = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    voucher.isActive = !voucher.isActive;
    await voucher.save();
    res.json({ message: 'Đã cập nhật trạng thái voucher', voucher });
  } catch (error) { res.status(500).json({ message: 'Lỗi cập nhật' }); }
};

module.exports = { getAllVouchers, createVoucher, toggleVoucherStatus };