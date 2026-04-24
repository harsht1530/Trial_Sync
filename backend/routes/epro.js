const express = require('express');
const router = express.Router();
const EPROSubmission = require('../models/EPROSubmission');

router.get('/submissions', async (req, res) => {
  try {
    const { patientId = 'PT-001' } = req.query;

    // Automatically transition Pending -> Overdue locally
    await EPROSubmission.updateMany(
      { status: 'Pending', deadline: { $lt: new Date() } },
      { $set: { status: 'Overdue' } }
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const submissions = await EPROSubmission.find({ patientId }).sort({ deadline: -1, _id: -1 });

    const totalCompleted = await EPROSubmission.countDocuments({ patientId, status: 'Completed' });
    const totalPending = await EPROSubmission.countDocuments({ patientId, status: 'Pending' });
    const totalOverdue = await EPROSubmission.countDocuments({ patientId, status: 'Overdue' });

    // Compliance logic for last 30 days
    const completed30Days = await EPROSubmission.countDocuments({ 
      patientId, 
      status: 'Completed', 
      deadline: { $gte: thirtyDaysAgo } 
    });
    const overdue30Days = await EPROSubmission.countDocuments({ 
      patientId, 
      status: 'Overdue', 
      deadline: { $gte: thirtyDaysAgo } 
    });

    const complianceBase = completed30Days + overdue30Days;
    const complianceRate = complianceBase > 0 ? Math.round((completed30Days / complianceBase) * 100) : 0;

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

module.exports = router;
