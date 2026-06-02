const mongoose = require('mongoose');

const trialSchema = new mongoose.Schema({
  piId: { type: String, default: 'PI-001' },
  id: { type: String }, // Sponsor ID (e.g. "ONCO-2024-A1")
  trialId: { type: String, required: true, unique: true }, // Hub/Unified ID (e.g. "ONCO-2024-A1")
  name: { type: String, required: true },
  diseaseArea: { type: String, default: 'Oncology' },
  phase: { type: String, required: true },
  status: { type: String, required: true }, // "active", "enrolling", "Recruiting", "On-treatment", "Screening", "Closeout"
  patients: { type: Number, default: 0 },
  enrolledCount: { type: Number, default: 0 },
  target: { type: Number, default: 0 },
  targetCount: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  sites: { type: Number, default: 1 },
  siteId: { type: String, default: 'SITE-NY-001' },
  startDate: { type: String }
}, { 
  timestamps: true,
  collection: 'Trial'
});

module.exports = mongoose.models.Trial || mongoose.model('Trial', trialSchema);

