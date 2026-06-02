const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// GET distinct filter options
router.get('/filters', async (req, res) => {
  try {
    const trials = await Subject.distinct('trial');
    const sites = await Subject.distinct('site');
    const statuses = await Subject.distinct('status');
    const riskLevels = await Subject.distinct('risk');
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
    if (status) {
      query.status = { $in: status.split(',').map(s => new RegExp(`^${s.trim()}$`, 'i')) };
    }
    if (risk) {
      query.risk = { $in: risk.split(',').map(r => new RegExp(`^${r.trim()}$`, 'i')) };
    }

    if (search) {
      query.$or = [
        { subject_name: { $regex: search, $options: 'i' } },
        { patient_id: { $regex: search, $options: 'i' } },
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

// GET single subject by custom ID (e.g. SUB-001)
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findOne({ patient_id: req.params.id });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (err) {
    console.error('Error fetching subject by ID:', err);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// SUB-COLLECTION ENDPOINTS (Extracted directly from embedded subdocuments)
router.get('/:id/medical-history', async (req, res) => {
  try {
    const sub = await Subject.findOne({ patient_id: req.params.id });
    if (!sub || !sub.medical_history) {
      return res.json({ conditions: [], medications: [], allergies: [], surgeries: [] });
    }
    
    const hist = sub.medical_history;
    
    const mappedConditions = (hist.conditions || []).map(c => ({
      name: c.condition_name,
      diagnosedDate: c.diagnosed_at,
      status: c.status
    }));
    
    const mappedMedications = (hist.current_medications || []).map(m => ({
      name: m.drug_name,
      dosage: m.dosage_mg ? `${m.dosage_mg} mg` : 'N/A',
      frequency: m.intake_frequency
    }));
    
    const mappedAllergies = (hist.allergies || []).map(a => ({
      allergen: a.name,
      reaction: a.reaction,
      severity: a.severity
    }));
    
    res.json({
      conditions: mappedConditions,
      medications: mappedMedications,
      allergies: mappedAllergies,
      surgeries: []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch medical history' });
  }
});

router.get('/:id/reminders', async (req, res) => {
  try {
    const sub = await Subject.findOne({ patient_id: req.params.id });
    res.json(sub ? sub.scheduled_reminders : []);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/:id/call-logs', async (req, res) => {
  try {
    const sub = await Subject.findOne({ patient_id: req.params.id });
    res.json(sub ? sub.recent_call_history : []);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/:id/wearable-data', async (req, res) => {
  try {
    const sub = await Subject.findOne({ patient_id: req.params.id });
    if (!sub || !sub.wearable_data) return res.json({});
    
    const wd = sub.wearable_data;
    
    const wearableInfo = {
      connectionStatus: wd.device?.connection_status || 'Disconnected',
      device: wd.device?.name || 'Unknown Device',
      batteryLevel: wd.device?.battery_percentage || 0,
      lastSync: wd.device?.last_sync || new Date().toISOString()
    };
    
    const hs = wd.health_summary || {};
    const metrics = [
      {
        iconName: "Heart",
        label: "Heart Rate",
        value: hs.heart_rate?.value ? String(hs.heart_rate.value) : "0",
        unit: hs.heart_rate?.unit || "BPM",
        trend: hs.heart_rate?.change_percentage || "0%",
        trendColor: hs.heart_rate?.change_percentage?.startsWith('-') ? "text-success" : "text-destructive",
        bgColor: "bg-destructive/5",
        iconColor: "text-destructive"
      },
      {
        iconName: "Footprints",
        label: "Steps",
        value: hs.steps?.value ? Number(hs.steps.value).toLocaleString() : "0",
        unit: hs.steps?.unit || "steps",
        trend: hs.steps?.change_percentage || "0%",
        trendColor: "text-success",
        bgColor: "bg-primary/5",
        iconColor: "text-primary"
      },
      {
        iconName: "Moon",
        label: "Sleep",
        value: hs.sleep?.value ? String(hs.sleep.value) : "0",
        unit: hs.sleep?.unit || "hrs",
        trend: hs.sleep?.change_percentage || "0%",
        trendColor: "text-success",
        bgColor: "bg-accent/5",
        iconColor: "text-accent"
      },
      {
        iconName: "Flame",
        label: "Calories",
        value: hs.calories?.value ? Number(hs.calories.value).toLocaleString() : "0",
        unit: hs.calories?.unit || "kcal",
        trend: hs.calories?.change_percentage || "0%",
        trendColor: "text-success",
        bgColor: "bg-warning/5",
        iconColor: "text-warning"
      }
    ];
    
    const recentReadings = (wd.recent_readings || []).map(r => ({
      time: r.time,
      heartRate: r.heart_rate,
      steps: r.steps,
      activity: r.activity_status
    }));
    
    res.json({
      wearableInfo,
      metrics,
      recentReadings
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wearable data' });
  }
});

// POST action for a subject
router.post('/:id/action', async (req, res) => {
  try {
    const { action } = req.body;
    res.json({ success: true, message: `Action ${action} completed locally for ${req.params.id}` });
  } catch (err) {
    console.error('Error recording action:', err);
    res.status(500).json({ error: 'Failed to process action' });
  }
});

module.exports = router;

