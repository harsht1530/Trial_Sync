const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubProtocolDeviationSchema = new mongoose.Schema({
  subjectId: { type: String, required: true },
  trialId: { type: String, required: true },
  siteId: { type: String, required: true },
  type: { type: String, required: true },
  severity: { type: String, enum: ['Major', 'Minor'], required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Unresolved', 'Deferred', 'Resolved'], default: 'Unresolved' },
  aiNote: { type: String },
  repeated_deviation: { type: Boolean, default: false },
  loggedDate: { type: Date, default: Date.now },
  resolutionNote: { type: String },
  resolvedBy: { type: String },
  resolutionTimestamp: { type: Date },
  deferralReason: { type: String },
  followUpDate: { type: Date }
}, { timestamps: true });

module.exports = hubConn.model('HubProtocolDeviation', hubProtocolDeviationSchema);
