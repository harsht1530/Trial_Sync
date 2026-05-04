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
const HubVisit = require('./models/HubVisit');
const HubAE = require('./models/HubAE');
const HubSafetyAnomaly = require('./models/HubSafetyAnomaly');
const HubAuditLog = require('./models/HubAuditLog');
const HubEscalation = require('./models/HubEscalation');
const HubComplianceScore = require('./models/HubComplianceScore');
const HubProtocolDeviation = require('./models/HubProtocolDeviation');
const HubComplianceRecommendation = require('./models/HubComplianceRecommendation');

const SITE_ID = "SITE-NY-001";
const COORDINATOR = "Maria";

const seedHubData = async () => {
    try {
        console.log('Seeding Trial Copilot Hub data...');
        console.log('Connection readyState:', hubConn.readyState);

        // Clear existing data
        await HubSiteHealth.deleteMany({});
        await HubTrial.deleteMany({});
        await HubInsight.deleteMany({});
        await HubAction.deleteMany({});
        await HubActivity.deleteMany({});
        await HubSubject.deleteMany({});
        await HubVisit.deleteMany({});
        await HubAE.deleteMany({});
        await HubSafetyAnomaly.deleteMany({});
        await HubAuditLog.deleteMany({});
        await HubEscalation.deleteMany({});
        await HubComplianceScore.deleteMany({});
        await HubProtocolDeviation.deleteMany({});
        await HubComplianceRecommendation.deleteMany({});

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

        console.log('Seeding Visits...');
        const baseDate = new Date("2025-02-10T00:00:00Z"); // Monday
        
        await HubVisit.insertMany([
            // Mon
            { subjectId: "P-0001", trialId: "ONCO-2024-A1", visitType: "Infusion", scheduledDate: new Date("2025-02-10T00:00:00Z"), scheduledTime: "08:00", duration: 2, state: "standard", siteId: SITE_ID },
            { subjectId: "P-0018", trialId: "ONCO-2024-A1", visitType: "Labs", scheduledDate: new Date("2025-02-10T00:00:00Z"), scheduledTime: "09:00", duration: 1, state: "standard", siteId: SITE_ID },
            
            // Tue
            { subjectId: "P-0042", trialId: "ONCO-2024-A1", visitType: "Follow-up", scheduledDate: new Date("2025-02-11T00:00:00Z"), scheduledTime: "10:00", duration: 1, state: "standard", siteId: SITE_ID },
            
            // Wed
            { subjectId: "P-0007", trialId: "ONCO-2024-A1", visitType: "Infusion", scheduledDate: new Date("2025-02-12T00:00:00Z"), scheduledTime: "08:00", duration: 2, state: "ai_nudge", siteId: SITE_ID, aiMetrics: { noShowRiskPct: 35 } },
            { subjectId: "P-0012", trialId: "CARDIO-2025-B3", visitType: "eConsent", scheduledDate: new Date("2025-02-12T00:00:00Z"), scheduledTime: "11:00", duration: 1, state: "standard", siteId: SITE_ID },
            
            // Thu - Conflict slot
            { 
              subjectId: "P-0031", trialId: "CARDIO-2025-B3", visitType: "Infusion", scheduledDate: new Date("2025-02-13T00:00:00Z"), scheduledTime: "08:00", duration: 2, state: "conflict", siteId: SITE_ID,
              conflictDetails: { conflictingSubjectId: "P-0050", resolutionRecommendedSlot: { date: new Date("2025-02-14T00:00:00Z"), time: "08:00" } }
            },
            { 
              subjectId: "P-0050", trialId: "ENDO-2024-D2", visitType: "Infusion", scheduledDate: new Date("2025-02-13T00:00:00Z"), scheduledTime: "08:30", duration: 2, state: "conflict", siteId: SITE_ID,
              conflictDetails: { conflictingSubjectId: "P-0031", resolutionRecommendedSlot: { date: new Date("2025-02-14T00:00:00Z"), time: "08:00" } }
            },
            
            // Fri
            { subjectId: "P-0023", trialId: "NEURO-2025-C1", visitType: "Screening", scheduledDate: new Date("2025-02-14T00:00:00Z"), scheduledTime: "14:00", duration: 1, state: "standard", siteId: SITE_ID },
            { subjectId: "P-0045", trialId: "NEURO-2025-C1", visitType: "Labs", scheduledDate: new Date("2025-02-14T00:00:00Z"), scheduledTime: "09:00", duration: 1, state: "ai_nudge", siteId: SITE_ID, aiMetrics: { congestionReductionPct: 15 } },
        ]);

        console.log('Seeding Adverse Events...');
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const ninetyFiveDaysAgo = new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000);
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        await HubAE.insertMany([
            // Active non-SAE
            { 
                patientId: "P-0001", trialId: "ONCO-2024-A1", siteId: SITE_ID, aeType: "Mild Nausea", 
                severityGrade: 1, severityLabel: "Mild", onset_date: yesterday, awareness_date: yesterday, 
                status: "Monitoring", ai_flagged: false, is_sae: false 
            },
            // Active AI-flagged
            { 
                patientId: "P-0018", trialId: "ONCO-2024-A1", siteId: SITE_ID, aeType: "Grade 2 Escalation", 
                severityGrade: 2, severityLabel: "Moderate", onset_date: thirtyDaysAgo, awareness_date: thirtyDaysAgo, 
                status: "Under Review", ai_flagged: true, is_sae: false 
            },
            // Resolved in 90-day window (onset 5 days before resolution)
            { 
                patientId: "P-0007", trialId: "CARDIO-2025-B3", siteId: SITE_ID, aeType: "Headache", 
                severityGrade: 1, severityLabel: "Mild", onset_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), 
                awareness_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), 
                resolution_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
                status: "Resolved", ai_flagged: false, is_sae: false 
            },
            // SAE this month (reported today)
            { 
                patientId: "P-0031", trialId: "CARDIO-2025-B3", siteId: SITE_ID, aeType: "Chest Pain", 
                severityGrade: 3, severityLabel: "Severe", onset_date: yesterday, awareness_date: yesterday, 
                sponsor_report_date: now, status: "Reported", ai_flagged: true, is_sae: true 
            },
            // Old Resolved AE (outside 90-day window)
            { 
                patientId: "P-0042", trialId: "NEURO-2025-C1", siteId: SITE_ID, aeType: "Fatigue", 
                severityGrade: 1, severityLabel: "Mild", onset_date: ninetyFiveDaysAgo, awareness_date: ninetyFiveDaysAgo, 
                resolution_date: new Date(now.getTime() - 92 * 24 * 60 * 60 * 1000),
                status: "Resolved", ai_flagged: false, is_sae: false 
            }
        ]);

        console.log('Seeding Safety Anomalies...');
        await HubSafetyAnomaly.create({
            description: "Cluster signal: 3 subjects with similar Grade 2 liver enzyme elevations in ONCO-2024-A1.",
            trialId: "ONCO-2024-A1",
            affectedPatientIds: ["P-0001", "P-0018", "P-0007"],
            historicalSignalRef: "SIG-2023-LIVER-04",
            recommendedAction: "Pause dosing for affected subjects and request immediate hepatic panel.",
            urgency: "critical",
            status: "active",
            siteId: SITE_ID
        });

        console.log('Seeding Compliance Scores...');
        await HubComplianceScore.insertMany([
            { trialId: "ONCO-2024-A1", siteId: SITE_ID, overallScore: 92, healthBand: "green", weekOnWeekChange: 2, componentScores: { visits: 90, labs: 94, consent: 100, epro: 92 } },
            { trialId: "CARDIO-2025-B3", siteId: SITE_ID, overallScore: 82, healthBand: "amber", weekOnWeekChange: -6, componentScores: { visits: 78, labs: 85, consent: 100, epro: 80 } },
            { trialId: "NEURO-2025-C1", siteId: SITE_ID, overallScore: 95, healthBand: "green", weekOnWeekChange: 0, componentScores: { visits: 94, labs: 96, consent: 100, epro: 95 } },
            { trialId: "ENDO-2024-D2", siteId: SITE_ID, overallScore: 68, healthBand: "red", weekOnWeekChange: -2, componentScores: { visits: 65, labs: 70, consent: 90, epro: 68 } },
        ]);

        console.log('Seeding Protocol Deviations...');
        await HubProtocolDeviation.insertMany([
            { 
              subjectId: "P-0031", trialId: "CARDIO-2025-B3", siteId: SITE_ID, type: "Missed Visit", severity: "Major", 
              description: "Subject missed Visit 4 (Infusion) and the protocol-defined ±3 day window has expired.",
              status: "Unresolved", aiNote: "AI detected window expiration. Subject previously missed Visit 2.",
              repeated_deviation: true, loggedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            },
            { 
              subjectId: "P-0018", trialId: "ONCO-2024-A1", siteId: SITE_ID, type: "Out-of-window Lab", severity: "Minor", 
              description: "Lab draw for Visit 6 performed 4 hours outside the specified 2-hour post-dose window.",
              status: "Deferred", deferralReason: "SC awaiting sponsor guidance on data impact.",
              followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              loggedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            { 
              subjectId: "P-0007", trialId: "ONCO-2024-A1", siteId: SITE_ID, type: "Missing eCRF", severity: "Minor", 
              description: "Vital signs page for Visit 5 has not been submitted within 24h as required.",
              status: "Unresolved", loggedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            },
            { 
              subjectId: "P-0050", trialId: "ENDO-2024-D2", siteId: SITE_ID, type: "Informed Consent", severity: "Major", 
              description: "Failure to use the latest version (v3.2) of Informed Consent Form for subject re-consenting.",
              status: "Unresolved", aiNote: "Critical regulatory violation. AI recommends immediate re-consenting using correct form.",
              loggedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
        ]);

        console.log('Seeding Compliance Recommendations...');
        await HubComplianceRecommendation.insertMany([
            { 
              text: "Compliance for CARDIO-2025-B3 dropped by 6% this week. AI identifies 'Missed Visit' pattern.",
              recommendationType: "score_drop", trialId: "CARDIO-2025-B3", priorityRank: 1, siteId: SITE_ID
            },
            { 
              text: "Subject P-0031 shows a repeat 'Missed Visit' pattern (2 deviations in 30 days).",
              recommendationType: "repeated_deviation", patientId: "P-0031", trialId: "CARDIO-2025-B3", priorityRank: 2, siteId: SITE_ID
            },
            { 
              text: "Missing lab draws for 3 patients in ENDO-2024-D2 screening phase.",
              recommendationType: "missing_labs", trialId: "ENDO-2024-D2", priorityRank: 3, siteId: SITE_ID
            }
        ]);

        console.log('Hub data seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

// Wait for connection
if (hubConn.readyState === 1) {
    seedHubData();
} else {
    hubConn.on('connected', () => {
        seedHubData();
    });
}
