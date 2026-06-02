const mongoose = require('mongoose');
const Subject = require('../../principle-investigator/models/Subject');

// Define virtuals for fields HubSubject expects that are named differently
Subject.schema.virtual('subjectId').get(function() {
  return this.patient_id;
});
Subject.schema.virtual('trialId').get(function() {
  return this.trial;
});
Subject.schema.virtual('riskScore').get(function() {
  if (this.risk === 'High') return 85;
  if (this.risk === 'Medium') return 50;
  return 15;
});
Subject.schema.virtual('flags').get(function() {
  const list = [];
  if (this.adverse_events && this.adverse_events.some(ae => ae.status === 'Pending' || ae.status === 'Escalated')) {
    list.push('pending_ae');
  }
  return list;
});

module.exports = mongoose.models.HubSubject || mongoose.model('HubSubject', Subject.schema, 'Clinical_Trial_Subject_Master');

