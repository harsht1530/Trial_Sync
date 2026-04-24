const mongoose = require('mongoose');
const { piConn } = require('../../config/db');

const chatMessageSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, default: 'text' },
  metadata: {
    severity: String,
    actionTaken: String,
    clinicalExtraction: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = piConn.model('ChatMessage', chatMessageSchema);
