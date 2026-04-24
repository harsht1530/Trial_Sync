const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubInsightSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['warning', 'info', 'danger'], default: 'info' },
  trialId: { type: String },
  patientId: { type: String },
  siteId: { type: String, required: true }
}, { timestamps: true });

module.exports = hubConn.model('HubInsight', hubInsightSchema);
