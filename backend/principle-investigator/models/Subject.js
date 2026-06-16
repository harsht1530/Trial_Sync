const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
  conditions: [{
    condition_name: { type: String },
    diagnosed_at: { type: String }, // format: date
    status: { type: String, enum: ['Managed', 'Stable', 'Critical', 'Recovered'] }
  }],
  current_medications: [{
    drug_name: { type: String },
    dosage_mg: { type: Number },
    intake_frequency: { type: String }
  }],
  allergies: [{
    name: { type: String },
    reaction: { type: String },
    severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'] }
  }]
}, { _id: false });

const scheduledReminderSchema = new mongoose.Schema({
  reminder_id: { type: String },
  title: { type: String },
  description: { type: String },
  status: { type: String, enum: ['Active', 'Paused', 'Completed'] },
  is_enabled: { type: Boolean },
  time: { type: String },
  frequency: { type: String },
  delivery_channel: { type: String, enum: ['SMS', 'CALL', 'EMAIL', 'WhatsApp', 'All Channels'] },
  next_schedule: { type: String },
  created_at: { type: String }
}, { _id: false });

const recentCallHistorySchema = new mongoose.Schema({
  call_id: { type: String },
  call_type: { type: String, enum: ['Inbound Call', 'Outbound Call'] },
  reminder_name: { type: String },
  status: { type: String, enum: ['Completed', 'No Answer', 'Scheduled', 'Failed'] },
  message: { type: String },
  call_datetime: { type: String },
  duration: { type: String },
  channel: { type: String }
}, { _id: false });

const wearableDataSchema = new mongoose.Schema({
  device: {
    device_id: { type: String },
    name: { type: String },
    battery_percentage: { type: Number },
    connection_status: { type: String, enum: ['Connected', 'Disconnected'] },
    last_sync: { type: String }
  },
  health_summary: {
    heart_rate: {
      value: { type: Number },
      unit: { type: String },
      change_percentage: { type: String }
    },
    steps: {
      value: { type: Number },
      unit: { type: String },
      change_percentage: { type: String }
    },
    sleep: {
      value: { type: Number },
      unit: { type: String },
      change_percentage: { type: String }
    },
    calories: {
      value: { type: Number },
      unit: { type: String },
      change_percentage: { type: String }
    }
  },
  daily_step_goal: {
    completed_steps: { type: Number },
    goal_steps: { type: Number },
    progress_percentage: { type: Number }
  },
  recent_readings: [{
    time: { type: String },
    heart_rate: { type: Number },
    steps: { type: Number },
    activity_status: { type: String }
  }],
  updated_at: { type: String }
}, { _id: false });

const aeSchema = new mongoose.Schema({
  ae_id: { type: String },
  severity: { type: String },
  description: { type: String },
  data_type: { type: String },
  field: { type: String },
  status: { type: String },
  flagged_at: { type: String },
  
  // HubAE specific properties
  aeType: { type: String },
  severityGrade: { type: Number },
  severityLabel: { type: String },
  onset_date: { type: String },
  resolution_date: { type: String },
  awareness_date: { type: String },
  sponsor_report_date: { type: String },
  is_sae: { type: Boolean, default: false },
  ai_flagged: { type: Boolean, default: false },
  late_report: { type: Boolean, default: false },
  days_to_report: { type: Number }
}, { _id: false });

const auditSchema = new mongoose.Schema({
  created_at: { type: String },
  updated_at: { type: String },
  created_by: { type: String }
}, { _id: false });

const subjectSchema = new mongoose.Schema({
  piId: { type: String, default: 'PI-001' },
  patient_id: { type: String, required: true, unique: true },
  subject_name: { type: String, required: true },
  trial: { type: String, required: true }, // Unified Trial ID (e.g. "ONCO-2024-A1")
  site: { type: String, required: true }, // e.g. "SITE-NY-001" or "Site A"
  status: { type: String, enum: ['Active', 'Inactive', 'Completed', 'Withdrawn', 'Screen Failure'], required: true },
  compliance: { type: Number, default: 100 },
  risk: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  last_activity: { type: String },
  enrollment_date: { type: String },
  phase: { type: String, enum: ['Screening', 'Treatment', 'Follow-up'], required: true },
  contact: {
    phone: { type: String },
    email: { type: String }
  },
  emergency_contact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String }
  },
  medical_history: { type: medicalHistorySchema, default: () => ({}) },
  scheduled_reminders: { type: [scheduledReminderSchema], default: [] },
  recent_call_history: { type: [recentCallHistorySchema], default: [] },
  wearable_data: { type: wearableDataSchema },
  adverse_events: { type: [aeSchema], default: [] },
  visit_schedule: { type: Array, default: [] },
  audit: { type: auditSchema, default: () => ({}) }
}, {
  timestamps: true,
  collection: 'Clinical_Trial_Subject_Master',
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Backward compatibility virtuals
subjectSchema.virtual('id').get(function() {
  return this.patient_id;
});

subjectSchema.virtual('name').get(function() {
  return this.subject_name;
});

subjectSchema.virtual('riskLevel').get(function() {
  return this.risk ? this.risk.toLowerCase() : 'low';
});

subjectSchema.virtual('age').get(function() {
  // Return a mock age based on standard demographics for validation logic if needed
  return 45; 
});

module.exports = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
