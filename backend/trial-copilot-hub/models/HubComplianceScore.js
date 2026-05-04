const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubComplianceScoreSchema = new mongoose.Schema({
  trialId: { type: String, required: true },
  siteId: { type: String, required: true },
  overallScore: { type: Number, required: true },
  componentScores: {
    visits: { type: Number, default: 0 },
    labs: { type: Number, default: 0 },
    consent: { type: Number, default: 0 },
    epro: { type: Number, default: 0 }
  },
  healthBand: { type: String, enum: ['green', 'amber', 'red'], required: true },
  weekOnWeekChange: { type: Number, default: 0 },
  lastAssessmentDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = hubConn.model('HubComplianceScore', hubComplianceScoreSchema);
