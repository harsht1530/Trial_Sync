const mongoose = require('mongoose');
const { spConn } = require('../../config/db');

const profileSchema = new mongoose.Schema({
  subjectId: { type: String, required: true, unique: true },
  fullName: String,
  email: String,
}, { timestamps: true });

module.exports = spConn.model('Profile', profileSchema);
