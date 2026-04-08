const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, // Chấm điểm từ 1 đến 5 sao
  comment: { type: String, required: true },
  isApproved: { type: Boolean, default: true } // Admin có thể ẩn bình luận nếu vi phạm
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);