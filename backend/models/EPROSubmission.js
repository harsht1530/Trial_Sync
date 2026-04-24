const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  formName: String,
  trialWeek: String,
  status: { type: String, enum: ['Completed', 'Pending', 'Overdue'] },
  submittedAt: String,
  score: Number,
  maxScore: Number,
  patientId: String,
  deadline: Date,
  responses: [{
    question: String,
    answer: String,
    type: { type: String, enum: ['choice', 'scale', 'text'] }
  }]
}, { timestamps: true });

module.exports = mongoose.model('EPROSubmission', schema);
