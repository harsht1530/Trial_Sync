const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const agentSchema = new mongoose.Schema({
  agentName: { type: String, required: true },
  capability: [String],
  status: { type: String, default: 'idle' }
}, { timestamps: true });

module.exports = hubConn.model('Agent', agentSchema);
