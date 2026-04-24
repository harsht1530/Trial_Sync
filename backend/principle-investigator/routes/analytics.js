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
    const { trial, date_range = '6m' } = req.query;
    const piId = req.user.piId;

    // Base query
    let query = { piId };
    if (trial && trial !== 'all') {
      query.trial = trial;
    }

    const subjects = await Subject.find(query);

    // 1. Enrollment Over Time
    // Determine how many months to go back
    const monthsBack = date_range === '12m' ? 12 : 6;
    const now = new Date();
    const enrollmentOverTime = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = targetDate.toLocaleString('default', { month: 'short' });
      
      // Count subjects enrolled on or before this month
      // In this mock, we assume enrollmentDate is a string like "Jan 15, 2024"
      const count = subjects.filter(s => {
        const enrollDate = new Date(s.enrollmentDate);
        return enrollDate <= new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      }).length;

      enrollmentOverTime.push({ month: monthLabel, count });
    }

    // 2. Patient Demographics
    const ageGroups = [
      { range: "18–30", min: 18, max: 30, count: 0 },
      { range: "31–45", min: 31, max: 45, count: 0 },
      { range: "46–60", min: 46, max: 60, count: 0 },
      { range: "60+", min: 61, max: 200, count: 0 }
    ];

    subjects.forEach(s => {
      const group = ageGroups.find(g => s.age >= g.min && s.age <= g.max);
      if (group) group.count++;
    });

    const totalSubjects = subjects.length || 1;
    const demographics = ageGroups.map(g => ({
      group: g.range,
      count: g.count,
      percentage: Math.round((g.count / totalSubjects) * 100)
    }));

    // 3. Site Performance
    // Aggregation by site
    const sites = ["Site A", "Site B", "Site C", "Site D"];
    // Hardcoded targets matching design spec (Site A highest, descending)
    const siteTargets = { "Site A": 80, "Site B": 60, "Site C": 45, "Site D": 30 };
    
    // Mapping for seed data site names to Site A/B/C/D
    const siteMapping = {
      "Boston Medical": "Site A",
      "NYC Research Center": "Site B",
      "Stanford Clinical": "Site C",
      "UCLA Health": "Site D"
    };

    const siteCounts = {};
    sites.forEach(site => siteCounts[site] = 0);

    subjects.forEach(s => {
      const mappedSite = siteMapping[s.site] || s.site;
      if (siteCounts.hasOwnProperty(mappedSite)) {
        siteCounts[mappedSite]++;
      }
    });

    const sitePerformance = sites.map(site => ({
      name: site,
      enrolled: siteCounts[site],
      target: siteTargets[site]
    }));

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
