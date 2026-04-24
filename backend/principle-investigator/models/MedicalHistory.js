const mongoose = require('mongoose');
const { piConn } = require('../../config/db');

const schema = new mongoose.Schema({
  patientId: { type: String, required: true },
  conditions: [{ name: String, diagnosedDate: String, status: String }],
  medications: [{ name: String, dosage: String, frequency: String }],
  allergies: [{ allergen: String, severity: String, reaction: String }],
  surgeries: [{ procedure: String, date: String, notes: String }]
}, { timestamps: true });

module.exports = piConn.model('MedicalHistory', schema);
