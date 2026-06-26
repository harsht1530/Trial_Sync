const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

router.get('/submissions', async (req, res) => {
  try {
    const { patientId = 'PT-001' } = req.query;

    // Fetch from Subject document
    const subject = await Subject.findOne({ patient_id: patientId });
    let submissions = [];
    if (subject && subject.epro_submissions) {
      submissions = subject.epro_submissions;
    }

    // Sort submissions by submittedAt desc
    submissions.sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    });

    const totalCompleted = submissions.filter(s => s.status === 'Completed').length;
    const totalPending = submissions.filter(s => s.status === 'Pending').length;
    const totalOverdue = submissions.filter(s => s.status === 'Overdue').length;

    // Compliance logic for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completed30Days = submissions.filter(s => {
      if (s.status !== 'Completed' || !s.submittedAt) return false;
      return new Date(s.submittedAt) >= thirtyDaysAgo;
    }).length;
    
    // For overdue, just count those marked Overdue (since we don't track deadline on array items strictly in seed)
    const overdue30Days = totalOverdue;

    const complianceBase = completed30Days + overdue30Days;
    const complianceRate = complianceBase > 0 ? Math.round((completed30Days / complianceBase) * 100) : (totalCompleted > 0 ? 100 : 0);

    res.json({
      submissions,
      summary: {
        totalCompleted,
        totalPending,
        totalOverdue,
        complianceRate
      }
    });
  } catch (err) {
    console.error('ePRO fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch ePRO records' });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers) {
      return res.status(400).json({ error: 'Answers are required' });
    }
    if (!req.user || !req.user.email) {
      return res.status(401).json({ error: 'Unauthorized: User email not found' });
    }

    // Find the subject by email in Clinical_Trial_Subject_Master
    const subject = await Subject.findOne({ "contact.email": req.user.email });
    if (!subject) {
      return res.status(404).json({ error: 'Subject record not found for logged in user' });
    }

    // Standard daily questionnaire questions
    const questions = [
      { id: 1, text: "How would you rate your overall energy level today?", type: "choice" },
      { id: 2, text: "Have you experienced any nausea in the past 24 hours?", type: "choice" },
      { id: 3, text: "How well did you sleep last night?", type: "choice" },
      { id: 4, text: "Have you noticed any changes in appetite?", type: "choice" },
      { id: 5, text: "Rate your pain level right now:", type: "choice" }
    ];

    const responses = questions.map(q => ({
      question: q.text,
      answer: answers[q.id] || "No response",
      type: q.type
    }));

    // Generate submission object
    const newSubmission = {
      id: `EPRO-${Date.now()}`,
      formName: "Daily Symptom Diary",
      submittedAt: new Date().toISOString(),
      status: "Completed",
      score: 80,
      maxScore: 100,
      phase: subject.phase || "Screening",
      responses: responses
    };

    if (!subject.epro_submissions) {
      subject.epro_submissions = [];
    }
    subject.epro_submissions.push(newSubmission);
    subject.markModified('epro_submissions');
    await subject.save();

    // Log the activity dynamically
    try {
      const Activity = require('../models/Activity');
      const initials = subject.subject_name ? subject.subject_name.split(' ').map(n => n[0]).join('') : 'SUB';
      await Activity.create({
        piId: subject.piId || 'PI-001',
        initials: initials,
        patient: subject.subject_name || subject.patient_id,
        type: 'ePRO Submission',
        outcome: 'completed',
        time: 'Just now'
      });
      console.log('ePRO submission activity logged successfully');
    } catch (actErr) {
      console.error('Error logging ePRO submission activity:', actErr);
    }

    res.json({ success: true, submission: newSubmission });
  } catch (err) {
    console.error('Error submitting ePRO questionnaire:', err);
    res.status(500).json({ error: 'Failed to submit ePRO questionnaire' });
  }
});

module.exports = router;
