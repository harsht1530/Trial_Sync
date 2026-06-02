const mongoose = require('mongoose');
const Subject = require('../../principle-investigator/models/Subject');

module.exports = mongoose.models.Profile || mongoose.model('Profile', Subject.schema, 'Clinical_Trial_Subject_Master');

