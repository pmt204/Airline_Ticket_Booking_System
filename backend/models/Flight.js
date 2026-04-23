const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  
  airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  departureAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  arrivalAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  
  basePrice: { type: Number, required: true },
  classMultipliers: {
    business: { type: Number, default: 2.0 },  
    premium: { type: Number, default: 1.3 },   
    economy: { type: Number, default: 1.0 }    
  },
  seatCapacity: { type: Number, required: true },
  
  bookedSeats: [{ type: String }],
  
  status: { type: String, enum: ['Scheduled', 'Delayed', 'Cancelled', 'Completed'], default: 'Scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightSchema);