const mongoose = require('mongoose');
const { piConn } = require('../../config/db');

const schema = new mongoose.Schema({
  id: { type: String, required: true },
  validationId: String,
  action: { type: String, enum: ['Correction Applied', 'Approved', 'Rejected', 'Assigned for Review'] },
  performedBy: String,
  timestamp: String,
  oldValue: String,
  newValue: String,
  notes: String
}, { timestamps: true });

module.exports = piConn.model('AuditEntry', schema);
