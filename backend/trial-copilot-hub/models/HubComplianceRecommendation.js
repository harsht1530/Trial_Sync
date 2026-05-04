const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubComplianceRecommendationSchema = new mongoose.Schema({
  text: { type: String, required: true },
  recommendationType: { type: String, enum: ['missing_labs', 'repeated_deviation', 'score_drop'], required: true },
  trialId: { type: String },
  patientId: { type: String },
  priorityRank: { type: Number, default: 1 },
  siteId: { type: String, required: true }
}, { timestamps: true });

module.exports = hubConn.model('HubComplianceRecommendation', hubComplianceRecommendationSchema);
