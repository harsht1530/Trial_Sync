require('dotenv').config();
const mongoose = require('mongoose');

// Models
const Subject = require('./models/Subject');
const Summary = require('./models/Summary');
const Trial = require('./models/Trial');
const Activity = require('./models/Activity');
const ValidationStat = require('./models/ValidationStat');
const EngagementStat = require('./models/EngagementStat');
const Prediction = require('./models/Prediction');
const MedicalHistory = require('./models/MedicalHistory');
const Reminder = require('./models/Reminder');
const WearableData = require('./models/WearableData');
const CallLog = require('./models/CallLog');
const ValidationFlag = require('./models/ValidationFlag');
const AuditEntry = require('./models/AuditEntry');
const EPROForm = require('./models/EPROForm');
const EPROSubmission = require('./models/EPROSubmission');

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const PI_ID = "PI-001";

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log(`Connected to MongoDB (${DB_NAME}) for seeding...`);

    // Drop collections
    const collections = [
      'Subject', 'Summary', 'Trial', 'Activity', 'ValidationStat', 
      'EngagementStat', 'Prediction', 'MedicalHistory', 'Reminder', 
      'WearableData', 'CallLog', 'ValidationFlag', 'AuditEntry', 
      'EPROForm', 'EPROSubmission'
    ];

    for (const modelName of collections) {
      try {
        const model = mongoose.model(modelName);
        await model.deleteMany({});
        console.log(`Cleared ${modelName} collection.`);
      } catch (e) {
        console.log(`Could not clear ${modelName}: ${e.message}`);
      }
    }

    console.log('Seeding Trials...');
    const trials = await Trial.insertMany([
      { piId: PI_ID, id: "ONCO-22", name: "Solid Tumor Phase II", phase: "II", status: "active", patients: 145, target: 200, progress: 72, sites: 4, startDate: "2024-01-15" },
      { piId: PI_ID, id: "CARDIO-09", name: "Chronic Heart Failure", phase: "III", status: "active", patients: 82, target: 150, progress: 54, sites: 3, startDate: "2024-02-10" },
      { piId: PI_ID, id: "NEURO-14", name: "Alzheimer's Early Detection", phase: "IV", status: "enrolling", patients: 28, target: 100, progress: 28, sites: 2, startDate: "2024-03-01" },
    ]);

    console.log('Seeding Summary...');
    await Summary.create({
      piId: PI_ID,
      totalPatients: "255",
      patientChange: "+12",
      validationRate: "94.2%",
      validationChange: "+2.1%",
      activeAlerts: "8",
      immediateAlerts: "3",
      engagementScore: "88",
      engagementChange: "+5",
    });

    console.log('Seeding Validation Stats...');
    await ValidationStat.insertMany([
      { piId: PI_ID, category: "Vitals", passed: 450, failed: 12, pending: 8, trend: "+5.2%", status: "healthy" },
      { piId: PI_ID, category: "Labs", passed: 320, failed: 24, pending: 15, trend: "-1.8%", status: "warning" },
      { piId: PI_ID, category: "ECG", passed: 180, failed: 5, pending: 2, trend: "+0.5%", status: "healthy" },
      { piId: PI_ID, category: "ePRO", passed: 560, failed: 45, pending: 30, trend: "-3.4%", status: "critical" },
    ]);

    console.log('Seeding Engagement Stats...');
    await EngagementStat.insertMany([
      { piId: PI_ID, channel: "Chatbot", interactions: 1250, response: "85%", trend: "+12%" },
      { piId: PI_ID, channel: "Voice Calls", interactions: 450, response: "92%", trend: "+5%" },
      { piId: PI_ID, channel: "SMS", interactions: 820, response: "78%", trend: "-2%" },
      { piId: PI_ID, channel: "Email", interactions: 310, response: "65%", trend: "+1%" },
    ]);

    console.log('Seeding Predictions...');
    await Prediction.insertMany([
      { piId: PI_ID, title: "Dropout Risk", value: "High", trend: "up", change: "+15%", description: "7 patients at risk in ONCO-22", color: "destructive", patients: 7 },
      { piId: PI_ID, title: "Adverse Events", value: "Normal", trend: "down", change: "-5%", description: "Trend decreasing across all sites", color: "success", patients: 2 },
      { piId: PI_ID, title: "Efficacy Signal", value: "Strong", trend: "up", change: "+8%", description: "Detected in CARDIO-09 cohort B", color: "primary", patients: 14 },
      { piId: PI_ID, title: "Compliance Score", value: "92%", trend: "up", change: "+3%", description: "Above target for 85% of subjects", color: "accent", patients: 22 },
    ]);

    console.log('Seeding EPRO Forms...');
    await EPROForm.insertMany([
      { formName: "Daily Symptom Tracker", trialPhase: "Daily", hasScore: true, maxScore: 10 },
      { formName: "Medication Adherence", trialPhase: "Weekly", hasScore: false, maxScore: 0 },
      { formName: "Quality of Life (SF-36)", trialPhase: "Monthly", hasScore: true, maxScore: 100 },
    ]);

    console.log('Seeding Subjects (25)...');
    const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris"];
    const sites = ["Site A", "Site B", "Site C", "Site D"];
    const trialIds = ["ONCO-22", "CARDIO-09", "NEURO-14"];
    const phases = ["Screening", "Treatment", "Follow-up"];
    const statuses = ["active", "active", "active", "review", "alert"]; // skewed towards active

    const subjectData = [];
    for (let i = 0; i < 25; i++) {
      const id = `PT-${(i + 1).toString().padStart(3, '0')}`;
      const name = `${firstNames[i]} ${lastNames[i]}`;
      const trial = trialIds[i % trialIds.length];
      const status = statuses[i % statuses.length];
      const riskLevel = i % 5 === 0 ? "high" : (i % 3 === 0 ? "medium" : "low");
      const age = 18 + Math.floor(Math.random() * 65);
      
      const sub = {
        piId: PI_ID,
        id,
        name,
        age,
        trial,
        phase: phases[i % phases.length],
        status,
        compliance: 70 + Math.floor(Math.random() * 30),
        lastVisit: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        riskLevel,
        site: sites[i % sites.length],
        gender: i % 2 === 0 ? "Male" : "Female",
        email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`,
        phone: `+1-555-01${Math.floor(10 + Math.random() * 89)}`,
        enrollmentDate: new Date(Date.now() - (180 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        address: `${100 + i} Clinical Way, Suite ${i + 1}`,
      };
      subjectData.push(sub);
    }

    const insertedSubjects = await Subject.insertMany(subjectData);

    console.log('Seeding Subject Details (MedicalHistory, Wearable, etc.)...');
    for (const sub of insertedSubjects) {
      // Medical History
      await MedicalHistory.create({
        patientId: sub.id,
        conditions: [
          { name: "Hypertension", diagnosedDate: "2020-05-12", status: "Managed" },
          { name: "Type 2 Diabetes", diagnosedDate: "2018-11-20", status: "Stable" }
        ],
        medications: [
          { name: "Lisinopril", dosage: "10mg", frequency: "Daily" },
          { name: "Metformin", dosage: "500mg", frequency: "Twice Daily" }
        ],
        allergies: [
          { allergen: "Penicillin", severity: "Severe", reaction: "Anaphylaxis" }
        ]
      });

      // Wearable Data
      await WearableData.create({
        patientId: sub.id,
        wearableInfo: {
          device: "Nexus Watch v2",
          lastSync: "10 minutes ago",
          batteryLevel: 85,
          connectionStatus: "Connected"
        },
        metrics: [
          { iconName: "Heart", label: "Heart Rate", value: "72", unit: "BPM", trend: "+2", trendColor: "text-destructive", bgColor: "bg-destructive/10", iconColor: "text-destructive" },
          { iconName: "Footprints", label: "Steps", value: "8,432", unit: "steps", trend: "+15%", trendColor: "text-success", bgColor: "bg-success/10", iconColor: "text-success" },
          { iconName: "Moon", label: "Sleep", value: "7.2", unit: "hrs", trend: "-5%", trendColor: "text-warning", bgColor: "bg-warning/10", iconColor: "text-warning" },
          { iconName: "Flame", label: "Calories", value: "2,140", unit: "kcal", trend: "+8%", trendColor: "text-success", bgColor: "bg-success/10", iconColor: "text-success" }
        ],
        recentReadings: [
          { time: "08:00 AM", heartRate: 68, steps: 120, activity: "Awake" },
          { time: "10:00 AM", heartRate: 75, steps: 1540, activity: "Walking" },
          { time: "12:00 PM", heartRate: 72, steps: 2100, activity: "Light" },
          { time: "02:00 PM", heartRate: 88, steps: 4200, activity: "Exercise" }
        ]
      });

      // Reminders - 4 per subject
      await Reminder.insertMany([
        {
          patientId: sub.id,
          name: "Morning Medication",
          message: "Time to take your doses.",
          scheduledTime: "08:00 AM",
          frequency: "Daily",
          channel: "CALL",
          status: "Active",
          nextTrigger: "Tomorrow 08:00 AM"
        },
        {
          patientId: sub.id,
          name: "Evening Medication",
          message: "Evening dose reminder.",
          scheduledTime: "08:00 PM",
          frequency: "Daily",
          channel: "SMS",
          status: "Active",
          nextTrigger: "Today 08:00 PM"
        },
        {
          patientId: sub.id,
          name: "Vitals Check",
          message: "Please record your blood pressure.",
          scheduledTime: "10:00 AM",
          frequency: "Weekly",
          channel: "All channels",
          status: "Active",
          nextTrigger: "Next Monday 10:00 AM"
        },
        {
          patientId: sub.id,
          name: "Follow-up Preparation",
          message: "Reminder for your upcoming site visit.",
          scheduledTime: "09:00 AM",
          frequency: "One-time",
          channel: "SMS",
          status: "Paused",
          nextTrigger: "2024-05-15 09:00 AM"
        }
      ]);

      // Call Logs - 4 per subject
      await CallLog.insertMany([
        {
          patientId: sub.id,
          direction: "Outbound",
          outcome: "Completed",
          reminderName: "Morning Medication",
          timestamp: "Today, 08:02 AM",
          duration: "1m 15s",
          notes: "Subject confirmed adherence."
        },
        {
          patientId: sub.id,
          direction: "Outbound",
          outcome: "No Answer",
          reminderName: "Evening Medication",
          timestamp: "Yesterday, 08:05 PM",
          duration: "0m 00s",
          notes: "System retried after 10 mins."
        },
        {
          patientId: sub.id,
          direction: "Inbound",
          outcome: "Completed",
          reminderName: "Manual Query",
          timestamp: "2 days ago, 02:30 PM",
          duration: "5m 20s",
          notes: "Subject called to report minor headache."
        },
        {
          patientId: sub.id,
          direction: "Outbound",
          outcome: "Scheduled",
          reminderName: "Follow-up Preparation",
          timestamp: "3 days ago, 11:00 AM",
          duration: "2m 10s",
          notes: "Appointment confirmed for next week."
        }
      ]);


      // EPRO Submissions - Create 3 completed and 1 pending to show compliance
      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000));
      const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));

      await EPROSubmission.insertMany([
        {
            patientId: sub.id,
            formName: "Daily Symptom Tracker",
            trialWeek: "Week 11",
            status: "Completed",
            submittedAt: tenDaysAgo.toISOString(),
            deadline: tenDaysAgo,
            score: 7,
            maxScore: 10,
            responses: [
              { question: "How would you rate your fatigue today?", answer: "3 (Moderate)", type: "scale" },
              { question: "Did you experience any dizziness?", answer: "No", type: "choice" }
            ]
        },
        {
            patientId: sub.id,
            formName: "Daily Symptom Tracker",
            trialWeek: "Week 12",
            status: "Completed",
            submittedAt: fiveDaysAgo.toISOString(),
            deadline: fiveDaysAgo,
            score: 8,
            maxScore: 10,
            responses: [
              { question: "How would you rate your fatigue today?", answer: "2 (Mild)", type: "scale" },
              { question: "Did you experience any dizziness?", answer: "No", type: "choice" }
            ]
        },
        {
            patientId: sub.id,
            formName: "Daily Symptom Tracker",
            trialWeek: "Week 12",
            status: "Pending",
            deadline: new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)), // Future
            maxScore: 10
        }
      ]);

    }

    console.log('Seeding Activities...');
    for (let i = 0; i < 10; i++) {
        const sub = insertedSubjects[i];
        await Activity.create({
            piId: PI_ID,
            initials: sub.name.split(' ').map(n => n[0]).join(''),
            patient: sub.name,
            type: i % 2 === 0 ? "Voice Check-in" : "ePRO Submission",
            outcome: "completed",
            time: `${i + 1}h ago`
        });
    }

    console.log('Seeding Validation Flags & Audit...');
    for (let i = 0; i < 5; i++) {
        const sub = insertedSubjects[i+5];
        const flag = await ValidationFlag.create({
            id: `FLAG-${2000 + i}`,
            patientId: sub.id,
            patientName: sub.name,
            dataType: "Vitals",
            field: "Systolic BP",
            originalValue: "185",
            flaggedValue: "185",
            issue: "Value exceeds safety threshold (>180)",
            severity: i === 0 ? "critical" : "warning",
            status: i % 2 === 0 ? "pending" : "in_review",
            flaggedAt: new Date(Date.now() - (i * 3600000)).toISOString(),
            trial: sub.trial
        });

        if (i % 2 !== 0) {
            await AuditEntry.create({
                id: `AUDIT-${3000 + i}`,
                validationId: flag.id,
                action: "Assigned for Review",
                performedBy: "System AI",
                timestamp: new Date().toISOString(),
                notes: "Automatically assigned based on protocol severity."
            });
        }
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
