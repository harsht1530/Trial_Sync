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
    const summary = await Summary.findOne({ piId: req.user.piId });
    if (!summary) return res.status(404).json({ error: 'Summary not found' });
    res.json(summary);
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
    const trials = await Trial.find({ piId: req.user.piId });
    res.json(trials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trials' });
  }
});

// GET 4 most recent activity items
router.get('/activity', requirePiAuth, async (req, res) => {
  try {
    // Sort logic could go here if we had date objects. Since it's mockup, we'll just pull 4 items.
    const activities = await Activity.find({ piId: req.user.piId }).limit(4);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

router.get('/validation-status', requirePiAuth, async (req, res) => {
  try {
    const validations = await ValidationStat.find({ piId: req.user.piId });
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
