const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  patientId: { type: String, required: true },
  direction: { type: String, enum: ['Outbound', 'Inbound'], required: true },
  outcome: { type: String, enum: ['Completed', 'No Answer', 'Scheduled'], required: true },
  reminderName: { type: String },
  timestamp: { type: String, required: true },
  duration: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CallLog', schema);
