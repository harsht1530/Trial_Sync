const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  formName: String,
  trialPhase: String,
  hasScore: Boolean,
  maxScore: Number
});

module.exports = mongoose.model('EPROForm', schema);
