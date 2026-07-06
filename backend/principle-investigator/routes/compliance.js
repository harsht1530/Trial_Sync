const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// Visit protocol window in days (default ±3 days)
const VISIT_WINDOW_DAYS = 3;

function isWithinWindow(scheduledDate, completedDate, windowDays) {
  const sched = new Date(scheduledDate).getTime();
  const comp = new Date(completedDate).getTime();
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  return Math.abs(comp - sched) <= windowMs;
}

function computeComplianceForSubject(subject, now) {
  const visits = subject.visit_schedule || [];
  if (visits.length === 0) return { score: 100, compliant: 0, total: 0, overdue: [], overdueCount: 0 };

  let compliantCount = 0;
  const overdueVisits = [];

  visits.forEach(v => {
    const schDate = new Date(v.scheduled_date);
    if (v.status === 'Completed') {
      // Completed — check if within window
      const completedDate = v.completed_date || v.completedAt || v.scheduled_date;
      if (isWithinWindow(v.scheduled_date, completedDate, VISIT_WINDOW_DAYS)) {
        compliantCount++;
      }
    } else if (v.status === 'Scheduled' && schDate < now) {
      // Overdue — was scheduled but date has passed and not completed
      const daysOverdue = Math.floor((now - schDate) / (1000 * 60 * 60 * 24));
      overdueVisits.push({
        visitId: v.visit_id,
        visitName: v.visit_name,
        scheduledDate: v.scheduled_date,
        daysOverdue,
        procedures: v.procedures || [],
        day: v.day
      });
    }
    // Future "Scheduled" visits are neutral — not yet due
  });

  const score = visits.length > 0
    ? Math.round((compliantCount / visits.length) * 100)
    : 100;

  return {
    score,
    compliant: compliantCount,
    total: visits.length,
    overdue: overdueVisits,
    overdueCount: overdueVisits.length
  };
}

// GET /api/compliance/summary
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const subjects = await Subject.find({});

    let totalCompliantVisits = 0;
    let totalVisits = 0;
    let totalDeviations = 0;
    let atRiskCount = 0;
    let onTrackCount = 0;

    const subjectScores = subjects.map(s => {
      const result = computeComplianceForSubject(s, now);
      totalCompliantVisits += result.compliant;
      totalVisits += result.total;
      totalDeviations += result.overdueCount;

      const isAtRisk = result.score < 80 || result.overdueCount > 0;
      if (isAtRisk) atRiskCount++;
      else onTrackCount++;

      return {
        patientId: s.patient_id,
        patientName: s.subject_name,
        trial: s.trial,
        site: s.site,
        phase: s.phase,
        score: result.score,
        compliantVisits: result.compliant,
        totalVisits: result.total,
        overdueCount: result.overdueCount,
        isAtRisk
      };
    });

    const overallScore = totalVisits > 0
      ? Math.round((totalCompliantVisits / totalVisits) * 100)
      : 100;

    // AI recommendation flag: simplified — flag if score < 80 or any overdue visits
    const aiFlags = [];
    if (totalDeviations > 0) {
      aiFlags.push({
        type: 'warning',
        message: `${totalDeviations} protocol deviation${totalDeviations > 1 ? 's' : ''} detected — ${atRiskCount} subject${atRiskCount > 1 ? 's' : ''} with overdue visits require immediate attention.`
      });
    }
    if (overallScore < 80) {
      aiFlags.push({
        type: 'critical',
        message: `Overall compliance score (${overallScore}%) is below the 80% threshold. Immediate action required.`
      });
    }

    res.json({
      overallScore,
      totalDeviations,
      atRiskSubjects: atRiskCount,
      onTrackSubjects: onTrackCount,
      totalSubjects: subjects.length,
      totalVisits,
      totalCompliantVisits,
      subjectScores,
      aiFlags
    });
  } catch (err) {
    console.error('Compliance summary error:', err);
    res.status(500).json({ error: 'Failed to fetch compliance summary' });
  }
});

// GET /api/compliance/deviations
router.get('/deviations', async (req, res) => {
  try {
    const now = new Date();
    const subjects = await Subject.find({});

    const deviations = [];

    subjects.forEach(s => {
      const visits = s.visit_schedule || [];
      visits.forEach(v => {
        const schDate = new Date(v.scheduled_date);
        if (v.status === 'Scheduled' && schDate < now) {
          const daysOverdue = Math.floor((now - schDate) / (1000 * 60 * 60 * 24));
          const severity = daysOverdue >= 7 ? 'critical' : daysOverdue >= 3 ? 'warning' : 'info';

          deviations.push({
            id: `DEV-${s.patient_id}-${v.visit_id}`,
            patientId: s.patient_id,
            patientName: s.subject_name,
            trial: s.trial,
            site: s.site,
            phase: s.phase,
            visitId: v.visit_id,
            visitName: v.visit_name,
            scheduledDate: v.scheduled_date,
            daysOverdue,
            severity,
            procedures: v.procedures || [],
            deviationType: 'Missed Visit',
            description: `${v.visit_name} was scheduled for ${new Date(v.scheduled_date).toLocaleDateString()} but has not been completed.`,
            status: 'open'
          });
        }
      });
    });

    // Sort by daysOverdue descending (most overdue first)
    deviations.sort((a, b) => b.daysOverdue - a.daysOverdue);

    res.json({ deviations, total: deviations.length });
  } catch (err) {
    console.error('Compliance deviations error:', err);
    res.status(500).json({ error: 'Failed to fetch protocol deviations' });
  }
});

module.exports = router;
