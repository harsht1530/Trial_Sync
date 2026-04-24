const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const Subject = require('../models/Subject');
const ValidationFlag = require('../models/ValidationFlag');
const Reminder = require('../models/Reminder');
const CallLog = require('../models/CallLog');
const { callOllama, getSystemPrompt } = require('../utils/aiAssistant');

// GET all reminders for a patient
router.get('/reminders', async (req, res) => {
  try {
    const { patientId = 'PT-001' } = req.query;
    const reminders = await Reminder.find({ patientId });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// GET call history for a patient
router.get('/calls', async (req, res) => {
  try {
    const { patientId = 'PT-001' } = req.query;
    const calls = await CallLog.find({ patientId }).sort({ timestamp: -1 });
    res.json(calls);
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
    const reminder = await Reminder.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// POST create a new reminder
router.post('/reminders', async (req, res) => {
  try {
    const reminderData = { ...req.body, patientId: req.body.patientId || 'PT-001' };
    const reminder = await Reminder.create(reminderData);
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// POST trigger immediate outbound call
router.post('/calls/now', async (req, res) => {
  try {
    const { patientId = 'PT-001', reminderName = 'Manual Call' } = req.body;
    
    const newCall = await CallLog.create({
      patientId,
      direction: 'Outbound',
      outcome: 'Completed',
      reminderName,
      timestamp: new Date().toLocaleString(),
      duration: '1:45',
      notes: 'Automated check-in triggered via dashboard'
    });
    
    res.json({ message: 'Call triggered successfully', call: newCall });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger call' });
  }
});

module.exports = router;
