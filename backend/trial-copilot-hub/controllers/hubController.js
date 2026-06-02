const HubSiteHealth = require('../models/HubSiteHealth');
const HubTrial = require('../models/HubTrial');
const HubInsight = require('../models/HubInsight');
const HubAction = require('../models/HubAction');
const HubActivity = require('../models/HubActivity');
const HubSubject = require('../models/HubSubject');
const HubVisit = require('../models/HubVisit');
const HubAE = require('../models/HubAE');
const HubSafetyAnomaly = require('../models/HubSafetyAnomaly');
const HubAuditLog = require('../models/HubAuditLog');
const HubEscalation = require('../models/HubEscalation');
const HubComplianceScore = require('../models/HubComplianceScore');
const HubProtocolDeviation = require('../models/HubProtocolDeviation');
const HubComplianceRecommendation = require('../models/HubComplianceRecommendation');

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
      query.status = new RegExp(`^${status.trim()}$`, 'i');
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

    // Check by patient_id
    const existing = await HubSubject.findOne({ patient_id: subjectId, trial: trialId });
    if (existing) {
      return res.status(409).json({ message: 'Subject already exists within this trial' });
    }

    // Map status from screening/consented/etc to master enums (Active, Inactive, Completed, Withdrawn, Screen Failure)
    let masterStatus = 'Active';
    if (status === 'discontinued') masterStatus = 'Withdrawn';
    else if (status === 'inactive') masterStatus = 'Inactive';

    // Map phase (Screening, Treatment, Follow-up)
    let masterPhase = 'Screening';
    if (trial.phase && trial.phase.toLowerCase().includes('treatment')) masterPhase = 'Treatment';
    else if (trial.phase && trial.phase.toLowerCase().includes('follow')) masterPhase = 'Follow-up';

    const newSubject = await HubSubject.create({
      patient_id: subjectId,
      subject_name: `Subject ${subjectId}`,
      trial: trialId,
      site: siteId,
      status: masterStatus,
      risk: 'Low',
      phase: masterPhase,
      contact: {
        phone: phone || '',
        email: ''
      },
      wearable_data: {
        device: {
          device_id: `DEV-${subjectId}`,
          name: 'ClinikBand v3',
          battery_percentage: 100,
          connection_status: 'Connected',
          last_sync: new Date().toISOString()
        },
        health_summary: {
          heart_rate: { value: 75, unit: 'BPM', change_percentage: '0%' },
          steps: { value: 0, unit: 'steps', change_percentage: '0%' },
          sleep: { value: 8.0, unit: 'hrs', change_percentage: '0%' },
          calories: { value: 0, unit: 'kcal', change_percentage: '0%' }
        },
        daily_step_goal: {
          completed_steps: 0,
          goal_steps: 10000,
          progress_percentage: 0
        },
        recent_readings: [],
        updated_at: new Date().toISOString()
      },
      audit: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'USER-SC-001'
      }
    });

    res.status(201).json(newSubject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWeeklySchedule = async (req, res) => {
  try {
    const { week_start_date } = req.query;
    if (!week_start_date) {
      return res.status(400).json({ message: 'week_start_date is required' });
    }

    const start = new Date(week_start_date);
    const end = new Date(start);
    end.setDate(start.getDate() + 5); // Mon-Fri window

    const visits = await HubVisit.find({
      scheduledDate: { $gte: start, $lt: end },
      siteId: 'SITE-NY-001' // Scoped to site
    }).sort({ scheduledDate: 1, scheduledTime: 1 });

    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.detectConflicts = async (req, res) => {
  try {
    const { week_start_date } = req.query;
    const start = week_start_date ? new Date(week_start_date) : new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const conflicts = await HubVisit.find({
      state: 'conflict',
      scheduledDate: { $gte: start, $lt: end }
    });

    res.json(conflicts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.autoResolveConflict = async (req, res) => {
  try {
    const { subjectId, currentSlot, newSlot } = req.body;
    
    // In a real app, we'd validate the protocol tolerance window here
    const visit = await HubVisit.findOneAndUpdate(
      { 
        subjectId, 
        scheduledDate: new Date(currentSlot.date),
        scheduledTime: currentSlot.time
      },
      {
        scheduledDate: new Date(newSlot.date),
        scheduledTime: newSlot.time,
        state: 'standard',
        conflictDetails: null
      },
      { new: true }
    );

    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUpcomingVisits = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    // We use a mock date from our seeded data week (Thursday) so that we have 'upcoming' visits for the demo
    const baseDate = new Date("2025-02-13T00:00:00Z"); 
    const visits = await HubVisit.find({
      scheduledDate: { $gte: baseDate }
    })
    .sort({ scheduledDate: 1, scheduledTime: 1 })
    .limit(limit);

    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAINudges = async (req, res) => {
  try {
    const nudges = await HubVisit.find({
      state: 'ai_nudge'
    }).limit(5);

    const formattedNudges = nudges.map(v => ({
      subjectId: v.subjectId,
      visitReference: v.visitType,
      nudgeMessage: v.aiMetrics?.noShowRiskPct > 30 
        ? `${v.subjectId} has a high no-show risk (${v.aiMetrics.noShowRiskPct}%). Recommend reminder call.`
        : `Rescheduling ${v.subjectId} to Friday reduces congestion by ${v.aiMetrics?.congestionReductionPct || 10}%.`,
      no_show_risk_pct: v.aiMetrics?.noShowRiskPct,
      congestion_reduction_pct: v.aiMetrics?.congestionReductionPct
    }));

    res.json(formattedNudges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bookVisit = async (req, res) => {
  try {
    const { subjectId, trialId, visitType, date, time } = req.body;

    // Validate conflict
    const conflict = await HubVisit.findOne({
      scheduledDate: new Date(date),
      scheduledTime: time,
      siteId: 'SITE-NY-001'
    });

    if (conflict) {
      return res.status(409).json({ 
        message: 'Conflict detected', 
        conflict: {
          subjectId: conflict.subjectId,
          time: conflict.scheduledTime
        }
      });
    }

    const newVisit = await HubVisit.create({
      subjectId,
      trialId,
      visitType,
      scheduledDate: new Date(date),
      scheduledTime: time,
      state: 'standard',
      siteId: 'SITE-NY-001'
    });

    res.status(201).json(newVisit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSafetySummary = async (req, res) => {
  try {
    const siteId = 'SITE-NY-001'; 
    
    // Find all subjects at this site
    const subjects = await HubSubject.find({ site: siteId });
    
    let activeCount = 0;
    let aiFlaggedCount = 0;
    let resolvedInWindow = [];
    let saesThisMonth = 0;
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    for (const sub of subjects) {
      for (const ae of sub.adverse_events || []) {
        // Status checks
        if (ae.status !== 'Resolved') {
          activeCount++;
          if (ae.ai_flagged) {
            aiFlaggedCount++;
          }
        }
        
        if (ae.status === 'Resolved' && ae.resolution_date) {
          const resDate = new Date(ae.resolution_date);
          if (resDate >= ninetyDaysAgo) {
            resolvedInWindow.push({
              resolution_date: resDate,
              onset_date: ae.onset_date ? new Date(ae.onset_date) : resDate
            });
          }
        }
        
        if (ae.is_sae && ae.sponsor_report_date) {
          const repDate = new Date(ae.sponsor_report_date);
          if (repDate >= startOfMonth) {
            saesThisMonth++;
          }
        }
      }
    }
    
    let avgResolutionDays = null;
    if (resolvedInWindow.length > 0) {
      const totalDays = resolvedInWindow.reduce((acc, ae) => {
        const diffTime = Math.abs(ae.resolution_date - ae.onset_date);
        return acc + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }, 0);
      avgResolutionDays = Math.round(totalDays / resolvedInWindow.length);
    }
    
    res.json({
      total_active_aes: activeCount,
      ai_flagged_count: aiFlaggedCount,
      avg_resolution_days: avgResolutionDays,
      saes_this_month: saesThisMonth
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSafetyAnomalies = async (req, res) => {
  try {
    const siteId = 'SITE-NY-001';
    const anomaly = await HubSafetyAnomaly.findOne({ siteId, status: 'active' });
    
    if (!anomaly) {
      return res.json({ status: 'no_anomaly', payload: {} });
    }
    
    res.json({
      status: 'active',
      payload: anomaly
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAEList = async (req, res) => {
  try {
    const siteId = 'SITE-NY-001';
    const { status, severity, ai_flagged, trial_id, sort_by } = req.query;
    
    const subjects = await HubSubject.find({ site: siteId });
    let aes = [];
    let totalCount = 0;
    let flaggedCount = 0;
    
    for (const sub of subjects) {
      for (const ae of sub.adverse_events || []) {
        totalCount++;
        if (ae.ai_flagged) {
          flaggedCount++;
        }
        
        // Build AE object in format expected by frontend
        const aeObj = {
          _id: ae.ae_id,
          id: ae.ae_id,
          patientId: sub.patient_id,
          trialId: sub.trial,
          siteId: sub.site,
          aeType: ae.aeType || ae.field || 'Adverse Event',
          severityGrade: ae.severityGrade || (ae.severity === 'Critical' ? 4 : ae.severity === 'Warning' ? 3 : 2),
          severityLabel: ae.severityLabel || ae.severity || 'Moderate',
          onset_date: ae.onset_date || ae.flagged_at || new Date().toISOString(),
          awareness_date: ae.awareness_date || ae.flagged_at || new Date().toISOString(),
          status: ae.status || 'Active',
          is_sae: ae.is_sae || false,
          ai_flagged: ae.ai_flagged || false,
          late_report: ae.late_report || false,
          days_to_report: ae.days_to_report,
          resolution_date: ae.resolution_date,
          sponsor_report_date: ae.sponsor_report_date,
          description: ae.description
        };
        
        // Apply filters
        if (status && aeObj.status !== status) continue;
        if (severity && aeObj.severityLabel !== severity) continue;
        if (ai_flagged && aeObj.ai_flagged !== (ai_flagged === 'true')) continue;
        if (trial_id && aeObj.trialId !== trial_id) continue;
        
        aes.push(aeObj);
      }
    }
    
    // Sort
    if (sort_by === 'severity_grade') {
      aes.sort((a, b) => b.severityGrade - a.severityGrade);
    } else if (sort_by === 'status') {
      aes.sort((a, b) => a.status.localeCompare(b.status));
    } else {
      // Default: onset_date descending
      aes.sort((a, b) => new Date(b.onset_date) - new Date(a.onset_date));
    }
    
    res.json({
      aes,
      summary: {
        total_tracked: totalCount,
        ai_flagged: flaggedCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reportAE = async (req, res) => {
  try {
    const siteId = 'SITE-NY-001';
    const { patientId, trialId, aeType, severityGrade, onset_date, awareness_date, initialStatus, is_sae } = req.body;
    
    if (!patientId || !trialId || !aeType || !severityGrade || !onset_date || !awareness_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the subject in Clinical_Trial_Subject_Master
    const subject = await HubSubject.findOne({ patient_id: patientId });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Severity mapping
    const severityMap = { 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'Life-Threatening', 5: 'Fatal' };
    const severityLabel = severityMap[severityGrade] || 'Unknown';
    
    // Map severityGrade/severityLabel to general severity ('Critical' / 'Warning' / 'Mild' / 'Moderate' / 'Severe')
    let generalSeverity = 'Moderate';
    if (severityGrade >= 4) generalSeverity = 'Critical';
    else if (severityGrade === 3) generalSeverity = 'Severe';
    else if (severityGrade === 2) generalSeverity = 'Warning';
    else if (severityGrade === 1) generalSeverity = 'Mild';

    const reportDate = new Date();
    const awarenessDateObj = new Date(awareness_date);
    const onsetDateObj = new Date(onset_date);
    
    const daysToReport = Math.ceil((reportDate - awarenessDateObj) / (1000 * 60 * 60 * 24));
    
    let lateReport = false;
    let autoSAE = is_sae === true;
    
    if (severityGrade >= 3) {
      autoSAE = true; // Auto-determine SAE if grade >= 3 per requirement
    }
    
    if (autoSAE && daysToReport > 1) lateReport = true;
    if (!autoSAE && daysToReport > 7) lateReport = true;
    
    const ae_id = `AE-${Date.now()}`;
    const ae_status = initialStatus || 'Active';
    
    const newAE = {
      ae_id,
      severity: generalSeverity,
      description: `${aeType} reported by Site Incharge.`,
      data_type: 'Safety & Adverse Events',
      field: aeType,
      status: ae_status,
      flagged_at: onsetDateObj.toISOString(),
      
      // HubAE properties
      aeType,
      severityGrade,
      severityLabel,
      onset_date: onsetDateObj.toISOString(),
      resolution_date: null,
      awareness_date: awarenessDateObj.toISOString(),
      sponsor_report_date: autoSAE ? reportDate.toISOString() : null,
      is_sae: autoSAE,
      days_to_report: daysToReport,
      late_report: lateReport,
      ai_flagged: false
    };
    
    subject.adverse_events.push(newAE);
    await subject.save();
    
    // Audit Logging
    await HubAuditLog.create({
      userId: 'USER-SC-001',
      actionType: 'REPORT_AE',
      entityId: ae_id,
      details: { aeType, patientId, trialId }
    });
    
    res.status(201).json({
      _id: ae_id,
      id: ae_id,
      patientId,
      trialId,
      siteId,
      ...newAE
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.escalateToPI = async (req, res) => {
  try {
    const { aeIds, anomalyId, note } = req.body;
    
    if (!aeIds && !anomalyId) {
      return res.status(400).json({ error: 'Provide AE IDs or Anomaly ID' });
    }
    
    // Update statuses in Clinical_Trial_Subject_Master
    if (aeIds && aeIds.length > 0) {
      for (const aeId of aeIds) {
        const subject = await HubSubject.findOne({ "adverse_events.ae_id": aeId });
        if (subject) {
          const ae = subject.adverse_events.find(a => a.ae_id === aeId);
          if (ae) {
            ae.status = 'Escalated';
            // Set sponsor report date to now if escalated
            ae.sponsor_report_date = new Date().toISOString();
            await subject.save();
          }
        }
      }
    }
    
    const escalation = await HubEscalation.create({
      aeIds: aeIds || [],
      anomalyId: anomalyId || null,
      escalatingUserId: 'USER-SC-001',
      piUserId: 'USER-PI-001',
      note
    });
    
    // Audit Logging
    await HubAuditLog.create({
      userId: 'USER-SC-001',
      actionType: 'ESCALATE_TO_PI',
      entityId: escalation._id.toString(),
      details: { aeIds, anomalyId }
    });
    
    res.status(201).json({
      escalationId: escalation._id,
      piDetails: { id: 'USER-PI-001', name: 'Dr. Sarah Smith' },
      timestamp: escalation.timestamp
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getComplianceHealthScore = async (req, res) => {
  try {
    const siteId = 'SITE-NY-001';
    const scores = await HubComplianceScore.find({ siteId });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getComplianceRecommendations = async (req, res) => {
  try {
    const siteId = 'SITE-NY-001';
    const recommendations = await HubComplianceRecommendation.find({ siteId }).sort({ priorityRank: 1 });
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProtocolDeviations = async (req, res) => {
  try {
    const siteId = 'SITE-NY-001';
    const { status, trial_id } = req.query;

    let query = { siteId };
    if (status) query.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    if (trial_id) query.trialId = trial_id;

    const deviations = await HubProtocolDeviation.find(query)
      .sort({ severity: 1, loggedDate: 1 }); // Major (alphabetical/numeric) and oldest first

    const totalCount = await HubProtocolDeviation.countDocuments({ siteId });
    const unresolvedCount = await HubProtocolDeviation.countDocuments({ 
      siteId, 
      status: { $in: ['Unresolved', 'Deferred'] } 
    });

    res.json({
      deviations,
      summary: {
        total_count: totalCount,
        unresolved_count: unresolvedCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resolveDeviation = async (req, res) => {
  try {
    const { deviationId, resolution_note, resolved_by } = req.body;

    if (!resolution_note || resolution_note.length < 10) {
      return res.status(400).json({ error: 'Resolution note is required and must be at least 10 characters long.' });
    }

    const deviation = await HubProtocolDeviation.findByIdAndUpdate(
      deviationId,
      {
        status: 'Resolved',
        resolutionNote: resolution_note,
        resolvedBy: resolved_by,
        resolutionTimestamp: new Date()
      },
      { new: true }
    );

    if (!deviation) {
      return res.status(404).json({ error: 'Deviation not found' });
    }

    // Immutable Audit Log
    await HubAuditLog.create({
      userId: resolved_by || 'USER-SC-001',
      actionType: 'RESOLVE_DEVIATION',
      entityId: deviationId,
      details: { note: resolution_note }
    });

    res.json(deviation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deferDeviation = async (req, res) => {
  try {
    const { deviationId, deferral_reason, follow_up_date, userId } = req.body;

    if (!deferral_reason) {
      return res.status(400).json({ error: 'Deferral reason is required.' });
    }

    const deviation = await HubProtocolDeviation.findByIdAndUpdate(
      deviationId,
      {
        status: 'Deferred',
        deferralReason: deferral_reason,
        followUpDate: follow_up_date ? new Date(follow_up_date) : null
      },
      { new: true }
    );

    if (!deviation) {
      return res.status(404).json({ error: 'Deviation not found' });
    }

    // Immutable Audit Log
    await HubAuditLog.create({
      userId: userId || 'USER-SC-001',
      actionType: 'DEFER_DEVIATION',
      entityId: deviationId,
      details: { reason: deferral_reason, followUp: follow_up_date }
    });

    res.json(deviation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assessCompliance = async (req, res) => {
  try {
    const siteId = 'SITE-NY-001';
    const { userId } = req.body;

    // 1. Logic for "Visits completed within protocol window / Total scheduled visits"
    // For the demo, we will refresh the scores with small random fluctuations or logic-based updates
    const activeTrials = await HubTrial.find({ siteId, status: { $ne: 'Closeout' } });
    
    for (const trial of activeTrials) {
      const currentScoreObj = await HubComplianceScore.findOne({ trialId: trial.trialId, siteId });
      const prevScore = currentScoreObj ? currentScoreObj.overallScore : 85;
      
      // Calculate new score based on visits (Mocked for now based on requirement logic)
      // (Visits completed within window / Total scheduled visits)
      const totalVisits = await HubVisit.countDocuments({ trialId: trial.trialId, siteId });
      const compliantVisits = await HubVisit.countDocuments({ trialId: trial.trialId, siteId, state: 'standard' });
      
      let newScore = totalVisits > 0 ? Math.round((compliantVisits / totalVisits) * 100) : 100;
      
      // Edge case: if it drops more than 5%, we'll trigger a recommendation
      const wowChange = newScore - prevScore;
      
      let band = 'green';
      if (newScore < 75) band = 'red';
      else if (newScore < 90) band = 'amber';

      await HubComplianceScore.findOneAndUpdate(
        { trialId: trial.trialId, siteId },
        {
          overallScore: newScore,
          healthBand: band,
          weekOnWeekChange: wowChange,
          lastAssessmentDate: new Date(),
          componentScores: {
            visits: newScore,
            labs: Math.floor(Math.random() * 20) + 80,
            consent: 100,
            epro: Math.floor(Math.random() * 10) + 90
          }
        },
        { upsert: true, new: true }
      );

      if (wowChange <= -5) {
        await HubComplianceRecommendation.create({
          siteId,
          trialId: trial.trialId,
          recommendationType: 'score_drop',
          text: `Compliance for ${trial.trialId} dropped by ${Math.abs(wowChange)}% this week. Review missed visits.`,
          priorityRank: 1
        });
      }
    }

    // 2. Check for overdue Deferred deviations
    const overdueDeferred = await HubProtocolDeviation.find({
      siteId,
      status: 'Deferred',
      followUpDate: { $lt: new Date() }
    });

    for (const dev of overdueDeferred) {
      await HubComplianceRecommendation.create({
        siteId,
        trialId: dev.trialId,
        patientId: dev.subjectId,
        recommendationType: 'repeated_deviation', // Or create a new type if needed, using repeated for now
        text: `Deferred deviation for ${dev.subjectId} is past its follow-up date. Immediate resolution required.`,
        priorityRank: 2
      });
    }

    // Audit Log for Assessment
    await HubAuditLog.create({
      userId: userId || 'USER-SC-001',
      actionType: 'COMPLIANCE_ASSESSMENT',
      entityId: 'SITE-WIDE',
      details: { timestamp: new Date() }
    });

    const updatedScores = await HubComplianceScore.find({ siteId });
    const updatedRecs = await HubComplianceRecommendation.find({ siteId }).sort({ priorityRank: 1 });

    res.json({
      scores: updatedScores,
      recommendations: updatedRecs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
