const mongoose = require('mongoose');
const { piConn } = require('../../config/db');

const schema = new mongoose.Schema({
  id: { type: String, required: true },
  patientId: String,
  patientName: String,
  dataType: String,
  field: String,
  originalValue: String,
  flaggedValue: String,
  issue: String,
  severity: { type: String, enum: ['critical', 'warning', 'info'] },
  status: { type: String, enum: ['pending', 'in_review', 'corrected', 'approved', 'rejected', 'resolved', 'deferred', 'escalated'], default: 'pending' },
  flaggedAt: String,
  assignedTo: String,
  trial: String
}, { timestamps: true });

module.exports = piConn.model('ValidationFlag', schema);
