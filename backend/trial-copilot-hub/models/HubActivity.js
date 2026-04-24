const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubActivitySchema = new mongoose.Schema({
  description: { type: String, required: true },
  type: { type: String, enum: ['success', 'warning', 'info', 'danger'], default: 'info' },
  trialId: { type: String },
  patientId: { type: String },
  siteId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = hubConn.model('HubActivity', hubActivitySchema);
