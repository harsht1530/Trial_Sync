const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  piId: { type: String, required: true },
  initials: { type: String, required: true },
  patient: { type: String, required: true },
  type: { type: String, required: true },
  outcome: { type: String, enum: ['completed', 'delivered', 'pending'], required: true },
  time: { type: String, required: true }
}, { 
  timestamps: true,
  collection: 'Activity'
});

module.exports = mongoose.model('Activity', activitySchema);
