const mongoose = require('mongoose');

const validationStatSchema = new mongoose.Schema({
  piId: { type: String, required: true },
  category: { type: String, required: true },
  passed: { type: Number, required: true },
  failed: { type: Number, required: true },
  pending: { type: Number, required: true },
  trend: { type: String, required: true },
  status: { type: String, required: true },
}, { 
  timestamps: true,
  collection: 'ValidationStat'
});

module.exports = mongoose.model('ValidationStat', validationStatSchema);
