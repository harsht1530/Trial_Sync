const mongoose = require('mongoose');
const { piConn } = require('../../config/db');

const schema = new mongoose.Schema({
  patientId: { type: String, required: true },
  direction: { type: String, enum: ['Outbound', 'Inbound'], required: true },
  outcome: { type: String, enum: ['Completed', 'No Answer', 'Scheduled'], required: true },
  reminderName: { type: String },
  timestamp: { type: String, required: true },
  duration: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = piConn.model('CallLog', schema);
