const mongoose = require('mongoose');
const { piConn } = require('../../config/db');

const subjectSchema = new mongoose.Schema({
  piId: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  trial: { type: String, required: true },
  phase: { type: String, required: true },
  status: { type: String, enum: ['active', 'review', 'alert'], required: true },
  compliance: { type: Number, required: true },
  lastVisit: { type: String, required: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  site: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  email: { type: String },
  phone: { type: String },
  enrollmentDate: { type: String },
  address: { type: String },
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String }
  }
}, { 
  timestamps: true,
  collection: 'Subject' // Force Mongoose to use 'Subject' instead of 'subjects'
});

module.exports = piConn.model('Subject', subjectSchema);
