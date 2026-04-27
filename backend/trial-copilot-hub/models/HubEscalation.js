const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubEscalationSchema = new mongoose.Schema({
  aeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HubAE' }],
  anomalyId: { type: mongoose.Schema.Types.ObjectId, ref: 'HubSafetyAnomaly' },
  escalatingUserId: { type: String, required: true },
  piUserId: { type: String, required: true },
  note: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

module.exports = hubConn.model('HubEscalation', hubEscalationSchema);
