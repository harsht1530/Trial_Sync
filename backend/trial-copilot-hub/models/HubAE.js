const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubAESchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  trialId: { type: String, required: true },
  siteId: { type: String, required: true },
  aeType: { type: String, required: true },
  severityGrade: { type: Number, required: true, min: 1, max: 5 },
  severityLabel: { type: String, required: true },
  onset_date: { type: Date, required: true },
  resolution_date: { type: Date },
  awareness_date: { type: Date, required: true },
  sponsor_report_date: { type: Date },
  status: { 
    type: String, 
    enum: ['Active', 'Monitoring', 'Under Review', 'Reported', 'Resolved'], 
    default: 'Active' 
  },
  is_sae: { type: Boolean, default: false },
  ai_flagged: { type: Boolean, default: false },
  late_report: { type: Boolean, default: false },
  days_to_report: { type: Number },
}, { timestamps: true });

module.exports = hubConn.model('HubAE', hubAESchema);
