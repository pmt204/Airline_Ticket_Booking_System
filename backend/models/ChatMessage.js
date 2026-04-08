const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  senderRole: { type: String, enum: ['user', 'admin'], required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
