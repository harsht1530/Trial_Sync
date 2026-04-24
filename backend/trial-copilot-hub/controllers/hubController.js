const HubSiteHealth = require('../models/HubSiteHealth');
const HubTrial = require('../models/HubTrial');
const HubInsight = require('../models/HubInsight');
const HubAction = require('../models/HubAction');
const HubActivity = require('../models/HubActivity');
const HubSubject = require('../models/HubSubject');

exports.getHealthSnapshot = async (req, res) => {
  try {
    const healthData = await HubSiteHealth.findOne().sort({ lastUpdated: -1 });
    if (!healthData) {
      return res.status(404).json({ message: 'Health snapshot data not found' });
    }
    res.json(healthData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveTrials = async (req, res) => {
  try {
    const trials = await HubTrial.find({ status: { $ne: 'Closeout' } });
    res.json(trials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInsightsAndActivity = async (req, res) => {
  try {
    const insights = await HubInsight.find().limit(5);
    const actions = await HubAction.find().limit(5);
    
    // Paginated activity feed
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const activityFeed = await HubActivity.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      insights,
      actions,
      activityFeed,
      currentPage: page,
      limit
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const { status, aiFlagged } = req.query;
    let query = {};
    
    if (status && status !== 'all' && status !== 'ai-flagged') {
      query.status = status;
    }
    
    if (aiFlagged === 'true' || status === 'ai-flagged') {
      query.flags = { $not: { $size: 0 } };
    }

    const subjects = await HubSubject.find(query);
    const totalSubjectCount = await HubSubject.countDocuments();
    const activeTrialCount = await HubTrial.countDocuments({ status: { $ne: 'Closeout' } });

    res.json({
      subjects,
      summary: {
        totalSubjectCount,
        activeTrialCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPriorityRecommendations = async (req, res) => {
  try {
    const highRiskSubjects = await HubSubject.find({ flags: { $not: { $size: 0 } } })
      .sort({ riskScore: -1 });

    let message = "No priority actions at this time.";
    if (highRiskSubjects.length > 0) {
      const ids = highRiskSubjects.slice(0, 2).map(s => s.subjectId).join(' and ');
      message = `Call ${highRiskSubjects.length} high-risk subjects this week to prevent dropout. Focus on ${ids} first.`;
    }

    const callQueue = highRiskSubjects.map(s => ({
      subjectId: s.subjectId,
      trialId: s.trialId,
      riskReason: s.flags[0] || 'Unknown risk',
      priorityRank: s.riskScore,
      recommendedAction: 'call'
    }));

    res.json({
      recommendationMessage: message,
      callQueue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addSubject = async (req, res) => {
  try {
    const { trialId, subjectId, siteId, dob, sex, status, phone, inclusionCriteriaReviewed } = req.body;
    
    if (!trialId || !subjectId || !siteId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const trial = await HubTrial.findOne({ trialId });
    if (!trial) {
      return res.status(400).json({ message: 'Invalid or inactive Trial ID' });
    }

    const existing = await HubSubject.findOne({ subjectId, trialId });
    if (existing) {
      return res.status(409).json({ message: 'Subject already exists within this trial' });
    }

    const newSubject = await HubSubject.create({
      subjectId,
      trialId,
      siteId,
      dob,
      sex,
      status: status || 'screening',
      phone,
      inclusionCriteriaReviewed,
      phase: trial.phase,
      flags: [],
      riskScore: 0
    });

    res.status(201).json(newSubject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
