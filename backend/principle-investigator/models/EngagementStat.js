const mongoose = require('mongoose');
const { piConn } = require('../../config/db');

const engagementStatSchema = new mongoose.Schema({
  piId: { type: String, required: true },
  channel: { type: String, required: true },
  interactions: { type: Number, required: true },
  response: { type: String, required: true },
  trend: { type: String, required: true }
}, { 
  timestamps: true,
  collection: 'EngagementStat'
});

module.exports = piConn.model('EngagementStat', engagementStatSchema);
