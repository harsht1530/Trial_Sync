const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  piId: { type: String, required: true },
  title: { type: String, required: true },
  value: { type: String, required: true },
  trend: { type: String, required: true }, // "up" or "down"
  change: { type: String, required: true },
  description: { type: String, required: true },
  color: { type: String, required: true },
  patients: { type: Number, required: true },
}, { 
  timestamps: true,
  collection: 'Prediction'
});

module.exports = mongoose.model('Prediction', predictionSchema);
