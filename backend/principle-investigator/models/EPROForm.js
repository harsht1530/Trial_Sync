const mongoose = require('mongoose');
const { piConn } = require('../../config/db');

const schema = new mongoose.Schema({
  formName: String,
  trialPhase: String,
  hasScore: Boolean,
  maxScore: Number
});

module.exports = piConn.model('EPROForm', schema);
