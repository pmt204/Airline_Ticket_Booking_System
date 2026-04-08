const mongoose = require('mongoose');

const airlineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Vd: Vietnam Airlines
  code: { type: String, required: true, unique: true }, // Vd: VN
  logoUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Airline', airlineSchema);