const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubTrialSchema = new mongoose.Schema({
  trialId: { type: String, required: true },
  phase: { type: String, required: true },
  status: { type: String, enum: ['Recruiting', 'On-treatment', 'Screening', 'Closeout'], required: true },
  enrolledCount: { type: Number, default: 0 },
  targetCount: { type: Number, required: true },
  siteId: { type: String, required: true }
}, { timestamps: true });

module.exports = hubConn.model('HubTrial', hubTrialSchema);
