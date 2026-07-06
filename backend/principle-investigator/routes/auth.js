const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/Users');

const JWT_SECRET = process.env.JWT_SECRET || 'clinical_nexus_fallback_secret_key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      req.user = user;
      next();
    });
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// GET /api/auth/me - Get current authenticated user
router.get('/me', authenticateToken, (req, res) => {
  const { password, ...userWithoutPassword } = req.user.toObject();
  res.json({ user: userWithoutPassword });
});

// POST /api/auth/register - Register with email/password
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: role || 'Principal Investigator'
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/auth/login - Login with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'This user signed up with Google. Please use Google Sign-In.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (user.role === 'Subject') {
      const Subject = require('../models/Subject');
      if (!user.subject_id) {
        return res.status(403).json({ error: 'Subject not added' });
      }
      const subjectRecord = await Subject.findOne({ patient_id: user.subject_id });
      if (!subjectRecord) {
        return res.status(403).json({ error: 'Subject not added' });
      }
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// POST /api/auth/google - Login or sign up with Google
router.post('/google', async (req, res) => {
  try {
    const { token: idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    let payload;

    if (GOOGLE_CLIENT_ID && client) {
      // Real verification with Google Cloud Library
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        console.error('Google token verification failed:', verifyErr);
        return res.status(400).json({ error: 'Invalid Google token' });
      }
    } else {
      // Mock / Dev verification fallback if GOOGLE_CLIENT_ID is not configured
      console.warn('GOOGLE_CLIENT_ID not set. Parsing token dynamically for development mode.');
      try {
        // ID token is a JWT, let's decode it safely
        const base64Url = idToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          Buffer.from(base64, 'base64')
            .toString()
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        payload = JSON.parse(jsonPayload);
      } catch (parseErr) {
        console.error('Failed to decode mock/dev Google token:', parseErr);
        return res.status(400).json({ error: 'Invalid token format' });
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google user payload' });
    }

    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Auto-register the new user
      user = new User({
        name: name || 'Google User',
        email,
        googleId,
        role: req.body.role || 'Principal Investigator',
        phone: ''
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google Account to existing user
      user.googleId = googleId;
      await user.save();
    }

    if (user.role === 'Subject') {
      const Subject = require('../models/Subject');
      if (!user.subject_id) {
        return res.status(403).json({ error: 'Subject not added' });
      }
      const subjectRecord = await Subject.findOne({ patient_id: user.subject_id });
      if (!subjectRecord) {
        return res.status(403).json({ error: 'Subject not added' });
      }
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password, ...userWithoutPassword } = user.toObject();

    res.json({
      message: 'Google Sign-In successful',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// POST /api/auth/logout - Logout (Client simply deletes token, but keep route open)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = {
  router,
  authenticateToken
};
