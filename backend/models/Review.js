const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, 
  comment: { type: String, required: true },
  isApproved: { type: Boolean, default: true } 
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);