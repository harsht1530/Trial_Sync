const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubSubjectSchema = new mongoose.Schema({
  subjectId: { type: String, required: true },
  trialId: { type: String, required: true },
  siteId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['screening', 'consented', 'on-treatment', 'discontinued'], 
    default: 'screening' 
  },
  phase: { type: String, required: true },
  lastVisit: { type: Date },
  nextVisit: { type: Date },
  flags: { 
    type: [String], 
    default: [] 
  },
  riskScore: { type: Number, default: 0 },
  gender: { type: String }, // keeping for compatibility if needed
  sex: { type: String },
  dob: { type: Date },
  phone: { type: String },
  inclusionCriteriaReviewed: { type: Boolean, default: false },
  age: { type: Number },
  enrollmentDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = hubConn.model('HubSubject', hubSubjectSchema);
