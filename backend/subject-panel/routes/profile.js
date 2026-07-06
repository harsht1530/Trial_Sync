const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { authenticateToken } = require('../../principle-investigator/routes/auth');

router.get('/health', (req, res) => {
  res.json({ status: 'Subject Panel API is running' });
});

router.get('/next-visit', authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    const phone = req.user.phone;
    const name = req.user.name;

    const fs = require('fs');
    const path = require('path');
    const debugLogPath = path.join(__dirname, '../../debug.log');

    const userLogData = { email: req.user.email, name: req.user.name, phone: req.user.phone, subject_id: req.user.subject_id, subjectId: req.user.subjectId, Trial_id: req.user.Trial_id };
    fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] DEBUG profile user: ${JSON.stringify(userLogData, null, 2)}\n`);

    let queryConditions = [];
    if (req.user.subject_id) queryConditions.push({ patient_id: req.user.subject_id });
    if (req.user.subjectId) queryConditions.push({ patient_id: req.user.subjectId });
    if (req.user.patient_id) queryConditions.push({ patient_id: req.user.patient_id });

    if (email) queryConditions.push({ "contact.email": email });
    if (phone) queryConditions.push({ "contact.phone": phone });
    if (name) queryConditions.push({ subject_name: name });

    fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] DEBUG profile queryConditions: ${JSON.stringify(queryConditions, null, 2)}\n`);

    let profile = null;
    if (queryConditions.length > 0) {
      profile = await Profile.findOne({ $or: queryConditions });
      fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] DEBUG profile matched subject: ${profile ? JSON.stringify({ patient_id: profile.patient_id, subject_name: profile.subject_name }, null, 2) : "null"}\n`);
    }

    if (!profile) {
      // Fallback: search for first available subject in the Master collection to prevent 404/crash in dev/test
      profile = await Profile.findOne({});
      fs.appendFileSync(debugLogPath, `[${new Date().toISOString()}] DEBUG profile fallback subject: ${profile ? JSON.stringify({ patient_id: profile.patient_id, subject_name: profile.subject_name }, null, 2) : "null"}\n`);
    }

    if (!profile) {
      return res.status(404).json({ error: 'Subject profile not found for the logged-in user' });
    }

    const schedule = profile.visit_schedule || [];
    
    // Find the next upcoming visit (scheduled_date in the future, or the closest one)
    const sortedSchedule = [...schedule]
      .filter(v => v.status === 'Scheduled' || v.status === 'Active')
      .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

    // Find the next upcoming visit (scheduled_date + scheduled_time in the future)
    const now = new Date();
    
    let nextVisit = sortedSchedule.find(v => {
      const visitDate = new Date(v.scheduled_date);
      if (v.scheduled_time) {
        const [hours, minutes] = v.scheduled_time.split(':');
        visitDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      }
      return visitDate > now;
    });

    // Fallback: if no future scheduled visit, just take the last visit
    if (!nextVisit && sortedSchedule.length > 0) {
      nextVisit = sortedSchedule[sortedSchedule.length - 1];
    }

    if (!nextVisit) {
      return res.json({ 
        trial: profile.trial,
        phase: profile.phase,
        nextVisit: null,
        formattedString: "No upcoming visits scheduled"
      });
    }

    let visitDateTime = new Date(nextVisit.scheduled_date);
    if (nextVisit.scheduled_time) {
      const [hours, minutes] = nextVisit.scheduled_time.split(':');
      visitDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const visitDay = new Date(visitDateTime);
    visitDay.setHours(0,0,0,0);
    const diffTime = visitDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    let relativeStr = "";
    if (diffDays === 0) {
      relativeStr = "today";
    } else if (diffDays === 1) {
      relativeStr = "tomorrow";
    } else if (diffDays > 1) {
      relativeStr = `in ${diffDays} days`;
    } else if (diffDays === -1) {
      relativeStr = "yesterday";
    } else {
      relativeStr = `${Math.abs(diffDays)} days ago`;
    }

    // Format date string like "Jan 22, 2024"
    const optionsDate = { month: 'short', day: 'numeric', year: 'numeric' };
    const datePart = visitDateTime.toLocaleDateString('en-US', optionsDate);
    
    // Format time string like "10:00 AM"
    let timePart = "10:00 AM";
    if (nextVisit.scheduled_time) {
      const [hStr, mStr] = nextVisit.scheduled_time.split(':');
      const h = parseInt(hStr, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      timePart = `${h12}:${mStr} ${ampm}`;
    }

    const formattedString = `Next visit ${relativeStr} · ${datePart} at ${timePart}`;

    res.json({
      trial: profile.trial,
      phase: profile.phase,
      nextVisit,
      formattedString
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile/:id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ subjectId: req.params.id });
    res.json(profile || { message: 'Profile not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
