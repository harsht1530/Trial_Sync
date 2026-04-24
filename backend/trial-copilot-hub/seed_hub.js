require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { hubConn } = require('../config/db');

// Models
const HubSiteHealth = require('./models/HubSiteHealth');
const HubTrial = require('./models/HubTrial');
const HubInsight = require('./models/HubInsight');
const HubAction = require('./models/HubAction');
const HubActivity = require('./models/HubActivity');
const HubSubject = require('./models/HubSubject');

const SITE_ID = "SITE-NY-001";
const COORDINATOR = "Maria";

const seedHubData = async () => {
    try {
        console.log('Seeding Trial Copilot Hub data...');

        // Clear existing data
        await HubSiteHealth.deleteMany({});
        await HubTrial.deleteMany({});
        await HubInsight.deleteMany({});
        await HubAction.deleteMany({});
        await HubActivity.deleteMany({});
        await HubSubject.deleteMany({});

        console.log('Seeding Health Snapshot...');
        await HubSiteHealth.create({
            siteId: SITE_ID,
            siteCoordinator: COORDINATOR,
            overallRisk: 'Low',
            compliance: 'High',
            recruitment: 'Medium',
            safety: 'Low',
            activeSubjectCount: 223,
            activeSubjectDelta: 12,
            visitCompletionRate: 92,
            visitCompletionDelta: 3,
            openAECount: 14,
            openAEDelta: 2,
            queryRate: 8.2,
            queryRateDelta: 1.4,
        });

        console.log('Seeding Trials...');
        await HubTrial.insertMany([
            { trialId: "ONCO-2024-A1", phase: "Phase 3", status: "Recruiting", enrolledCount: 68, targetCount: 120, siteId: SITE_ID },
            { trialId: "CARDIO-2025-B3", phase: "Phase 2", status: "On-treatment", enrolledCount: 45, targetCount: 50, siteId: SITE_ID },
            { trialId: "NEURO-2025-C1", phase: "Phase 1", status: "Screening", enrolledCount: 12, targetCount: 40, siteId: SITE_ID },
            { trialId: "ENDO-2024-D2", phase: "Phase 3", status: "Closeout", enrolledCount: 98, targetCount: 100, siteId: SITE_ID },
        ]);

        console.log('Seeding Insights...');
        await HubInsight.insertMany([
            { text: "Your enrollment is on track, but AE reporting for ONCO-2024-A1 is slightly delayed by 2 days on average.", type: "warning", trialId: "ONCO-2024-A1", siteId: SITE_ID },
            { text: "Upcoming 2 weeks have high visit load (34 visits). Consider rescheduling 2 non-critical visits.", type: "info", siteId: SITE_ID },
            { text: "3 patients flagged as high dropout risk. AI recommends proactive follow-up calls this week.", type: "danger", siteId: SITE_ID },
        ]);

        console.log('Seeding Actions...');
        await HubAction.insertMany([
            { label: "Call high-risk patient", type: "call", patientId: "P-0042", siteId: SITE_ID },
            { label: "Submit AE report", type: "submit", patientId: "P-0018", trialId: "CARDIO-2025-B3", siteId: SITE_ID },
            { label: "Review missed lab window", type: "review", patientId: "P-0031", siteId: SITE_ID },
            { label: "Send consent reminders", type: "send", siteId: SITE_ID },
        ]);

        console.log('Seeding Activities...');
        await HubActivity.insertMany([
            { description: "Patient P-0042 completed Visit 6 successfully", type: "success", patientId: "P-0042", siteId: SITE_ID, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
            { description: "AE reported for P-0018 — mild nausea, AI suggests monitoring", type: "warning", patientId: "P-0018", trialId: "CARDIO-2025-B3", siteId: SITE_ID, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
            { description: "eConsent pending for 3 new screening patients", type: "info", siteId: SITE_ID, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
            { description: "Protocol deviation flagged for P-0031 — missed lab window", type: "danger", patientId: "P-0031", siteId: SITE_ID, timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) },
            { description: "Training module updated: GCP Refresher v2.1", type: "info", siteId: SITE_ID, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        ]);

        console.log('Seeding Subjects...');
        await HubSubject.insertMany([
            { subjectId: "P-0001", trialId: "ONCO-2024-A1", siteId: SITE_ID, status: "on-treatment", phase: "Phase 3", lastVisit: new Date("2025-02-10"), nextVisit: new Date("2025-02-17"), flags: [], riskScore: 10 },
            { subjectId: "P-0007", trialId: "ONCO-2024-A1", siteId: SITE_ID, status: "on-treatment", phase: "Phase 3", lastVisit: new Date("2025-02-08"), nextVisit: new Date("2025-02-14"), flags: ["high_dropout_risk"], riskScore: 85 },
            { subjectId: "P-0012", trialId: "CARDIO-2025-B3", siteId: SITE_ID, status: "consented", phase: "Phase 2", lastVisit: new Date("2025-02-05"), nextVisit: new Date("2025-02-15"), flags: [], riskScore: 15 },
            { subjectId: "P-0018", trialId: "ONCO-2024-A1", siteId: SITE_ID, status: "on-treatment", phase: "Phase 3", lastVisit: new Date("2025-02-09"), nextVisit: new Date("2025-02-16"), flags: ["pending_ae"], riskScore: 70 },
            { subjectId: "P-0023", trialId: "NEURO-2025-C1", siteId: SITE_ID, status: "screening", phase: "Phase 1", lastVisit: new Date("2025-02-11"), nextVisit: new Date("2025-02-18"), flags: [], riskScore: 20 },
            { subjectId: "P-0031", trialId: "CARDIO-2025-B3", siteId: SITE_ID, status: "on-treatment", phase: "Phase 2", lastVisit: new Date("2025-01-28"), nextVisit: new Date("2025-02-14"), flags: ["missed_visit"], riskScore: 60 },
            { subjectId: "P-0038", trialId: "ENDO-2024-D2", siteId: SITE_ID, status: "discontinued", phase: "Phase 3", lastVisit: new Date("2025-01-15"), nextVisit: null, flags: [], riskScore: 5 },
            { subjectId: "P-0042", trialId: "ONCO-2024-A1", siteId: SITE_ID, status: "on-treatment", phase: "Phase 3", lastVisit: new Date("2025-02-12"), nextVisit: new Date("2025-02-19"), flags: [], riskScore: 12 },
            { subjectId: "P-0045", trialId: "NEURO-2025-C1", siteId: SITE_ID, status: "screening", phase: "Phase 1", lastVisit: new Date("2025-02-10"), nextVisit: new Date("2025-02-17"), flags: ["high_dropout_risk"], riskScore: 78 },
            { subjectId: "P-0050", trialId: "ENDO-2024-D2", siteId: SITE_ID, status: "on-treatment", phase: "Phase 3", lastVisit: new Date("2025-02-11"), nextVisit: new Date("2025-02-18"), flags: ["pending_ae"], riskScore: 65 },
        ]);

        console.log('Hub data seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

// Wait for connection
hubConn.on('connected', () => {
    seedHubData();
});
