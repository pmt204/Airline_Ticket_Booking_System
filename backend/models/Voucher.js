const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // Vd: SUMMER26
  discountType: { type: String, enum: ['Percentage', 'Fixed'], required: true }, // Giảm theo % hay số tiền cố định
  discountValue: { type: Number, required: true }, // Giá trị giảm (Vd: 10% hoặc 100.000đ)
  minPurchaseValue: { type: Number, default: 0 }, // Đơn hàng tối thiểu để áp dụng
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: 100 }, // Số lượng mã tối đa
  usedCount: { type: Number, default: 0 }, // Số lượng mã đã dùng
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);