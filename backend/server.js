const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { piConn, spConn, hubConn } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["https://multiplierai.co", "http://localhost:5173", "http://localhost:5174", "http://localhost:8080", "http://localhost:8081"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));
app.use(express.json());

// --- Principle Investigator Routes ---
const subjectRoutes = require('./principle-investigator/routes/subjects');
const dashboardRoutes = require('./principle-investigator/routes/dashboard');
const validationRoutes = require('./principle-investigator/routes/validation');
const eproRoutes = require('./principle-investigator/routes/epro');
const communicationsRoutes = require('./principle-investigator/routes/communications');
const analyticsRoutes = require('./principle-investigator/routes/analytics');

app.use('/api/subjects', subjectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/epro', eproRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- Subject Panel Routes ---
const subjectPanelProfileRoutes = require('./subject-panel/routes/profile');
app.use('/api/subject-panel', subjectPanelProfileRoutes);

// --- Trial Copilot Hub Routes ---
const hubAgentRoutes = require('./trial-copilot-hub/routes/agent');
app.use('/api/hub', hubAgentRoutes);

// Server Listen
app.listen(PORT, () => {
  console.log(`Main Server running on port ${PORT}`);
});
