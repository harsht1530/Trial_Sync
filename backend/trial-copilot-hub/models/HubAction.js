const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubActionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { type: String, enum: ['call', 'submit', 'review', 'send'], required: true },
  trialId: { type: String },
  patientId: { type: String },
  siteId: { type: String, required: true }
}, { timestamps: true });

module.exports = hubConn.model('HubAction', hubActionSchema);
