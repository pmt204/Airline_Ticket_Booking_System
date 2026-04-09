const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // Vd: SGN, HAN
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Airport', airportSchema);