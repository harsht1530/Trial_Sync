const express = require('express');
const router = express.Router();
const hubController = require('../controllers/hubController');
const agentController = require('../controllers/agentController');

router.get('/health', (req, res) => {
  res.json({ 
    status: 'Trial Copilot Hub API is running',
    version: '1.0.2',
    timestamp: new Date().toISOString()
  });
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
router.post('/visits/reschedule', hubController.rescheduleVisit);
router.get('/visits/upcoming', hubController.getUpcomingVisits);
router.get('/visits/nudges', hubController.getAINudges);
router.post('/visits/book', hubController.bookVisit);

// Safety & Adverse Events
router.get('/safety/summary', hubController.getSafetySummary);
router.get('/safety/anomalies', hubController.getSafetyAnomalies);
router.get('/safety/ae-list', hubController.getAEList);
router.post('/safety/report-ae', hubController.reportAE);
router.post('/safety/escalate', hubController.escalateToPI);

// Compliance & Protocol Adherence
router.get('/compliance/health-score', hubController.getComplianceHealthScore);
router.get('/compliance/recommendations', hubController.getComplianceRecommendations);
router.get('/compliance/deviations', hubController.getProtocolDeviations);
router.post('/compliance/resolve', hubController.resolveDeviation);
router.post('/compliance/defer', hubController.deferDeviation);
router.post('/compliance/assess', hubController.assessCompliance);

// =========================
// AI Agent Chat (Pydantic-AI style, Node.js)
// =========================
router.post('/agent/chat', agentController.chatWithAgent);

module.exports = router;
