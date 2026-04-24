const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const MedicalHistory = require('../models/MedicalHistory');
const Reminder = require('../models/Reminder');
const CallLog = require('../models/CallLog');
const WearableData = require('../models/WearableData');

// GET distinct filter options
router.get('/filters', async (req, res) => {
  try {
    const trials = await Subject.distinct('trial');
    const sites = await Subject.distinct('site');
    const statuses = await Subject.distinct('status');
    const riskLevels = await Subject.distinct('riskLevel');
    const totalCount = await Subject.countDocuments();

    res.json({ trials, sites, statuses, riskLevels, totalCount });
  } catch (err) {
    console.error('Error fetching filters:', err);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

// GET all subjects with optional filters
router.get('/', async (req, res) => {
  try {
    const { trial, site, status, risk, search } = req.query;
    const query = {};

    if (trial) query.trial = trial;
    if (site) query.site = site;
    if (status) query.status = { $in: status.split(',') };
    if (risk) query.riskLevel = { $in: risk.split(',') };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } },
        { trial: { $regex: search, $options: 'i' } }
      ];
    }

    const subjects = await Subject.find(query);
    res.json(subjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET single subject by custom ID (e.g. PT-001)
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findOne({ id: req.params.id });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (err) {
    console.error('Error fetching subject by ID:', err);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// SUB-COLLECTION ENDPOINTS
router.get('/:id/medical-history', async (req, res) => {
  try {
    const data = await MedicalHistory.findOne({ patientId: req.params.id });
    res.json(data || {});
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/:id/reminders', async (req, res) => {
  try {
    const data = await Reminder.find({ patientId: req.params.id });
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/:id/call-logs', async (req, res) => {
  try {
    const data = await CallLog.find({ patientId: req.params.id });
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/:id/wearable-data', async (req, res) => {
  try {
    const data = await WearableData.findOne({ patientId: req.params.id });
    res.json(data || {});
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// POST action for a subject
router.post('/:id/action', async (req, res) => {
  try {
    const { action } = req.body;
    // In a real system, you would log this or change subject status here
    res.json({ success: true, message: `Action ${action} completed locally for ${req.params.id}` });
  } catch (err) {
    console.error('Error recording action:', err);
    res.status(500).json({ error: 'Failed to process action' });
  }
});

module.exports = router;
