const mongoose = require('mongoose');

const trialSchema = new mongoose.Schema({
  piId: { type: String, required: true },
  id: { type: String, required: true },
  name: { type: String, required: true },
  diseaseArea: { type: String }, // optional as per prompt but good to have
  phase: { type: String, required: true },
  status: { type: String, required: true }, // "enrolling" | "active"
  patients: { type: Number, required: true },
  target: { type: Number, required: true },
  progress: { type: Number, required: true },
  sites: { type: Number, required: true },
  startDate: { type: String, required: true }
}, { 
  timestamps: true,
  collection: 'Trial'
});

module.exports = mongoose.model('Trial', trialSchema);
