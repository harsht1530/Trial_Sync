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

// Visits & Scheduling
router.get('/visits/weekly', hubController.getWeeklySchedule);
router.get('/visits/conflicts', hubController.detectConflicts);
router.post('/visits/auto-resolve', hubController.autoResolveConflict);
router.get('/visits/upcoming', hubController.getUpcomingVisits);
router.get('/visits/nudges', hubController.getAINudges);
router.post('/visits/book', hubController.bookVisit);

// Safety & Adverse Events
router.get('/safety/summary', hubController.getSafetySummary);
router.get('/safety/anomalies', hubController.getSafetyAnomalies);
router.get('/safety/ae-list', hubController.getAEList);
router.post('/safety/report-ae', hubController.reportAE);
router.post('/safety/escalate', hubController.escalateToPI);

router.get('/agents', async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
