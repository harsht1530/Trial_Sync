const mongoose = require('mongoose');
const { piConn } = require('../../config/db');

const summarySchema = new mongoose.Schema({
  piId: { type: String, required: true },
  totalPatients: { type: String, required: true },
  patientChange: { type: String, required: true },
  validationRate: { type: String, required: true },
  validationChange: { type: String, required: true },
  activeAlerts: { type: String, required: true },
  immediateAlerts: { type: String, required: true },
  engagementScore: { type: String, required: true },
  engagementChange: { type: String, required: true },
}, { 
  timestamps: true,
  collection: 'Summary'
});

module.exports = piConn.model('Summary', summarySchema);
