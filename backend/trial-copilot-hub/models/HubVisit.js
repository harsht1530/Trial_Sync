const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubVisitSchema = new mongoose.Schema({
  subjectId: { type: String, required: true },
  trialId: { type: String, required: true },
  visitType: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  duration: { type: Number, default: 1 }, // in hours
  state: { 
    type: String, 
    enum: ['standard', 'conflict', 'ai_nudge'], 
    default: 'standard' 
  },
  siteId: { type: String, default: 'SITE-NY-001' },
  conflictDetails: {
    conflictingSubjectId: String,
    resolutionRecommendedSlot: {
        date: Date,
        time: String
    }
  },
  aiMetrics: {
    noShowRiskPct: Number,
    congestionReductionPct: Number
  }
}, { timestamps: true });

module.exports = hubConn.model('HubVisit', hubVisitSchema);
