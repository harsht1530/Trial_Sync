const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const Subject = require('../models/Subject');
const ValidationFlag = require('../models/ValidationFlag');
const Users = require('../models/Users');
const { callOllama, getSystemPrompt } = require('../../utils/aiAssistant');

function getNextScheduleISO(scheduledTime) {
  let hours = 0;
  let minutes = 0;
  
  const timeStr = (scheduledTime || "").trim();
  const ampmMatch = timeStr.match(/(AM|PM)/i);
  if (ampmMatch) {
    const isPM = ampmMatch[0].toUpperCase() === 'PM';
    const timePart = timeStr.replace(/(AM|PM)/i, '').trim();
    const parts = timePart.split(':');
    hours = parseInt(parts[0], 10) || 0;
    minutes = parseInt(parts[1], 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  } else {
    const parts = timeStr.split(':');
    hours = parseInt(parts[0], 10) || 0;
    minutes = parts[1] ? parseInt(parts[1], 10) : 0;
  }

  const now = new Date();
  const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  if (scheduledDate.getTime() <= now.getTime()) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }
  return scheduledDate.toISOString();
}

// GET all reminders for a patient
router.get('/reminders', async (req, res) => {
  try {
    const { patientId = 'PT-001' } = req.query;
    
    if (patientId === 'PT-001') {
      const user = await Users.findOne({ role: 'Principal Investigator' });
      if (!user) return res.json([]);
      const mapped = (user.scheduled_reminders || []).map(r => ({
        _id: r.reminder_id || r.id,
        name: r.title,
        message: r.description,
        scheduledTime: r.time,
        frequency: r.frequency,
        channel: r.delivery_channel,
        status: r.status,
        nextTrigger: r.next_schedule
      }));
      return res.json(mapped);
    }
    
    const subject = await Subject.findOne({ patient_id: patientId });
    if (!subject) return res.json([]);
    
    const mapped = (subject.scheduled_reminders || []).map(r => ({
      _id: r.reminder_id || r.id,
      name: r.title,
      message: r.description,
      scheduledTime: r.time,
      frequency: r.frequency,
      channel: r.delivery_channel,
      status: r.status,
      nextTrigger: r.next_schedule
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// GET call history for a patient
router.get('/calls', async (req, res) => {
  try {
    const { patientId = 'PT-001' } = req.query;
    
    if (patientId === 'PT-001') {
      const user = await Users.findOne({ role: 'Principal Investigator' });
      if (!user) return res.json([]);
      const mappedCalls = (user.recent_call_history || []).map(c => ({
        _id: c.call_id || c.id,
        direction: c.call_type === 'Inbound Call' ? 'Inbound' : 'Outbound',
        outcome: c.status === 'No Answer' ? 'No Answer' : c.status === 'Scheduled' ? 'Scheduled' : c.status === 'Failed' ? 'Failed' : 'Completed',
        duration: c.duration,
        timestamp: c.call_datetime,
        notes: c.message,
        reminderName: c.reminder_name
      }));
      return res.json(mappedCalls);
    }
    
    const subject = await Subject.findOne({ patient_id: patientId });
    if (!subject) return res.json([]);
    
    const mappedCalls = (subject.recent_call_history || []).map(c => ({
      _id: c.call_id || c.id,
      direction: c.call_type === 'Inbound Call' ? 'Inbound' : 'Outbound',
      outcome: c.status === 'No Answer' ? 'No Answer' : c.status === 'Scheduled' ? 'Scheduled' : c.status === 'Failed' ? 'Failed' : 'Completed',
      duration: c.duration,
      timestamp: c.call_datetime,
      notes: c.message,
      reminderName: c.reminder_name
    }));
    res.json(mappedCalls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch call history' });
  }
});

// GET chat history
router.get('/chat/history', async (req, res) => {
  try {
    const { patientId = 'PT-001' } = req.query;
    const history = await ChatMessage.find({ patientId }).sort({ timestamp: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// POST send message to AI assistant
router.post('/chat', async (req, res) => {
  try {
    const { patientId = 'PT-001', message } = req.body;
    
    // 1. Get Patient Context
    const subject = await Subject.findOne({ id: patientId });
    const patientName = subject ? subject.name : "Patient";
    
    // 2. Save User Message
    await ChatMessage.create({
      patientId,
      role: 'user',
      content: message
    });

    // 3. Prepare AI Prompt
    const history = await ChatMessage.find({ patientId }).sort({ timestamp: -1 }).limit(10);
    const ollamaMessages = [
      { role: 'system', content: getSystemPrompt(patientName) },
      ...history.reverse().map(m => ({ role: m.role, content: m.content }))
    ];

    // 4. Call AI
    const rawAiResponse = await callOllama(ollamaMessages);
    
    // 5. Extraction Logic
    let cleanText = rawAiResponse;
    let metadata = null;
    
    if (rawAiResponse.includes('METADATA:')) {
      const parts = rawAiResponse.split('METADATA:');
      cleanText = parts[0].trim();
      try {
        metadata = JSON.parse(parts[parts.length - 1].trim());
      } catch (e) {
        console.error('Metadata parsing failed', e);
      }
    }

    // 6. Clinical Side Effects
    if (metadata && metadata.symptom) {
      const isAE = metadata.isAdverseEvent || metadata.severity >= 7;
      
      // Create a coordinator notification / Validation Flag
      await ValidationFlag.create({
        id: `AI-${Date.now()}`,
        patientId,
        patientName,
        dataType: 'AI Assistant',
        field: 'Self-Reported Symptom',
        originalValue: `${metadata.symptom} (Severity: ${metadata.severity})`,
        issue: isAE ? 'Potential Adverse Event detected via AI Chat' : 'Patient reported new symptom',
        severity: isAE ? 'critical' : 'warning',
        status: 'pending',
        flaggedAt: new Date().toLocaleString(),
        trial: subject ? subject.trial : 'Unknown'
      });
    }

    // 7. Save and Return Assistant Message
    const assistantMessage = await ChatMessage.create({
      patientId,
      role: 'assistant',
      content: cleanText,
      metadata: metadata ? { clinicalExtraction: metadata } : undefined
    });

    res.json(assistantMessage);
  } catch (err) {
    console.error('Chat API Error:', err);
    res.status(500).json({ error: 'AI Assistant is currently unavailable.' });
  }
});

// PATCH update reminder status
router.patch('/reminders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    // 1. Try checking the Users collection first
    const user = await Users.findOne({ "scheduled_reminders.reminder_id": req.params.id });
    if (user) {
      const reminder = user.scheduled_reminders.find(r => r.reminder_id === req.params.id);
      if (reminder) {
        reminder.status = status;
        await user.save();
        
        return res.json({
          _id: reminder.reminder_id,
          name: reminder.title,
          message: reminder.description,
          scheduledTime: reminder.time,
          frequency: reminder.frequency,
          channel: reminder.delivery_channel,
          status: reminder.status,
          nextTrigger: reminder.next_schedule
        });
      }
    }
    
    // 2. Fall back to Subject collection
    const subject = await Subject.findOne({ "scheduled_reminders.reminder_id": req.params.id });
    if (!subject) return res.status(404).json({ error: 'Reminder not found' });
    
    const reminder = subject.scheduled_reminders.find(r => r.reminder_id === req.params.id);
    if (reminder) {
      reminder.status = status;
      await subject.save();
      
      return res.json({
        _id: reminder.reminder_id,
        name: reminder.title,
        message: reminder.description,
        scheduledTime: reminder.time,
        frequency: reminder.frequency,
        channel: reminder.delivery_channel,
        status: reminder.status,
        nextTrigger: reminder.next_schedule
      });
    }
    res.status(404).json({ error: 'Reminder not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// POST create a new reminder
router.post('/reminders', async (req, res) => {
  try {
    const { patientId, name, message, scheduledTime, frequency, channel } = req.body;
    
    if (patientId === 'PT-001') {
      const user = await Users.findOne({ role: 'Principal Investigator' });
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      const newRem = {
        reminder_id: `REM-${Date.now()}`,
        title: name,
        description: message,
        status: "Active",
        is_enabled: true,
        time: scheduledTime,
        frequency: frequency,
        delivery_channel: channel,
        next_schedule: getNextScheduleISO(scheduledTime),
        created_at: new Date().toISOString()
      };
      
      user.scheduled_reminders.push(newRem);
      await user.save();
      
      return res.json({
        _id: newRem.reminder_id,
        name: newRem.title,
        message: newRem.description,
        scheduledTime: newRem.time,
        frequency: newRem.frequency,
        channel: newRem.delivery_channel,
        status: newRem.status,
        nextTrigger: newRem.next_schedule
      });
    }
    
    const subject = await Subject.findOne({ patient_id: patientId });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    
    const newRem = {
      reminder_id: `REM-${Date.now()}`,
      title: name,
      description: message,
      status: "Active",
      is_enabled: true,
      time: scheduledTime,
      frequency: frequency,
      delivery_channel: channel,
      next_schedule: getNextScheduleISO(scheduledTime),
      created_at: new Date().toISOString()
    };
    
    subject.scheduled_reminders.push(newRem);
    await subject.save();
    
    res.json({
      _id: newRem.reminder_id,
      name: newRem.title,
      message: newRem.description,
      scheduledTime: newRem.time,
      frequency: newRem.frequency,
      channel: newRem.delivery_channel,
      status: newRem.status,
      nextTrigger: newRem.next_schedule
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// POST trigger immediate outbound call
router.post('/calls/now', async (req, res) => {
  try {
    const { patientId = 'PT-001', reminderName = 'Manual Call', notes = '' } = req.body;
    
    if (patientId === 'PT-001') {
      const user = await Users.findOne({ role: 'Principal Investigator' });
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      const newCall = {
        call_id: `CALL-${Date.now()}`,
        call_type: 'Outbound Call',
        reminder_name: reminderName,
        status: 'Completed',
        message: notes || 'Automated check-in triggered via dashboard',
        call_datetime: new Date().toISOString(),
        duration: '1m 45s',
        channel: 'Voice Call'
      };
      
      user.recent_call_history.push(newCall);
      user.recent_call_history.sort((a, b) => {
        const da = new Date(a.call_datetime);
        const db = new Date(b.call_datetime);
        const t1 = isNaN(da.getTime()) ? 0 : da.getTime();
        const t2 = isNaN(db.getTime()) ? 0 : db.getTime();
        return t2 - t1;
      });
      await user.save();
      
      return res.json({ 
        message: 'Call triggered successfully', 
        call: {
          _id: newCall.call_id,
          direction: 'Outbound',
          outcome: 'Completed',
          duration: newCall.duration,
          timestamp: newCall.call_datetime,
          notes: newCall.message,
          reminderName: newCall.reminder_name
        }
      });
    }
    
    const subject = await Subject.findOne({ patient_id: patientId });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    
    const newCall = {
      call_id: `CALL-${Date.now()}`,
      call_type: 'Outbound Call',
      reminder_name: reminderName,
      status: 'Completed',
      message: notes || 'Automated check-in triggered via dashboard',
      call_datetime: new Date().toISOString(),
      duration: '1m 45s',
      channel: 'Voice Call'
    };
    
    subject.recent_call_history.push(newCall);
    subject.recent_call_history.sort((a, b) => {
      const da = new Date(a.call_datetime);
      const db = new Date(b.call_datetime);
      const t1 = isNaN(da.getTime()) ? 0 : da.getTime();
      const t2 = isNaN(db.getTime()) ? 0 : db.getTime();
      return t2 - t1;
    });
    await subject.save();
    
    res.json({ 
      message: 'Call triggered successfully', 
      call: {
        _id: newCall.call_id,
        direction: 'Outbound',
        outcome: 'Completed',
        duration: newCall.duration,
        timestamp: newCall.call_datetime,
        notes: newCall.message,
        reminderName: newCall.reminder_name
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger call' });
  }
});

module.exports = router;
