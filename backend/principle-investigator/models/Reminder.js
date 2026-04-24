const mongoose = require('mongoose');
const { piConn } = require('../../config/db');

const schema = new mongoose.Schema({
  patientId: { type: String, required: true },
  name: { type: String, required: true },
  message: { type: String, required: true },
  scheduledTime: { type: String, required: true },
  frequency: { type: String, enum: ['Daily', 'Weekly', 'One-time', 'After visits'], required: true },
  channel: { type: String, enum: ['CALL', 'SMS', 'All channels'], required: true },
  status: { type: String, enum: ['Active', 'Paused'], default: 'Active' },
  nextTrigger: { type: String }
}, { timestamps: true });

module.exports = piConn.model('Reminder', schema);
