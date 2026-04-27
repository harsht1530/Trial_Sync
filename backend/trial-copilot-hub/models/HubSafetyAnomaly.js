const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubSafetyAnomalySchema = new mongoose.Schema({
  description: { type: String, required: true },
  trialId: { type: String, required: true },
  affectedPatientIds: [{ type: String }],
  historicalSignalRef: { type: String },
  recommendedAction: { type: String },
  urgency: { 
    type: String, 
    enum: ['routine', 'urgent', 'critical'], 
    default: 'routine' 
  },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  siteId: { type: String, required: true }
}, { timestamps: true });

module.exports = hubConn.model('HubSafetyAnomaly', hubSafetyAnomalySchema);
