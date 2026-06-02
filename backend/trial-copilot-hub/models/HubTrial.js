const mongoose = require('mongoose');
const Trial = require('../../principle-investigator/models/Trial');

module.exports = mongoose.models.HubTrial || mongoose.model('HubTrial', Trial.schema, 'Trial');

