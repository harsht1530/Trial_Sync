const express = require('express');
const router = express.Router();
const Summary = require('../models/Summary');
const Subject = require('../models/Subject');
const Trial = require('../models/Trial');
const Activity = require('../models/Activity');
const ValidationStat = require('../models/ValidationStat');
const EngagementStat = require('../models/EngagementStat');
const Prediction = require('../models/Prediction');

// Mock Authentication Middleware
const requirePiAuth = (req, res, next) => {
  // In a real app we would use JWT to get PI ID.
  req.user = { piId: 'PI-001' };
  next();
};

// GET top-level metric values
router.get('/summary', requirePiAuth, async (req, res) => {
  try {
    const totalPatients = await Subject.countDocuments();
    // Assuming mock engagement and validation rates or simple dynamic aggregates
    const validationRate = 92; // Could be computed
    const activeAlerts = 3;    // Could be computed
    const engagementScore = 88; // Could be computed

    res.json({
      totalPatients: totalPatients.toString(),
      patientChange: "+5",
      validationRate: `${validationRate}%`,
      validationChange: "+2%",
      activeAlerts: activeAlerts.toString(),
      immediateAlerts: "-1",
      engagementScore: `${engagementScore}%`,
      engagementChange: "+3%"
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// GET active patient list
router.get('/subject', requirePiAuth, async (req, res) => {
  try {
    const subjects = await Subject.find({ piId: req.user.piId }).limit(5);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET active trial list
router.get('/trials', requirePiAuth, async (req, res) => {
  try {
    const trials = await Trial.find({}).lean(); // Use lean to bypass schema strictness and read raw fields
    
    // Map to expected frontend schema
    const mappedTrials = await Promise.all(trials.map(async t => {
      const condition = t.condition || "Unknown";
      const nctId = t.nctId || t.nct_id || t.id || "Unknown";
      const displayId = `${condition}-${nctId}`;

      // Count actual subjects enrolled in this trial in Clinical_Trial_Subject_Master
      let actualSubjectsCount = 0;
      if (t.condition && (t.nctId || t.nct_id)) {
        const query = {
          $or: [
            { trial: `${t.condition} - ${t.nctId || t.nct_id}` },
            { trial: `${t.condition}-${t.nctId || t.nct_id}` },
            { trial: new RegExp(t.nctId || t.nct_id, 'i') }
          ]
        };
        actualSubjectsCount = await Subject.countDocuments(query);
      } else {
        actualSubjectsCount = await Subject.countDocuments({ trial: t.id || t.trialId });
      }

      // Calculate progress dynamically if target is available
      const targetCount = t.targetCount || parseInt(t.enrollmentTarget) || t.target || 0;
      let progress = t.progress || 0;
      if (targetCount > 0) {
        progress = Math.min(100, Math.round((actualSubjectsCount / targetCount) * 100));
      }

      return {
        id: displayId,
        name: t.protocolTitle || t.name || "Unknown Trial",
        phase: t.phase || "Unknown Phase",
        status: t.status || t.recruitmentStatus || "Active",
        patients: actualSubjectsCount,
        target: targetCount,
        sites: t.sites || t.siteCount || 1,
        progress: progress,
        startDate: t.startDate || new Date().toLocaleDateString()
      };
    }));
    
    res.json(mappedTrials);
  } catch (err) {
    console.error("Trial fetch error:", err);
    res.status(500).json({ error: 'Failed to fetch trials' });
  }
});

// GET 4 most recent activity items
router.get('/activity', requirePiAuth, async (req, res) => {
  try {
    const activities = await Activity.find({}).sort({ createdAt: -1 }).limit(4);
    
    const mapped = activities.map(act => ({
      _id: act._id,
      initials: act.initials || 'SUB',
      piId: act.patient || act.piId, // Maps to patient name so frontend renders name correctly
      patient: act.patient,
      type: act.type,
      outcome: act.outcome || 'completed',
      time: act.time || 'Just now'
    }));
    
    res.json(mapped);
  } catch (err) {
    console.error('Error fetching activity:', err);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

router.get('/validation-status', requirePiAuth, async (req, res) => {
  try {
    const subjects = await Subject.find();
    
    let pendingReview = 0;
    let inReview = 0;

    subjects.forEach(sub => {
      // Very basic logic to generate actual validation flags based on data
      if (!sub.emergency_contact || !sub.emergency_contact.phone || sub.emergency_contact.phone === 'No phone') {
        pendingReview++;
      } else if (sub.status === 'Screen Failure') {
        inReview++;
      }
    });

    // The frontend ValidationStatus.tsx expects a category-based breakdown
    const verified = subjects.length - (pendingReview + inReview);
    const validations = [
      {
        category: "Contact Info",
        passed: verified,
        failed: inReview,
        pending: pendingReview,
        status: pendingReview > 0 ? "warning" : "healthy",
        trend: "+5%"
      },
      {
        category: "Consent Forms",
        passed: subjects.length,
        failed: 0,
        pending: 0,
        status: "healthy",
        trend: "+1%"
      },
      {
        category: "Medical History",
        passed: subjects.length - 1,
        failed: 0,
        pending: 1,
        status: "warning",
        trend: "0%"
      }
    ];
    
    res.json(validations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch validation status' });
  }
});

router.get('/engagement', requirePiAuth, async (req, res) => {
  try {
    const engagements = await EngagementStat.find({ piId: req.user.piId });
    res.json(engagements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch engagement stats' });
  }
});

router.get('/predictions', requirePiAuth, async (req, res) => {
  try {
    const predictions = await Prediction.find({ piId: req.user.piId });
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

module.exports = router;
