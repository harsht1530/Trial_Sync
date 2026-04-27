const mongoose = require('mongoose');
const { hubConn } = require('../../config/db');

const hubAuditLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  actionType: { type: String, required: true },
  entityId: { type: String, required: true },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

module.exports = hubConn.model('HubAuditLog', hubAuditLogSchema);
