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
    { question: "How would you rate your overall energy level today?", answer: "Moderate", type: "choice" },
    { question: "Have you experienced any nausea in the past 24 hours?", answer: "None", type: "choice" },
    { question: "How well did you sleep last night?", answer: "Well", type: "choice" },
    { question: "Have you noticed any changes in appetite?", answer: "No change", type: "choice" },
    { question: "Rate your pain level right now:", answer: "Mild", type: "choice" }
  ]
};

async function seedEpro() {
  try {
    await mongoose.connect('mongodb+srv://gmbdashboardsupport_db_user:2YQePHIBoH4ABt4t@clinik.gvpxoln.mongodb.net/CLINIK?appName=Clinik');
    console.log("Connected to MongoDB.");

    const result = await Subject.updateOne(
      { patient_id: "VIJA-1602" },
      { $set: { epro_submissions: [mockEproSubmission] } }
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
