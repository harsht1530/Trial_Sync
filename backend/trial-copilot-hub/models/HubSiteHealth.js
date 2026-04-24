const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubSiteHealthSchema = new mongoose.Schema({
  siteId: { type: String, required: true },
  siteCoordinator: { type: String, required: true },
  overallRisk: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  compliance: { type: String, enum: ['Low', 'Medium', 'High'], default: 'High' },
  recruitment: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  safety: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  activeSubjectCount: { type: Number, default: 0 },
  activeSubjectDelta: { type: Number, default: 0 },
  visitCompletionRate: { type: Number, default: 0 },
  visitCompletionDelta: { type: Number, default: 0 },
  openAECount: { type: Number, default: 0 },
  openAEDelta: { type: Number, default: 0 },
  queryRate: { type: Number, default: 0 },
  queryRateDelta: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = hubConn.model('HubSiteHealth', hubSiteHealthSchema);
