const express = require('express');
const router = express.Router();
const AuditEntry = require('../models/AuditEntry');
const Subject = require('../models/Subject');
const ValidationFlag = require('../models/ValidationFlag');
const Activity = require('../models/Activity');

router.get('/flags', async (req, res) => {
  try {
    const { severity, status } = req.query;
    
    // 1. Fetch flags from ValidationFlag collection
    const dbFlags = await ValidationFlag.find({});
    
    // Map dbFlags to the format expected by the frontend
    const flags = dbFlags.map(f => ({
      id: f.id,
      patientId: f.patientId,
      patientName: f.patientName,
      dataType: f.dataType || 'Vitals',
      field: f.field,
      originalValue: f.originalValue || 'N/A',
      flaggedValue: f.flaggedValue || 'N/A',
      issue: f.issue || 'N/A',
      severity: f.severity || 'warning',
      status: f.status || 'pending',
      flaggedAt: f.flaggedAt || f.createdAt || new Date().toISOString(),
      trial: f.trial
    }));
    
    // 2. Fetch flags from Subject's adverse_events for backward compatibility
    const subjects = await Subject.find({});
    for (const sub of subjects) {
      for (const ae of sub.adverse_events || []) {
        // Avoid duplicates if already mapped
        if (flags.some(f => f.id === ae.ae_id)) continue;
        
        let mappedSeverity = 'info';
        if (ae.severity === 'Critical' || ae.severity === 'Severe') {
          mappedSeverity = 'critical';
        } else if (ae.severity === 'Warning' || ae.severity === 'Moderate') {
          mappedSeverity = 'warning';
        }
        
        // Normalize status for frontend
        let mappedStatus = 'pending';
        if (ae.status) {
          const s = ae.status.toLowerCase().replace(' ', '_');
          if (['pending', 'in_review', 'corrected', 'approved', 'rejected', 'resolved', 'deferred', 'escalated'].includes(s)) {
            mappedStatus = s;
          } else if (s === 'under_review') {
            mappedStatus = 'in_review';
          }
        }
        
        flags.push({
          id: ae.ae_id,
          patientId: sub.patient_id,
          patientName: sub.subject_name,
          dataType: ae.data_type || 'Safety & Adverse Events',
          field: ae.field || 'Adverse Event',
          originalValue: ae.description || 'N/A',
          flaggedValue: ae.description || 'N/A',
          issue: ae.description || 'N/A',
          severity: mappedSeverity,
          status: mappedStatus,
          flaggedAt: ae.flagged_at || new Date().toISOString(),
          trial: sub.trial
        });
      }
    }
    
    // Filter flags based on query
    let filteredFlags = flags;
    if (severity && severity !== 'all') {
      filteredFlags = filteredFlags.filter(f => f.severity === severity.toLowerCase());
    }
    if (status && status !== 'all') {
      filteredFlags = filteredFlags.filter(f => f.status === status.toLowerCase().replace(' ', '_'));
    }
    
    // Sort by date descending
    filteredFlags.sort((a, b) => new Date(b.flaggedAt) - new Date(a.flaggedAt));
    
    // Calculations for the Validation Stats Summary widgets
    const pending = flags.filter(f => f.status === 'pending').length;
    const inReview = flags.filter(f => f.status === 'in_review').length;
    const critical = flags.filter(f => f.severity === 'critical').length;
    const total = flags.length;
    const resolved = flags.filter(f => ['resolved', 'corrected', 'approved'].includes(f.status)).length;
    const resolutionRate = total === 0 ? '0%' : Math.round((resolved / total) * 100) + '%';
    
    res.json({
      flags: filteredFlags,
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
    let patientId, patientName, trial, originalValue, severity = 'warning', dataType = 'Vitals', field = 'Systolic BP';
    
    // 1. Try to find and update in ValidationFlag collection
    let flagDoc = await ValidationFlag.findOne({ id: req.params.id });
    if (flagDoc) {
      flagDoc.status = 'resolved';
      flagDoc.flaggedValue = correctionValue;
      if (correctionNotes) {
        flagDoc.issue = `${correctionValue} (Notes: ${correctionNotes})`;
      }
      await flagDoc.save();
      
      patientId = flagDoc.patientId;
      patientName = flagDoc.patientName;
      trial = flagDoc.trial;
      originalValue = flagDoc.originalValue;
      severity = flagDoc.severity;
      dataType = flagDoc.dataType;
      field = flagDoc.field;
    }
    
    // 2. Try to find/update in Subject collection (either as AE or check if AE corresponds to FLAG)
    const subject = await Subject.findOne({ 
      $or: [
        { "adverse_events.ae_id": req.params.id },
        { patient_id: patientId }
      ]
    });
    
    if (subject) {
      const ae = subject.adverse_events.find(a => a.ae_id === req.params.id);
      if (ae) {
        originalValue = ae.description;
        ae.status = 'Resolved';
        ae.description = correctionNotes ? `${correctionValue} (Notes: ${correctionNotes})` : correctionValue;
        subject.markModified('adverse_events');
        await subject.save();
      }
      patientId = subject.patient_id;
      patientName = subject.subject_name;
      trial = subject.trial;
    }
    
    if (!flagDoc && !subject) {
      return res.status(404).json({ error: 'Flag not found' });
    }
    
    // Save dynamic activity to the Activity collection
    try {
      const initials = patientName ? patientName.split(' ').map(n => n[0]).join('') : 'SUB';
      await Activity.create({
        piId: 'PI-001',
        initials: initials,
        patient: patientName || patientId,
        type: 'Correction Applied',
        outcome: 'completed',
        time: 'Just now'
      });
    } catch (actErr) {
      console.error('Error logging validation activity:', actErr);
    }
    
    // Drop immutable audit log
    await AuditEntry.create({
      id: `AUD-${Date.now()}`,
      validationId: req.params.id,
      action: 'Correction Applied',
      performedBy: 'PI-001 Logged User',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      oldValue: originalValue,
      newValue: correctionValue || 'N/A',
      notes: correctionNotes || 'Value corrected'
    });

    res.json({ success: true });
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

    let patientId, patientName, trial;

    // 1. Try to find and update in ValidationFlag collection
    let flagDoc = await ValidationFlag.findOne({ id: req.params.id });
    if (flagDoc) {
      flagDoc.status = newStatus;
      await flagDoc.save();
      patientId = flagDoc.patientId;
      patientName = flagDoc.patientName;
      trial = flagDoc.trial;
    }

    // 2. Try to find and update in Subject collection
    const subject = await Subject.findOne({
      $or: [
        { "adverse_events.ae_id": req.params.id },
        { patient_id: patientId }
      ]
    });

    if (subject) {
      const ae = subject.adverse_events.find(a => a.ae_id === req.params.id);
      if (ae) {
        const capitalizedStatus = newStatus.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        ae.status = capitalizedStatus;
        subject.markModified('adverse_events');
        await subject.save();
      }
      patientId = subject.patient_id;
      patientName = subject.subject_name;
      trial = subject.trial;
    }

    if (!flagDoc && !subject) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    // Save dynamic activity to the Activity collection
    try {
      const initials = patientName ? patientName.split(' ').map(n => n[0]).join('') : 'SUB';
      await Activity.create({
        piId: 'PI-001',
        initials: initials,
        patient: patientName || patientId,
        type: `Status: ${logAction}`,
        outcome: 'completed',
        time: 'Just now'
      });
    } catch (actErr) {
      console.error('Error logging status activity:', actErr);
    }

    // Drop immutable audit log
    await AuditEntry.create({
      id: `AUD-${Date.now()}`,
      validationId: req.params.id,
      action: logAction,
      performedBy: 'PI-001 Logged User',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: `Flag manually ${newStatus} by Site Investigator`
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update flag status' });
  }
});

router.get('/audit-trail', async (req, res) => {
  try {
    const { flag_id } = req.query;
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
