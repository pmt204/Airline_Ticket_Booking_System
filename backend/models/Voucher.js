const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, 
  discountType: { type: String, enum: ['Percentage', 'Fixed'], required: true }, 
  discountValue: { type: Number, required: true }, 
  minPurchaseValue: { type: Number, default: 0 }, 
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: 100 }, 
  usedCount: { type: Number, default: 0 }, 
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);