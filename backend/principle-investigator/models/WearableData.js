const mongoose = require('mongoose');
const { piConn } = require('../../config/db');

const schema = new mongoose.Schema({
  patientId: { type: String, required: true },
  wearableInfo: {
    device: String,
    lastSync: String,
    batteryLevel: Number,
    connectionStatus: String
  },
  metrics: [{
    iconName: String, 
    label: String,
    value: String,
    unit: String,
    trend: String,
    trendColor: String,
    bgColor: String,
    iconColor: String
  }],
  recentReadings: [{ time: String, heartRate: Number, steps: Number, activity: String }]
}, { timestamps: true });

module.exports = piConn.model('WearableData', schema);
