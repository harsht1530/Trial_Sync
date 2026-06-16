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

const getSubjectVisitSchedule = async (subject, weekStart) => {
  if (subject.visit_schedule && subject.visit_schedule.length > 0) {
    return subject.visit_schedule;
  }
  
  // For legacy subjects, align their visits relative to weekStart so they show on the current calendar week!
  const trial = await HubTrial.findOne({ $or: [{ id: subject.trial }, { trialId: subject.trial }] });
  const visitStructure = trial?.visit_structure && trial.visit_structure.length > 0 ? trial.visit_structure : [
    { id: "V1", name: "Visit 1", day: 0, procedures: ["Informed consent signed", "Inclusion & Exclusion Criteria"] },
    { id: "V2", name: "Safety follow up by phone", day: 7, procedures: ["Safety follow up by phone"] },
    { id: "V3", name: "Safety follow up by phone", day: 14, procedures: ["Safety follow up by phone"] },
    { id: "V4", name: "Visit 2", day: 28, procedures: ["Physical Examination", "Blood Sampling"] }
  ];

  let enrollment = subject.enrollment_date ? new Date(subject.enrollment_date) : new Date();
  if (enrollment < new Date("2026-01-01") && weekStart) {
    enrollment = new Date(weekStart);
  }

  const schedule = [];
  for (const v of visitStructure) {
    const dayOffset = v.day || 0;
    const scheduledDate = new Date(enrollment.getTime());
    scheduledDate.setDate(scheduledDate.getDate() + dayOffset);
    scheduledDate.setHours(9, 0, 0, 0);
    
    schedule.push({
      visit_id: v.id,
      visit_name: v.name,
      day: dayOffset,
      scheduled_date: scheduledDate.toISOString(),
      scheduled_time: "09:00",
      status: "Scheduled",
      procedures: v.procedures || []
    });
  }
  return schedule;
};

exports.getHealthSnapshot = async (req, res) => {
  try {
    const healthData = await HubSiteHealth.findOne().sort({ lastUpdated: -1 });
    if (!healthData) {
      return res.status(404).json({ message: 'Health snapshot data not found' });
    }
    
    // Count active subjects from Clinical_Trial_Subject_Master
    const activeCount = await HubSubject.countDocuments({ status: { $in: ['Active', 'active', 'Screening', 'On-treatment'] } });
    
    const responseData = healthData.toObject ? healthData.toObject() : healthData;
    responseData.activeSubjectCount = activeCount;

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveTrials = async (req, res) => {
  try {
    const trials = await HubTrial.find({ status: { $ne: 'Closeout' } }).lean();
    
    const result = await Promise.all(trials.map(async (trial) => {
      const computedTrialId = `${(trial.therapeuticArea || "ONCO").substring(0, 4).toUpperCase()}-${(trial.protocolNumber || "").toUpperCase()}`;
      const searchIdentifiers = [trial.protocolTitle, trial.trialId, trial.id, computedTrialId].filter(Boolean);
      
      const enrolledCount = await HubSubject.countDocuments({
        trial: { $in: searchIdentifiers }
      });

      return {
        ...trial,
        displayTitle: trial.protocolTitle || trial.name || trial.trialId,
        phase: trial.phase || 'Unknown Phase',
        status: trial.status || 'Active',
        enrolledCount: enrolledCount,
        targetCount: parseInt(trial.enrollmentTarget || trial.target || trial.targetCount || 0)
      };
    }));

    res.json(result);
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
    
    if (!trialId || !subjectId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const trial = await HubTrial.findOne({ $or: [{ id: trialId }, { trialId }] });
    if (!trial) {
      return res.status(400).json({ message: 'Invalid or inactive Trial ID' });
    }

    // Compute trial code: First 4 letters on therapeuticArea + "-"+ protocolNumber (all in capital)
    const therapeuticArea = trial.therapeuticArea || "ONCO";
    const protocolNumber = trial.protocolNumber || "2024-A1";
    const computedTrialId = `${therapeuticArea.substring(0, 4).toUpperCase()}-${protocolNumber.toUpperCase()}`;

    // Check by patient_id
    const existing = await HubSubject.findOne({ patient_id: subjectId, trial: computedTrialId });
    if (existing) {
      return res.status(409).json({ message: 'Subject already exists within this trial' });
    }

    // Find subject template in trial
    const subTemplate = (trial.subjects || []).find(s => s.id === subjectId);
    const subject_name = subTemplate ? `${subTemplate.firstName} ${subTemplate.lastName}` : `Subject ${subjectId}`;
    const dobVal = subTemplate?.dob || dob || "";
    const sexVal = subTemplate?.sex || sex || "";
    const phoneVal = subTemplate?.phone || phone || "";
    const emergencyName = subTemplate?.emergencyName || "";
    const emergencyPhone = subTemplate?.emergencyPhone || "";

    // Parse risk
    let riskVal = "Low";
    if (subTemplate?.risk) {
      if (subTemplate.risk.toLowerCase().includes("high")) riskVal = "High";
      else if (subTemplate.risk.toLowerCase().includes("medium")) riskVal = "Medium";
    }

    // Schedule visits based on visit_structure
    const visitStructure = trial.visit_structure && trial.visit_structure.length > 0 ? trial.visit_structure : [
      { id: "V1", name: "Visit 1", day: 0, procedures: ["Informed consent signed", "Inclusion & Exclusion Criteria", "Physical Examination"] },
      { id: "V2", name: "Safety follow up by phone", day: 7, procedures: ["Safety follow up by phone"] },
      { id: "V3", name: "Safety follow up by phone", day: 14, procedures: ["Safety follow up by phone"] },
      { id: "V4", name: "Visit 2", day: 28, procedures: ["Physical Examination", "Blood Sampling"] }
    ];

    const visit_schedule = [];
    const scheduledVisits = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 1); // schedule next of enrollment_date
    baseDate.setHours(9, 0, 0, 0); // default to 09:00 AM

    for (const v of visitStructure) {
      const dayOffset = v.day || 0;
      const scheduledDate = new Date(baseDate.getTime());
      scheduledDate.setDate(scheduledDate.getDate() + dayOffset);
      const timeStr = "09:00";

      visit_schedule.push({
        visit_id: v.id,
        visit_name: v.name,
        day: dayOffset,
        scheduled_date: scheduledDate.toISOString(),
        scheduled_time: timeStr,
        status: "Scheduled",
        procedures: v.procedures || []
      });

      scheduledVisits.push({
        subjectId: subjectId,
        trialId: computedTrialId,
        visitType: v.name,
        scheduledDate: scheduledDate,
        scheduledTime: timeStr,
        duration: 1,
        state: "standard",
        siteId: trial.leadSite || trial.siteId || "SITE-NY-001"
      });
    }

    // Insert to HubVisit collection
    await HubVisit.insertMany(scheduledVisits);

    // Save subject to Clinical_Trial_Subject_Master
    const finalTrialValue = trial.protocolTitle || computedTrialId;
    const newSubject = await HubSubject.create({
      piId: trial.piId || "PI-001",
      patient_id: subjectId,
      subject_name: subject_name,
      trial: finalTrialValue,
      site: trial.leadSite || trial.siteId || "SITE-NY-001",
      status: "Active",
      compliance: 0,
      risk: riskVal,
      last_activity: new Date().toISOString(),
      enrollment_date: new Date().toISOString(),
      phase: "Treatment",
      contact: {
        phone: phoneVal,
        email: ""
      },
      emergency_contact: {
        name: emergencyName,
        relationship: "Spouse",
        phone: emergencyPhone
      },
      medical_history: {
        conditions: [],
        current_medications: [],
        allergies: []
      },
      scheduled_reminders: [],
      recent_call_history: [],
      wearable_data: {
        device: {
          device_id: "",
          name: "",
          battery_percentage: 0,
          connection_status: "Disconnected",
          last_sync: ""
        },
        health_summary: {
          heart_rate: { value: 0, unit: "BPM", change_percentage: "0%" },
          steps: { value: 0, unit: "steps", change_percentage: "0%" },
          sleep: { value: 0, unit: "hrs", change_percentage: "0%" },
          calories: { value: 0, unit: "kcal", change_percentage: "0%" }
        },
        daily_step_goal: {
          completed_steps: 0,
          goal_steps: 10000,
          progress_percentage: 0
        },
        recent_readings: [],
        updated_at: ""
      },
      adverse_events: [],
      visit_schedule: visit_schedule,
      audit: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system_admin"
      }
    });

    res.status(201).json({
      subject: newSubject,
      scheduledVisits: visit_schedule
    });
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

    // Fetch all subjects from Clinical_Trial_Subject_Master
    const subjects = await HubSubject.find({});
    const weeklyVisits = [];

    for (const sub of subjects) {
      const schedule = await getSubjectVisitSchedule(sub, start);
      for (const v of schedule) {
        const vDate = new Date(v.scheduled_date);
        if (vDate >= start && vDate < end) {
          weeklyVisits.push({
            subjectId: sub.patient_id,
            trialId: sub.trial,
            visitType: v.visit_name,
            scheduledDate: v.scheduled_date,
            scheduledTime: v.scheduled_time,
            duration: 1,
            state: 'standard',
            procedures: v.procedures || []
          });
        }
      }
    }

    // Detect conflicts in weeklyVisits (same date and same time slot)
    const slotCounts = {};
    for (const v of weeklyVisits) {
      const d = new Date(v.scheduledDate).toISOString().split('T')[0];
      const slotKey = `${d} @ ${v.scheduledTime}`;
      slotCounts[slotKey] = (slotCounts[slotKey] || 0) + 1;
    }

    for (const v of weeklyVisits) {
      const d = new Date(v.scheduledDate).toISOString().split('T')[0];
      const slotKey = `${d} @ ${v.scheduledTime}`;
      if (slotCounts[slotKey] > 1) {
        v.state = 'conflict';
      }
    }

    res.json(weeklyVisits);
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

    // Fetch all subjects from Clinical_Trial_Subject_Master
    const subjects = await HubSubject.find({});
    const allVisits = [];

    for (const sub of subjects) {
      const schedule = await getSubjectVisitSchedule(sub, start);
      for (const v of schedule) {
        const vDate = new Date(v.scheduled_date);
        if (vDate >= start && vDate < end) {
          allVisits.push({
            subjectId: sub.patient_id,
            trialId: sub.trial,
            visitType: v.visit_name,
            scheduledDate: v.scheduled_date,
            scheduledTime: v.scheduled_time,
            procedures: v.procedures || []
          });
        }
      }
    }

    // Detect conflicts (two visits on the same date and time)
    const conflicts = [];
    
    for (let i = 0; i < allVisits.length; i++) {
      const v1 = allVisits[i];
      const d1 = new Date(v1.scheduledDate).toISOString().split('T')[0];
      const slotKey = `${d1} @ ${v1.scheduledTime}`;

      for (let j = i + 1; j < allVisits.length; j++) {
        const v2 = allVisits[j];
        const d2 = new Date(v2.scheduledDate).toISOString().split('T')[0];
        const slotKey2 = `${d2} @ ${v2.scheduledTime}`;

        if (slotKey === slotKey2) {
          conflicts.push({
            subjectId: v1.subjectId,
            trialId: v1.trialId,
            visitType: v1.visitType,
            scheduledDate: v1.scheduledDate,
            scheduledTime: v1.scheduledTime,
            state: 'conflict',
            conflictDetails: {
              conflictingSubjectId: v2.subjectId,
              conflictingVisitType: v2.visitType,
              resolutionRecommendedSlot: {
                // Recommend next day
                date: new Date(new Date(v1.scheduledDate).getTime() + 24 * 60 * 60 * 1000).toISOString(),
                time: v1.scheduledTime
              }
            }
          });
        }
      }
    }

    res.json(conflicts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rescheduleVisit = async (req, res) => {
  try {
    const { subjectId, visitName, newDate, newTime } = req.body;
    if (!subjectId || !visitName || !newDate || !newTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the subject
    const subject = await HubSubject.findOne({ patient_id: subjectId });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Update their visit_schedule
    let hasScheduleField = subject.visit_schedule && subject.visit_schedule.length > 0;
    
    // If they don't have stored visit_schedule yet (legacy subject), let's generate it
    let schedule = hasScheduleField ? subject.visit_schedule : await getSubjectVisitSchedule(subject, new Date(newDate));
    
    schedule = schedule.map(v => {
      if (v.visit_name === visitName) {
        const formattedDate = new Date(newDate);
        formattedDate.setHours(9, 0, 0, 0); // default hour
        return {
          ...v,
          scheduled_date: formattedDate.toISOString(),
          scheduled_time: newTime
        };
      }
      return v;
    });

    subject.visit_schedule = schedule;
    subject.markModified('visit_schedule');
    await subject.save();

    // Sync to HubVisit collection for calendar view
    const dateObj = new Date(newDate);
    const updatedVisit = await HubVisit.findOneAndUpdate(
      { subjectId: subjectId, visitType: visitName },
      {
        trialId: subject.trial || "Unknown",
        scheduledDate: dateObj,
        scheduledTime: newTime,
        state: 'standard',
        conflictDetails: null
      },
      { new: true, upsert: true }
    );

    res.json({
      message: "Visit rescheduled successfully",
      subject,
      updatedVisit
    });
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

    // Use start of current week as the base for legacy subjects
    const monday = new Date();
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    const subjects = await HubSubject.find({});
    let allScheduled = [];

    for (const sub of subjects) {
      const schedule = await getSubjectVisitSchedule(sub, monday);
      for (const v of schedule) {
        allScheduled.push({
          subjectId: sub.patient_id,
          trialId: sub.trial,
          visitType: v.visit_name,
          scheduledDate: v.scheduled_date,
          scheduledTime: v.scheduled_time,
          duration: 1,
          state: 'standard',
          procedures: v.procedures || []
        });
      }
    }

    // Sort by scheduledDate ascending
    allScheduled.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    // Filter to show only upcoming visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = allScheduled.filter(v => new Date(v.scheduledDate) >= today);

    res.json(upcoming.slice(0, limit));
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
    const { subjectId, visitName, date, time, procedures } = req.body;

    if (!subjectId || !visitName || !date || !time) {
      return res.status(400).json({ message: 'Missing required fields: subjectId, visitName, date, time' });
    }

    // Find the subject in Clinical_Trial_Subject_Master
    const subject = await HubSubject.findOne({ patient_id: subjectId });
    if (!subject) {
      return res.status(404).json({ message: `Subject '${subjectId}' not found` });
    }

    // Generate next visit_id (V1, V2, V3 …)
    const existingSchedule = subject.visit_schedule || [];
    const visitNums = existingSchedule
      .map(v => parseInt((v.visit_id || '').replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const nextNum = visitNums.length > 0 ? Math.max(...visitNums) + 1 : existingSchedule.length + 1;
    const visit_id = `V${nextNum}`;

    // Calculate day offset from enrollment date
    const enrollmentDate = subject.enrollment_date ? new Date(subject.enrollment_date) : new Date();
    const scheduledDateObj = new Date(date);
    const dayOffset = Math.round((scheduledDateObj - enrollmentDate) / (1000 * 60 * 60 * 24));

    const newVisitEntry = {
      visit_id,
      visit_name: visitName,
      day: Math.max(0, dayOffset),
      scheduled_date: scheduledDateObj.toISOString(),
      scheduled_time: time,
      status: 'Scheduled',
      procedures: Array.isArray(procedures) ? procedures : []
    };

    // Push into visit_schedule and save
    subject.visit_schedule.push(newVisitEntry);
    subject.markModified('visit_schedule');
    await subject.save();

    // Also mirror into HubVisit collection for the calendar view
    await HubVisit.create({
      subjectId,
      trialId: subject.trial || '',
      visitType: visitName,
      scheduledDate: scheduledDateObj,
      scheduledTime: time,
      state: 'standard',
      siteId: subject.site || 'SITE-NY-001'
    });

    res.status(201).json({
      message: 'Visit booked successfully',
      visit: newVisitEntry,
      subjectId,
      trialId: subject.trial
    });
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
