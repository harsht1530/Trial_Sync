const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Trial = require('../models/Trial');

// Mock Authentication Middleware
const requirePiAuth = (req, res, next) => {
  req.user = { piId: 'PI-001' };
  next();
};

router.get('/', requirePiAuth, async (req, res) => {
  try {
    const { trial } = req.query;
    const piId = req.user.piId;

    // Base query for subjects - retrieve all subjects to match the list in Subjects section
    let subjects = await Subject.find({});
    let trials = await Trial.collection.find({}).toArray();

    // Mapping dropdown values / trial query params to nctId/id in Trial collection
    if (trial && trial !== 'all') {
      let targetNctIds = [];
      if (trial === 'ONCO-2024-A1' || trial === 'ONCO-22' || trial.toLowerCase().includes('onco')) {
        targetNctIds = ['NCT03816345'];
      } else if (trial === 'CARDIO-2024-B3' || trial === 'CARDIO-09' || trial.toLowerCase().includes('cardio')) {
        targetNctIds = ['NCT03644667'];
      } else if (trial === 'NEURO-2024-C2' || trial === 'NEURO-14' || trial.toLowerCase().includes('neuro')) {
        targetNctIds = ['t_neuro_2025_c1'];
      } else {
        // Fallback: search if trial matches any trial ID/NCT ID directly
        const matchedTrial = trials.find(t => t.id === trial || t.trialId === trial || t.nctId === trial || t.nct_id === trial);
        if (matchedTrial) {
          targetNctIds = [matchedTrial.nctId || matchedTrial.id];
        } else {
          targetNctIds = [trial];
        }
      }

      // Filter subjects whose trial field contains any of targetNctIds
      subjects = subjects.filter(s => {
        return targetNctIds.some(nct => s.trial && s.trial.includes(nct));
      });

      // Filter trials list for site performance
      trials = trials.filter(t => {
        return targetNctIds.some(nct => t.id === nct || t.nctId === nct || t.nct_id === nct || t.trialId === nct);
      });
    }

    // 1. Enrollment Over Time
    // Calculate monthly enrollment counts for the calendar year 2026 (Jan to Dec)
    const enrollmentOverTime = [];
    const year = 2026; 

    for (let month = 0; month < 12; month++) {
      const monthLabel = new Date(year, month, 1).toLocaleString('default', { month: 'short' });
      
      // Count subjects enrolled during this specific month
      const count = subjects.filter(s => {
        const enrollDateStr = s.enrollment_date || s.enrollmentDate;
        if (!enrollDateStr) return false;
        const enrollDate = new Date(enrollDateStr);
        return enrollDate.getFullYear() === year && enrollDate.getMonth() === month;
      }).length;

      enrollmentOverTime.push({ month: monthLabel, count });
    }

    // 2. Patient Demographics (Age Group)
    // Extract DOBs from subjects in Trial collection
    const dobMap = {};
    trials.forEach(t => {
      if (t.subjects && Array.isArray(t.subjects)) {
        t.subjects.forEach(subj => {
          if (subj.id) {
            dobMap[subj.id] = subj.dob;
          }
        });
      }
    });

    const ageGroups = [
      { range: "18-30", min: 0, max: 30, count: 0 },
      { range: "31-45", min: 31, max: 45, count: 0 },
      { range: "46-60", min: 46, max: 60, count: 0 },
      { range: "60+", min: 61, max: 200, count: 0 }
    ];

    subjects.forEach(s => {
      let age = s.age || 45; // Default fallback age
      const dobStr = dobMap[s.patient_id];
      if (dobStr) {
        const dobDate = new Date(dobStr);
        if (!isNaN(dobDate.getTime())) {
          const today = new Date(2026, 6, 6); // Project date July 2026
          let calculatedAge = today.getFullYear() - dobDate.getFullYear();
          const m = today.getMonth() - dobDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
            calculatedAge--;
          }
          age = calculatedAge;
        }
      }
      const group = ageGroups.find(g => age >= g.min && age <= g.max);
      if (group) group.count++;
    });

    const totalSubjects = subjects.length || 1;
    const demographics = ageGroups.map(g => ({
      group: g.range,
      count: g.count,
      percentage: Math.round((g.count / totalSubjects) * 100)
    }));

    // 3. Site Performance
    // Calculate metrics from leadSite, enrollmentTarget, and actual subjects array in Trial collection
    const sitePerformance = [];
    trials.forEach(t => {
      const siteName = t.leadSite;
      if (siteName) {
        const target = parseInt(t.enrollmentTarget, 10) || 0;
        const enrolled = t.subjects && Array.isArray(t.subjects) ? t.subjects.length : 0;
        sitePerformance.push({
          name: siteName,
          enrolled: enrolled,
          target: target
        });
      }
    });

    res.json({
      enrollmentOverTime,
      demographics,
      sitePerformance
    });

  } catch (err) {
    console.error('Analytics Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
