const mongoose = require('mongoose');
const Subject = require('./principle-investigator/models/Subject');

const mockEproSubmission = {
  id: "EPRO-1001",
  formName: "Daily Symptom Diary",
  submittedAt: new Date().toISOString(),
  status: "Completed",
  score: 85,
  maxScore: 100,
  phase: "Screening",
  responses: [
    {
      question: "How would you rate your overall fatigue today?",
      answer: "Mild",
      type: "choice"
    },
    {
      question: "Any new symptoms to report?",
      answer: "Slight headache in the morning.",
      type: "text"
    },
    {
      question: "Pain scale (1-10)",
      answer: "3",
      type: "scale"
    }
  ]
};

async function seedEpro() {
  try {
    await mongoose.connect('mongodb+srv://gmbdashboardsupport_db_user:2YQePHIBoH4ABt4t@clinik.gvpxoln.mongodb.net/CLINIK?appName=Clinik');
    console.log("Connected to MongoDB.");

    const result = await Subject.updateOne(
      { patient_id: "VIJA-1602" },
      { $push: { epro_submissions: mockEproSubmission } }
    );
    
    if (result.matchedCount > 0) {
      console.log("Successfully seeded ePRO submission for VIJA-1602.");
    } else {
      console.log("Patient VIJA-1602 not found.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedEpro();
