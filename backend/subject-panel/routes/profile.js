const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

router.get('/health', (req, res) => {
  res.json({ status: 'Subject Panel API is running' });
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
