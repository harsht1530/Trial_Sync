require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Unified DB setup
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/CLINIK';
const DB_NAME = 'CLINIK';

// Import Models
const Trial = require('./principle-investigator/models/Trial');
const Users = require('./principle-investigator/models/Users');
const Subject = require('./principle-investigator/models/Subject');
const Summary = require('./principle-investigator/models/Summary');
const Activity = require('./principle-investigator/models/Activity');
const ValidationStat = require('./principle-investigator/models/ValidationStat');
const EngagementStat = require('./principle-investigator/models/EngagementStat');
const Prediction = require('./principle-investigator/models/Prediction');

// Import Other Models (Using connection references internally, now all unified on CLINIK default connection)
const ValidationFlag = require('./principle-investigator/models/ValidationFlag');
const AuditEntry = require('./principle-investigator/models/AuditEntry');
const HubSiteHealth = require('./trial-copilot-hub/models/HubSiteHealth');
const HubInsight = require('./trial-copilot-hub/models/HubInsight');
const HubAction = require('./trial-copilot-hub/models/HubAction');
const HubActivity = require('./trial-copilot-hub/models/HubActivity');
const HubVisit = require('./trial-copilot-hub/models/HubVisit');
const HubAE = require('./trial-copilot-hub/models/HubAE');
const HubSafetyAnomaly = require('./trial-copilot-hub/models/HubSafetyAnomaly');
const HubComplianceScore = require('./trial-copilot-hub/models/HubComplianceScore');
const HubProtocolDeviation = require('./trial-copilot-hub/models/HubProtocolDeviation');
const HubComplianceRecommendation = require('./trial-copilot-hub/models/HubComplianceRecommendation');

const SITE_ID = "SITE-NY-001";
const PI_ID = "PI-001";

const seedMasterData = async () => {
  try {
    console.log(`Connecting to Master Database: ${DB_NAME} at ${MONGO_URI} ...`);
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log('Connected!');

    // Clear all collections
    const collectionsToClear = [
      Trial, Users, Subject, ValidationFlag, AuditEntry, HubSiteHealth,
      HubInsight, HubAction, HubActivity, HubVisit, HubAE, HubSafetyAnomaly,
      HubComplianceScore, HubProtocolDeviation, HubComplianceRecommendation,
      Summary, ValidationStat, EngagementStat, Prediction, Activity
    ];

    for (const model of collectionsToClear) {
      try {
        await model.deleteMany({});
        console.log(`Cleared ${model.modelName} collection.`);
      } catch (e) {
        console.log(`Could not clear ${model.modelName}: ${e.message}`);
      }
    }

    console.log('\nSeeding Trials...');
    const trials = await Trial.insertMany([
      { trialId: "TRIAL-ASTHMA-2025", id: "TRIAL-ASTHMA-2025", name: "Asthma Protocol Study", phase: "Phase 3", status: "Recruiting", enrolledCount: 10, targetCount: 50, siteId: "Apollo Research Center - Hyderabad", patients: 10, target: 50, progress: 20, sites: 1, startDate: "2025-01-10" },
      { trialId: "ONCO-2024-A1", id: "ONCO-2024-A1", name: "Solid Tumor Phase II", phase: "II", status: "active", patients: 145, target: 200, progress: 72, sites: 4, startDate: "2024-01-15", enrolledCount: 68, targetCount: 120, siteId: SITE_ID },
      { trialId: "CARDIO-2025-B3", id: "CARDIO-2025-B3", name: "Chronic Heart Failure", phase: "III", status: "active", patients: 82, target: 150, progress: 54, sites: 3, startDate: "2024-02-10", enrolledCount: 45, targetCount: 50, siteId: SITE_ID },
      { trialId: "NEURO-2025-C1", id: "NEURO-2025-C1", name: "Alzheimer's Early Detection", phase: "IV", status: "enrolling", patients: 28, target: 100, progress: 28, sites: 2, startDate: "2024-03-01", enrolledCount: 12, targetCount: 40, siteId: SITE_ID },
      { trialId: "ENDO-2024-D2", id: "ENDO-2024-D2", name: "Endocrine Phase III", phase: "III", status: "Closeout", patients: 98, target: 100, progress: 98, sites: 5, startDate: "2023-11-20", enrolledCount: 98, targetCount: 100, siteId: SITE_ID }
    ]);
    console.log(`Seeded ${trials.length} trials.`);

    console.log('\nSeeding Users (All Roles with hashed passwords)...');

    // Pre-hash all passwords
    const hashPassword = async (plain) => bcrypt.hash(plain, 10);
    const piPassword     = await hashPassword('PI@TrialSync2025');
    const siPassword     = await hashPassword('Site@TrialSync2025');
    const scPassword     = await hashPassword('Coord@TrialSync2025');
    const subPassword    = await hashPassword('Subject@TrialSync2025');

    const users = await Users.insertMany([
      {
        name: "Dr. Sarah Smith",
        phone: "+1-555-123-4567",
        email: "sarah.smith@clinik.com",
        password: piPassword,
        role: "Principal Investigator",
        scheduled_reminders: [
          {
            reminder_id: "REM-PI-01",
            title: "Review Serious Adverse Events",
            description: "Review safety escalations for ONCO-2024-A1.",
            status: "Active",
            is_enabled: true,
            time: "09:00 AM",
            frequency: "Daily",
            delivery_channel: "EMAIL",
            next_schedule: "2026-05-27T09:00:00Z",
            created_at: "2026-05-26T08:00:00Z"
          }
        ],
        recent_call_history: [
          {
            call_id: "CALL-PI-01",
            call_type: "Outbound Call",
            reminder_name: "Weekly CRC Sync",
            status: "Completed",
            message: "Aligned on protocol waivers.",
            call_datetime: "2026-05-25T14:30:00Z",
            duration: "10m 15s",
            channel: "Voice Call"
          }
        ],
        conversationsHistory: {
          last_session_id: "SESS-PI-999",
          chat_log: [
            { sender: "AI Copilot", message: "Hi Dr. Sarah, 3 patients have been flagged for review.", timestamp: "2026-05-26T10:00:00Z" },
            { sender: "Dr. Sarah Smith", message: "Acknowledge, checking details.", timestamp: "2026-05-26T10:05:00Z" }
          ]
        }
      },
      {
        name: "Maria Coordinator",
        phone: "+1-555-987-6543",
        email: "maria@clinik.com",
        password: siPassword,
        role: "Site Incharge",
        scheduled_reminders: [
          {
            reminder_id: "REM001",
            title: "Morning Medication",
            description: "Time to take your morning medicines.",
            status: "Active",
            is_enabled: true,
            time: "08:00 AM",
            frequency: "Daily",
            delivery_channel: "CALL",
            next_schedule: "2025-08-26T08:00:00Z",
            created_at: "2025-08-20T08:00:00Z"
          }
        ],
        recent_call_history: [
          {
            call_id: "CALL001",
            call_type: "Outbound Call",
            reminder_name: "Morning Medication",
            status: "Completed",
            message: "Subject confirmed medication adherence.",
            call_datetime: "2025-08-25T08:02:00Z",
            duration: "1m 20s",
            channel: "Voice Call"
          }
        ],
        conversationsHistory: {
          active_sessions: [
            {
              session_id: "SESS001",
              topic: "Medication Adherence",
              messages: [
                { sender: "Maria", text: "Please confirm if you took morning pill.", timestamp: "2025-08-25T08:00:00Z" },
                { sender: "Subject", text: "Yes, just took it now.", timestamp: "2025-08-25T08:02:00Z" }
              ]
            }
          ]
        }
      },
      {
        name: "Alex Rodriguez",
        phone: "+1-555-321-7890",
        email: "alex.rodriguez@clinik.com",
        password: scPassword,
        role: "Site Coordinator",
        scheduled_reminders: [],
        recent_call_history: [],
        conversationsHistory: {}
      },
      {
        name: "John Carter",
        phone: "+91-9876543210",
        email: "john.carter@example.com",
        password: subPassword,
        role: "Subject",
        scheduled_reminders: [
          {
            reminder_id: "REM-SUB-01",
            title: "Morning Medication",
            description: "Time to take your morning medicines.",
            status: "Active",
            is_enabled: true,
            time: "08:00 AM",
            frequency: "Daily",
            delivery_channel: "CALL",
            next_schedule: "2025-08-26T08:00:00Z",
            created_at: "2025-08-20T08:00:00Z"
          }
        ],
        recent_call_history: [],
        conversationsHistory: {}
      }
    ]);
    console.log(`Seeded ${users.length} users with hashed passwords.`);

    // Print credentials summary
    console.log('\n===== SEEDED LOGIN CREDENTIALS =====');
    console.log('Principal Investigator : sarah.smith@clinik.com  / PI@TrialSync2025');
    console.log('Site Incharge          : maria@clinik.com         / Site@TrialSync2025');
    console.log('Site Coordinator       : alex.rodriguez@clinik.com / Coord@TrialSync2025');
    console.log('Subject                : john.carter@example.com  / Subject@TrialSync2025');
    console.log('=====================================\n');

    console.log('\nSeeding 25 Master Clinical Trial Subjects...');
    const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris"];
    const sites = [SITE_ID, "SITE-CA-002", "SITE-TX-003"];
    const trialIds = ["ONCO-2024-A1", "CARDIO-2025-B3", "NEURO-2025-C1"];
    const phases = ["Screening", "Treatment", "Follow-up"];
    const statuses = ["Active", "Active", "Active", "Inactive", "Completed"];
    const risks = ["High", "Medium", "Low"];

    const subjectsData = [
      {
        piId: PI_ID,
        patient_id: "PAT1001",
        subject_name: "John Carter",
        trial: "TRIAL-ASTHMA-2025",
        site: "Apollo Research Center - Hyderabad",
        status: "Active",
        compliance: 92,
        risk: "Medium",
        last_activity: "2025-08-25T09:30:00Z",
        enrollment_date: "2025-01-10T10:00:00Z",
        phase: "Treatment",
        contact: {
          phone: "+91-9876543210",
          email: "john.carter@example.com"
        },
        emergency_contact: {
          name: "Emily Carter",
          relationship: "Spouse",
          phone: "+91-9988776655"
        },
        medical_history: {
          conditions: [
            {
              condition_name: "Hypertension",
              diagnosed_at: "2020-05-12",
              status: "Managed"
            },
            {
              condition_name: "Type 2 Diabetes",
              diagnosed_at: "2019-08-20",
              status: "Stable"
            }
          ],
          current_medications: [
            {
              drug_name: "Lisinopril",
              dosage_mg: 10,
              intake_frequency: "Twice Daily"
            },
            {
              drug_name: "Metformin",
              dosage_mg: 1000,
              intake_frequency: "Twice Daily"
            }
          ],
          allergies: [
            {
              name: "Penicillin",
              reaction: "Anaphylaxis",
              severity: "Severe"
            },
            {
              name: "Dust",
              reaction: "Sneezing",
              severity: "Mild"
            }
          ]
        },
        scheduled_reminders: [
          {
            reminder_id: "REM001",
            title: "Morning Medication",
            description: "Time to take your morning medicines.",
            status: "Active",
            is_enabled: true,
            time: "08:00 AM",
            frequency: "Daily",
            delivery_channel: "CALL",
            next_schedule: "2025-08-26T08:00:00Z",
            created_at: "2025-08-20T08:00:00Z"
          },
          {
            reminder_id: "REM002",
            title: "Vitals Check",
            description: "Please record your blood pressure.",
            status: "Active",
            is_enabled: true,
            time: "10:00 AM",
            frequency: "Weekly",
            delivery_channel: "SMS",
            next_schedule: "2025-08-30T10:00:00Z",
            created_at: "2025-08-20T08:00:00Z"
          }
        ],
        recent_call_history: [
          {
            call_id: "CALL001",
            call_type: "Outbound Call",
            reminder_name: "Morning Medication",
            status: "Completed",
            message: "Subject confirmed medication adherence.",
            call_datetime: "2025-08-25T08:02:00Z",
            duration: "1m 20s",
            channel: "Voice Call"
          },
          {
            call_id: "CALL002",
            call_type: "Inbound Call",
            reminder_name: "Manual Query",
            status: "Completed",
            message: "Subject reported mild headache.",
            call_datetime: "2025-08-24T14:20:00Z",
            duration: "4m 15s",
            channel: "Voice Call"
          }
        ],
        wearable_data: {
          device: {
            device_id: "DEV001",
            name: "Nexus Watch v2",
            battery_percentage: 87,
            connection_status: "Connected",
            last_sync: "2025-08-25T10:15:00Z"
          },
          health_summary: {
            heart_rate: {
              value: 74,
              unit: "BPM",
              change_percentage: "+3%"
            },
            steps: {
              value: 8450,
              unit: "steps",
              change_percentage: "+12%"
            },
            sleep: {
              value: 7.4,
              unit: "hrs",
              change_percentage: "-2%"
            },
            calories: {
              value: 2180,
              unit: "kcal",
              change_percentage: "+6%"
            }
          },
          daily_step_goal: {
            completed_steps: 8450,
            goal_steps: 10000,
            progress_percentage: 84.5
          },
          recent_readings: [
            {
              time: "08:00 AM",
              heart_rate: 70,
              steps: 250,
              activity_status: "Awake"
            },
            {
              time: "10:00 AM",
              heart_rate: 82,
              steps: 1800,
              activity_status: "Walking"
            },
            {
              time: "02:00 PM",
              heart_rate: 91,
              steps: 4200,
              activity_status: "Exercise"
            }
          ],
          updated_at: "2025-08-25T10:30:00Z"
        },
        adverse_events: [
          {
            ae_id: "AE-1777284854394",
            severity: "Critical",
            description: "Systolic BP exceeded safety threshold (>180).",
            data_type: "Vitals",
            field: "Systolic BP",
            status: "Pending",
            flagged_at: "2025-08-25T09:45:00Z",
            aeType: "Systolic BP",
            severityGrade: 4,
            severityLabel: "Life-Threatening",
            onset_date: "2025-08-25T09:45:00Z",
            awareness_date: "2025-08-25T09:45:00Z",
            is_sae: true,
            ai_flagged: false,
            days_to_report: 0
          },
          {
            ae_id: "AE-1777285045760",
            severity: "Warning",
            description: "Potential adverse event detected via AI assistant.",
            data_type: "AI Assistant",
            field: "Self-Reported Symptom",
            status: "Pending",
            flagged_at: "2025-08-25T11:10:00Z",
            aeType: "Self-Reported Symptom",
            severityGrade: 2,
            severityLabel: "Moderate",
            onset_date: "2025-08-25T11:10:00Z",
            awareness_date: "2025-08-25T11:10:00Z",
            is_sae: false,
            ai_flagged: true,
            days_to_report: 0
          }
        ],
        audit: {
          created_at: "2025-01-10T10:00:00Z",
          updated_at: "2025-08-25T11:30:00Z",
          created_by: "system_admin"
        }
      }
    ];

    for (let i = 1; i < 25; i++) {
      const patient_id = `SUB-${(i + 1).toString().padStart(3, '0')}`;
      const subject_name = `${firstNames[i]} ${lastNames[i]}`;
      const trial = trialIds[i % trialIds.length];
      const status = statuses[i % statuses.length];
      const risk = risks[i % risks.length];
      const phase = phases[i % phases.length];
      
      const sub = {
        piId: PI_ID,
        patient_id,
        subject_name,
        trial,
        site: sites[i % sites.length],
        status,
        compliance: 75 + Math.floor(Math.random() * 25),
        risk,
        last_activity: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
        enrollment_date: new Date(Date.now() - (180 * 24 * 60 * 60 * 1000)).toISOString(),
        phase,
        contact: {
          phone: `+1-555-01${Math.floor(10 + Math.random() * 89)}`,
          email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`
        },
        emergency_contact: {
          name: `Emergency Contact ${i + 1}`,
          relationship: i % 2 === 0 ? "Spouse" : "Parent",
          phone: `+1-555-02${Math.floor(10 + Math.random() * 89)}`
        },
        medical_history: {
          conditions: [
            { condition_name: "Hypertension", diagnosed_at: "2021-04-10", status: "Managed" },
            { condition_name: "Mild Asthma", diagnosed_at: "2019-08-15", status: "Stable" }
          ],
          current_medications: [
            { drug_name: "Lisinopril", dosage_mg: 10, intake_frequency: "Daily" }
          ],
          allergies: [
            { name: "Penicillin", reaction: "Rash", severity: "Moderate" }
          ]
        },
        scheduled_reminders: [
          {
            reminder_id: `REM-${patient_id}-01`,
            title: "Morning Medication",
            description: "Take morning doses.",
            status: "Active",
            is_enabled: true,
            time: "08:00 AM",
            frequency: "Daily",
            delivery_channel: "CALL",
            next_schedule: "2026-05-27T08:00:00Z",
            created_at: "2026-05-20T08:00:00Z"
          },
          {
            reminder_id: `REM-${patient_id}-02`,
            title: "Vitals Check",
            description: "Record blood pressure.",
            status: "Active",
            is_enabled: true,
            time: "10:00 AM",
            frequency: "Weekly",
            delivery_channel: "SMS",
            next_schedule: "2026-05-30T10:00:00Z",
            created_at: "2026-05-20T08:00:00Z"
          }
        ],
        recent_call_history: [
          {
            call_id: `CALL-${patient_id}-01`,
            call_type: "Outbound Call",
            reminder_name: "Morning Medication",
            status: "Completed",
            message: "Confirmed intake.",
            call_datetime: "2026-05-26T08:02:00Z",
            duration: "1m 12s",
            channel: "Voice Call"
          }
        ],
        wearable_data: {
          device: {
            device_id: `DEV-${patient_id}`,
            name: "ClinikBand v3",
            battery_percentage: 82,
            connection_status: "Connected",
            last_sync: new Date().toISOString()
          },
          health_summary: {
            heart_rate: { value: 72 + (i % 5), unit: "BPM", change_percentage: "+1.2%" },
            steps: { value: 8432 + (i * 100), unit: "steps", change_percentage: "+8.4%" },
            sleep: { value: 7.2 + (i % 2 === 0 ? 0.3 : -0.2), unit: "hrs", change_percentage: "-2.1%" },
            calories: { value: 2140 + (i * 20), unit: "kcal", change_percentage: "+5.1%" }
          },
          daily_step_goal: {
            completed_steps: 8432,
            goal_steps: 10000,
            progress_percentage: 84
          },
          recent_readings: [
            { time: "08:00 AM", heart_rate: 68, steps: 120, activity_status: "Awake" },
            { time: "10:00 AM", heart_rate: 75, steps: 1540, activity_status: "Walking" }
          ],
          updated_at: new Date().toISOString()
        },
        adverse_events: i % 5 === 0 ? [
          {
            ae_id: `AE-${patient_id}`,
            severity: risk === "High" ? "Severe" : "Mild",
            description: "Reported nausea and headache.",
            data_type: "Vitals",
            field: "Systolic BP",
            status: "Pending",
            flagged_at: new Date().toISOString(),
            aeType: "Systolic BP",
            severityGrade: risk === "High" ? 3 : 1,
            severityLabel: risk === "High" ? "Severe" : "Mild",
            onset_date: new Date().toISOString(),
            awareness_date: new Date().toISOString(),
            is_sae: risk === "High",
            ai_flagged: false,
            days_to_report: 0
          }
        ] : [],
        audit: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: PI_ID
        }
      };

      subjectsData.push(sub);
    }

    const insertedSubjects = await Subject.insertMany(subjectsData);
    console.log(`Seeded ${insertedSubjects.length} Master Subjects.`);

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
      { piId: PI_ID, title: "Dropout Risk", value: "High", trend: "up", change: "+15%", description: "7 patients at risk in ONCO-2024-A1", color: "destructive", patients: 7 },
      { piId: PI_ID, title: "Adverse Events", value: "Normal", trend: "down", change: "-5%", description: "Trend decreasing across all sites", color: "success", patients: 2 },
      { piId: PI_ID, title: "Efficacy Signal", value: "Strong", trend: "up", change: "+8%", description: "Detected in CARDIO-2025-B3 cohort B", color: "primary", patients: 14 },
      { piId: PI_ID, title: "Compliance Score", value: "92%", trend: "up", change: "+3%", description: "Above target for 85% of subjects", color: "accent", patients: 22 },
    ]);

    console.log('Seeding Activities...');
    for (let i = 0; i < 10; i++) {
        const sub = insertedSubjects[i];
        await Activity.create({
            piId: PI_ID,
            initials: sub.subject_name.split(' ').map(n => n[0]).join(''),
            patient: sub.subject_name,
            type: i % 2 === 0 ? "Voice Check-in" : "ePRO Submission",
            outcome: "completed",
            time: `${i + 1}h ago`
        });
    }

    console.log('\nSeeding Site Coordinator Health Snapshot...');
    await HubSiteHealth.create({
      siteId: SITE_ID,
      siteCoordinator: "Maria Coordinator",
      overallRisk: 'Low',
      compliance: 'High',
      recruitment: 'Medium',
      safety: 'Low',
      activeSubjectCount: 25,
      activeSubjectDelta: 2,
      visitCompletionRate: 95,
      visitCompletionDelta: 4,
      openAECount: 5,
      openAEDelta: 1,
      queryRate: 4.8,
      queryRateDelta: -0.6
    });
    console.log('Seeded Health snapshot.');

    console.log('\nSeeding Hub Insights...');
    await HubInsight.insertMany([
      { text: "Safety metrics for ONCO-2024-A1 are healthy with zero critical events logged this week.", type: "info", trialId: "ONCO-2024-A1", siteId: SITE_ID },
      { text: "SUB-001 is flagged as having high dropout risk. Proactive outreach recommended.", type: "danger", siteId: SITE_ID }
    ]);

    console.log('\nSeeding Hub Actions...');
    await HubAction.insertMany([
      { label: "Proactive compliance follow-up call", type: "call", patientId: "SUB-001", siteId: SITE_ID },
      { label: "Review lab values escalation", type: "review", patientId: "SUB-006", siteId: SITE_ID }
    ]);

    console.log('\nSeeding Hub Activities...');
    await HubActivity.insertMany([
      { description: "Patient SUB-001 submitted symptom tracker", type: "info", patientId: "SUB-001", siteId: SITE_ID, timestamp: new Date() },
      { description: "AE resolved for SUB-011 - headache controlled", type: "success", patientId: "SUB-011", siteId: SITE_ID, timestamp: new Date(Date.now() - 3600000) }
    ]);

    console.log('\nSeeding Compliance Scores...');
    await HubComplianceScore.insertMany([
      { trialId: "ONCO-2024-A1", siteId: SITE_ID, overallScore: 92, healthBand: "green", weekOnWeekChange: 2, componentScores: { visits: 90, labs: 94, consent: 100, epro: 92 } },
      { trialId: "CARDIO-2025-B3", siteId: SITE_ID, overallScore: 82, healthBand: "amber", weekOnWeekChange: -6, componentScores: { visits: 78, labs: 85, consent: 100, epro: 80 } },
      { trialId: "NEURO-2025-C1", siteId: SITE_ID, overallScore: 95, healthBand: "green", weekOnWeekChange: 0, componentScores: { visits: 94, labs: 96, consent: 100, epro: 95 } }
    ]);

    console.log('\nSeeding Protocol Deviations...');
    await HubProtocolDeviation.insertMany([
      { 
        subjectId: "SUB-001", trialId: "ONCO-2024-A1", siteId: SITE_ID, type: "Missed Visit", severity: "Major", 
        description: "Subject missed Visit 4 (Infusion) and the protocol window has expired.",
        status: "Unresolved", aiNote: "First time occurrence.",
        repeated_deviation: false, loggedDate: new Date()
      }
    ]);

    console.log('\nSeeding Compliance Recommendations...');
    await HubComplianceRecommendation.insertMany([
      { text: "Conduct medication adherence review with SUB-001.", recommendationType: "score_drop", trialId: "ONCO-2024-A1", priorityRank: 1, siteId: SITE_ID }
    ]);

    console.log('\nSeeding Hub Safety Anomalies...');
    await HubSafetyAnomaly.create({
      description: "Mild symptom accumulation noted in trial ONCO-2024-A1.",
      trialId: "ONCO-2024-A1",
      affectedPatientIds: ["SUB-001", "SUB-006"],
      historicalSignalRef: "SIG-LIVER-01",
      recommendedAction: "Verify blood pressures during daily vitals checks.",
      urgency: "urgent",
      status: "active",
      siteId: SITE_ID
    });

    console.log('\nSeeding Validation Flags & Audit Logs...');
    for (let i = 0; i < 5; i++) {
      const sub = insertedSubjects[i + 5];
      const flag = await ValidationFlag.create({
        id: `FLAG-${2000 + i}`,
        patientId: sub.patient_id,
        patientName: sub.subject_name,
        dataType: "Vitals",
        field: "Systolic BP",
        originalValue: "185",
        flaggedValue: "185",
        issue: "Value exceeds safety threshold (>180)",
        severity: i === 0 ? "critical" : "warning",
        status: i % 2 === 0 ? "pending" : "in_review",
        flaggedAt: new Date().toISOString(),
        trial: sub.trial
      });

      await AuditEntry.create({
        id: `AUDIT-${3000 + i}`,
        validationId: flag.id,
        action: "Assigned for Review",
        performedBy: "System AI",
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        notes: "Automated baseline check."
      });
    }

    console.log('\nSeeding Adverse Events (Hub)...');
    await HubAE.insertMany([
      { 
        patientId: "PAT1001", 
        trialId: "TRIAL-ASTHMA-2025", 
        siteId: "Apollo Research Center - Hyderabad", 
        aeType: "Systolic BP Exceeded", 
        severityGrade: 4, 
        severityLabel: "Severe", 
        onset_date: new Date("2025-08-25T09:45:00Z"), 
        awareness_date: new Date("2025-08-25T09:45:00Z"), 
        status: "Active", 
        is_sae: true, 
        days_to_report: 0, 
        late_report: false, 
        ai_flagged: true 
      },
      { 
        patientId: "PAT1001", 
        trialId: "TRIAL-ASTHMA-2025", 
        siteId: "Apollo Research Center - Hyderabad", 
        aeType: "Self-Reported Symptom", 
        severityGrade: 2, 
        severityLabel: "Moderate", 
        onset_date: new Date("2025-08-25T11:10:00Z"), 
        awareness_date: new Date("2025-08-25T11:10:00Z"), 
        status: "Active", 
        is_sae: false, 
        days_to_report: 0, 
        late_report: false, 
        ai_flagged: true 
      }
    ]);

    console.log('\nSeeding Weekly Scheduled Visits......');
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    await HubVisit.insertMany([
      { subjectId: "PAT1001", trialId: "TRIAL-ASTHMA-2025", visitType: "Infusion", scheduledDate: baseDate, scheduledTime: "08:00", duration: 2, state: "standard", siteId: "Apollo Research Center - Hyderabad" },
      { subjectId: "SUB-002", trialId: "CARDIO-2025-B3", visitType: "Labs", scheduledDate: baseDate, scheduledTime: "10:00", duration: 1, state: "standard", siteId: SITE_ID }
    ]);

    console.log('\nMaster Seeder executed successfully! 100% unified.');
    process.exit(0);
  } catch (err) {
    console.error('Unified Seeder error:', err);
    process.exit(1);
  }
};

seedMasterData();
