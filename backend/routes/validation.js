const express = require('express');
const router = express.Router();
const ValidationFlag = require('../models/ValidationFlag');
const AuditEntry = require('../models/AuditEntry');

router.get('/flags', async (req, res) => {
  try {
    const { severity, status } = req.query;
    let query = {};
    if (severity && severity !== 'all') query.severity = severity;
    if (status && status !== 'all') query.status = status;
    
    const flags = await ValidationFlag.find(query).sort({ createdAt: -1 });
    
    const pending = await ValidationFlag.countDocuments({ status: 'pending' });
    const inReview = await ValidationFlag.countDocuments({ status: 'in_review' });
    const critical = await ValidationFlag.countDocuments({ severity: 'critical' });
    
    const total = await ValidationFlag.countDocuments();
    const resolved = await ValidationFlag.countDocuments({ status: { $in: ['resolved', 'corrected', 'approved'] } });
    const resolutionRate = total === 0 ? '0%' : Math.round((resolved / total) * 100) + '%';
    
    res.json({
      flags,
      summary: { pending, inReview, critical, resolutionRate }
    });
  } catch (err) {
    console.error('Error fetching validation flags:', err);
    res.status(500).json({ error: 'Failed to fetch validation flags' });
  }
});

router.post('/flags/:id/resolve', async (req, res) => {
  try {
    const { correctionValue, correctionNotes } = req.body;
    
    // Fetch original to track oldValue
    const existing = await ValidationFlag.findOne({ id: req.params.id });

    const flag = await ValidationFlag.findOneAndUpdate(
      { id: req.params.id },
      { 
        status: 'resolved',
        flaggedValue: correctionValue,
        issue: correctionNotes ? `Note: ${correctionNotes}` : undefined
      },
      { new: true }
    );
    if (!flag) return res.status(404).json({ error: 'Flag not found' });
    
    // Drop immutable audit log
    await AuditEntry.create({
      id: `AUD-${Date.now()}`,
      validationId: req.params.id,
      action: 'Correction Applied',
      performedBy: 'PI-001 Logged User',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      oldValue: existing ? existing.originalValue : 'N/A',
      newValue: correctionValue || 'N/A',
      notes: correctionNotes || 'Value corrected'
    });

    res.json(flag);
  } catch (err) {
    console.error('Error resolving flag:', err);
    res.status(500).json({ error: 'Failed to resolve flag' });
  }
});

router.post('/flags/:id/status', async (req, res) => {
  try {
    const { action } = req.body; 
    let newStatus, logAction;

    switch(action) {
      case 'approve': newStatus = 'approved'; logAction = 'Approved'; break;
      case 'reject': newStatus = 'rejected'; logAction = 'Rejected'; break;
      case 'start_review': newStatus = 'in_review'; logAction = 'Review Started'; break;
      case 'defer': newStatus = 'deferred'; logAction = 'Deferred'; break;
      case 'escalate': newStatus = 'escalated'; logAction = 'Escalated to PI'; break;
      default: return res.status(400).json({ error: 'Invalid action' });
    }

    const flag = await ValidationFlag.findOneAndUpdate(
      { id: req.params.id },
      { status: newStatus },
      { new: true }
    );
    if (!flag) return res.status(404).json({ error: 'Flag not found' });

    // Drop immutable audit log
    await AuditEntry.create({
      id: `AUD-${Date.now()}`,
      validationId: req.params.id,
      action: logAction,
      performedBy: 'PI-001 Logged User',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: `Flag manually ${newStatus} by Site Investigator`
    });

    res.json(flag);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update flag status' });
  }
});

router.get('/audit-trail', async (req, res) => {
  try {
    const { flag_id, date_range } = req.query;
    let query = {};
    if (flag_id) query.validationId = flag_id;
    
    const logs = await AuditEntry.find(query).sort({ _id: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract logs' });
  }
});

router.get('/audit-trail/export', async (req, res) => {
  try {
    const logs = await AuditEntry.find({}).sort({ _id: -1 });
    let csv = 'ID,Validation ID,Action,Performed By,Timestamp,Old Value,New Value,Notes\n';
    
    logs.forEach(log => {
      // Escape generic commas if exist within notes
      const cleanNotes = log.notes ? `"${log.notes.replace(/"/g, '""')}"` : '';
      const cleanOld = log.oldValue ? `"${log.oldValue.replace(/"/g, '""')}"` : '';
      const cleanNew = log.newValue ? `"${log.newValue.replace(/"/g, '""')}"` : '';
      
      csv += `${log.id},${log.validationId},${log.action},${log.performedBy},${log.timestamp},${cleanOld},${cleanNew},${cleanNotes}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="validation_audit_trail.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
