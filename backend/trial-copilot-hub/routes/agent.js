const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');

router.get('/health', (req, res) => {
  res.json({ status: 'Trial Copilot Hub API is running' });
});

router.get('/agents', async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
