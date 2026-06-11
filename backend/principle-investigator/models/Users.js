const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  reminder_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: 'Active' },
  is_enabled: { type: Boolean, default: true },
  time: { type: String }, // e.g. "08:00 AM"
  frequency: { type: String }, // e.g. "Daily"
  delivery_channel: { type: String }, // e.g. "CALL", "SMS"
  next_schedule: { type: String },
  created_at: { type: String }
}, { _id: false });

const callHistorySchema = new mongoose.Schema({
  call_id: { type: String, required: true },
  call_type: { type: String }, // e.g. "Outbound Call", "Inbound Call"
  reminder_name: { type: String },
  status: { type: String }, // e.g. "Completed", "No Answer"
  message: { type: String },
  call_datetime: { type: String },
  duration: { type: String },
  channel: { type: String }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Hashed password for email/password authentication
  googleId: { type: String }, // Google unique user ID for OAuth
  role: { type: String, enum: ['Site Incharge', 'Principal Investigator', 'Subject', 'Site Coordinator'], default: 'Principal Investigator' },
  scheduled_reminders: { type: [reminderSchema], default: [] },
  recent_call_history: { type: [callHistorySchema], default: [] },
  conversationsHistory: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { 
  timestamps: true,
  collection: 'Users'
});

module.exports = mongoose.models.Users || mongoose.model('Users', userSchema);
