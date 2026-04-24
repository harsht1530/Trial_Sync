const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const hubController = require('../controllers/hubController');

router.get('/health', (req, res) => {
  res.json({ status: 'Trial Copilot Hub API is running' });
});

router.get('/health-snapshot', hubController.getHealthSnapshot);
router.get('/active-trials', hubController.getActiveTrials);
router.get('/insights-activity', hubController.getInsightsAndActivity);
router.get('/subjects', hubController.getSubjects);
router.get('/priority-recommendations', hubController.getPriorityRecommendations);
router.post('/add-subject', hubController.addSubject);

router.get('/agents', async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
