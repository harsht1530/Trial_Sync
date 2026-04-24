const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const subjectRoutes = require('./routes/subjects');
const dashboardRoutes = require('./routes/dashboard');
const validationRoutes = require('./routes/validation');
const eproRoutes = require('./routes/epro');
const communicationsRoutes = require('./routes/communications');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/subjects', subjectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/epro', eproRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/analytics', analyticsRoutes);

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

mongoose.connect(MONGO_URI, { dbName: DB_NAME })
  .then(() => {
    console.log(`Connected to MongoDB (${DB_NAME})`);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
