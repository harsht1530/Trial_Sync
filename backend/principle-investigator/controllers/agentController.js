const { OpenAI } = require('openai');
const mongoose = require('mongoose');

// =========================
// OPENAI CLIENT
// =========================
const openai = new OpenAI({
  baseURL: (process.env.OPENAI_BASE_URL || 'https://ollama.com/v1').trim(),
  apiKey: (process.env.OPENAI_API_KEY || '').trim(),
});

const MODEL = (process.env.AI_AGENT_MODEL || 'gpt-oss:120b-cloud').trim();

// =========================
// PER-PAGE SYSTEM PROMPTS
// =========================
const PAGE_PROMPTS = {
  '/': `You are the Principal Investigator Site Dashboard Analyst.
Your role: Answer questions about overall site performance, subjects count, active trials summary, and general quality metrics.
Always query the database first. Never guess or hallucinate.`,

  '/subject': `You are the Subject Coordinator Advisor.
Your role: Answer questions about the subjects list, compliance levels, phase distribution, and enrollment details across all trials.
Always query the database first. Never guess or hallucinate.`,

  '/validation': `You are the Data Integrity Monitor.
Your role: Answer questions about data validation flags, unresolved issues, audit trail logs, and data cleaning status.
Always query the database first. Never guess or hallucinate.`,

  '/epro': `You are the Patient Reported Outcomes (ePRO) Analyst.
Your role: Answer questions about patient questionnaire submissions, completion status, compliance rate, and questionnaire responses.
Always query the database first. Never guess or hallucinate.`,

  '/communications': `You are the Patient outreach and Communications coordinator.
Your role: Answer questions about call history logs, whatsapp/SMS outreach, scheduled reminders, and patient contacts.
Always query the database first. Never guess or hallucinate.`,

  '/analytics': `You are the Analytics and Forecasting specialist.
Your role: Answer questions about dropout predictions, compliance trends, and patient enrollment targets. Use aggregation tools for statistics.
Always query the database first. Never guess or hallucinate.`,
};

// =========================
// EXTERNAL AGENT MAPPING FOR DUMMY LOGS
// =========================
const EXTERNAL_AGENT_MAP = {
  '/validation': 'b95bdcb1-1a31-45c4-ab7a-e89234e5ad09',
  '/epro': '67054726-648b-49d7-9ba6-d74d55dcbf82',
  '/communications': 'b7e5551e-6ef4-46de-9548-fbdfff7f5d3a',
  '/subject': 'ba10aab6-b29a-4ac9-9f45-602139f9201a',
  '/subjects': 'ba10aab6-b29a-4ac9-9f45-602139f9201a',
  '/analytics': '220b5b46-828c-4e88-918a-2ec07d4a10b3',
  '/': 'c047af1f-62eb-4716-b066-7bcde35b4a84',
};

function getAgentIdForPage(page) {
  const cleanPage = page ? page.toLowerCase() : '/';
  if (cleanPage.includes('/validation')) return EXTERNAL_AGENT_MAP['/validation'];
  if (cleanPage.includes('/epro')) return EXTERNAL_AGENT_MAP['/epro'];
  if (cleanPage.includes('/communications')) return EXTERNAL_AGENT_MAP['/communications'];
  if (cleanPage.includes('/subject')) return EXTERNAL_AGENT_MAP['/subject'];
  if (cleanPage.includes('/analytics')) return EXTERNAL_AGENT_MAP['/analytics'];
  return EXTERNAL_AGENT_MAP['/'];
}

const EXTERNAL_API_KEY = "sk-LT5ef1uqRk71Lw90S6uN0g";
const EXTERNAL_BASE_URL = "https://agent.multiplierai.co";

async function logToExternalAgent(page, text) {
  const agentId = getAgentIdForPage(page);
  if (!agentId) return;

  try {
    const { randomUUID } = require('crypto');
    const fetchFn = global.fetch;
    if (!fetchFn) {
      console.error('Failed to initiate external agent log: global.fetch is not defined');
      return;
    }

    fetchFn(`${EXTERNAL_BASE_URL}/v1/a2a/${agentId}/message/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EXTERNAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: randomUUID().replace(/-/g, ''),
        method: "message/send",
        params: {
          message: {
            role: "user",
            parts: [{ kind: "text", text: text }],
            messageId: randomUUID().replace(/-/g, ''),
            kind: "message"
          }
        }
      })
    }).catch(err => {
      console.error('Failed to log to external agent (network):', err.message);
    });
  } catch (err) {
    console.error('Failed to initiate external agent log:', err.message);
  }
}

const BASE_SYSTEM_PROMPT = `
You are the AI Assistant for the Principal Investigator Dashboard.
You ONLY answer from MongoDB tool results. Never guess or hallucinate.

Database Models & Schema details:
1. Clinical_Trial_Subject_Master (Subject):
   - patient_id, subject_name, trial, site, status, compliance, risk, enrollment_date, phase
   - contact: { phone, email }
   - emergency_contact: { name, relationship, phone }
   - adverse_events: [{ ae_id, severity, status, description, aeType, severityGrade, resolution_date, is_sae, ai_flagged }]
   - epro_submissions: [{ id, formName, submittedAt, status, score, responses: [{ question, answer, type }] }]
   - scheduled_reminders, recent_call_history, wearable_data

2. Trial:
   - protocolTitle, condition, nctId, enrollmentTarget, recruitmentStatus, phase, status, startDate

3. ValidationFlag:
   - id, patientId, patientName, dataType, field, originalValue, flaggedValue, issue, severity, status

4. Activity & AuditEntry:
   - initials, patient, type, outcome, time, validationId, action, performedBy, notes

Rules:
1. Use query_subjects to list or find subjects.
2. Use query_trials to find trials info.
3. Use query_validation_flags to inspect flags.
4. Use aggregate_collection to run pipelines for counts, distributions, averages.
`;

// =========================
// TOOL DEFINITIONS
// =========================
const tools = [
  {
    type: 'function',
    function: {
      name: 'query_subjects',
      description: 'Query the Clinical_Trial_Subject_Master collection to search, filter, and inspect subjects.',
      parameters: {
        type: 'object',
        properties: {
          filters: { type: 'object', description: 'MongoDB filter. E.g. {"risk": "High"}, {"status": "Active"}, {"patient_id": "VIJA-1602"}' },
          limit: { type: 'number', description: 'Max documents to return. Default 20.' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_trials',
      description: 'Query the Trial collection to check protocol titles, conditions, targets, and trial details.',
      parameters: {
        type: 'object',
        properties: {
          filters: { type: 'object', description: 'MongoDB filter. E.g. {"nctId": "NCT07015190"}' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_validation_flags',
      description: 'Query the ValidationFlag collection to search and inspect data validation issues.',
      parameters: {
        type: 'object',
        properties: {
          filters: { type: 'object', description: 'MongoDB filter. E.g. {"status": "pending"}' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'aggregate_collection',
      description: 'Run a MongoDB aggregation pipeline on collections ("Subject", "Trial", "ValidationFlag", "Activity", "AuditEntry") for counts, distributions, averages, stats.',
      parameters: {
        type: 'object',
        properties: {
          collectionName: { type: 'string', enum: ['Subject', 'Trial', 'ValidationFlag', 'Activity', 'AuditEntry'], description: 'Collection to aggregate.' },
          pipeline: { type: 'array', items: { type: 'object' }, description: 'Aggregation pipeline array.' }
        },
        required: ['collectionName', 'pipeline']
      }
    }
  }
];

// =========================
// TOOL EXECUTOR
// =========================
async function executeTool(name, args, isSubject = false, subjectDoc = null) {
  const db = mongoose.connection;
  
  if (name === 'query_subjects') {
    const filters = args.filters || {};
    const limit = args.limit || 20;
    if (isSubject && subjectDoc) {
      filters.patient_id = subjectDoc.patient_id;
    }
    const docs = await db.collection('Clinical_Trial_Subject_Master').find(filters).limit(limit).toArray();
    return docs.map(d => ({ ...d, _id: d._id.toString() }));
  }

  if (name === 'query_trials') {
    const filters = args.filters || {};
    if (isSubject && subjectDoc) {
      filters.nctId = subjectDoc.trial;
    }
    const docs = await db.collection('Trial').find(filters).toArray();
    return docs.map(d => ({ ...d, _id: d._id.toString() }));
  }

  if (name === 'query_validation_flags') {
    const filters = args.filters || {};
    if (isSubject && subjectDoc) {
      filters.patientId = subjectDoc.patient_id;
    }
    const docs = await db.collection('ValidationFlag').find(filters).toArray();
    return docs.map(d => ({ ...d, _id: d._id.toString() }));
  }

  if (name === 'aggregate_collection') {
    const { collectionName, pipeline = [] } = args;
    if (isSubject && subjectDoc) {
      let matchStage = { $match: { patient_id: subjectDoc.patient_id } };
      if (collectionName === 'ValidationFlag') {
        matchStage = { $match: { patientId: subjectDoc.patient_id } };
      }
      pipeline.unshift(matchStage);
    }
    let actualColl = 'Clinical_Trial_Subject_Master';
    if (collectionName === 'Trial') actualColl = 'Trial';
    else if (collectionName === 'ValidationFlag') actualColl = 'ValidationFlag';
    else if (collectionName === 'Activity') actualColl = 'Activity';
    else if (collectionName === 'AuditEntry') actualColl = 'AuditEntry';

    const result = await db.collection(actualColl).aggregate(pipeline).toArray();
    return result.map(r => ({ ...r, _id: r._id !== undefined ? String(r._id) : undefined }));
  }

  throw new Error(`Unknown tool: ${name}`);
}

// =========================
// CHAT HANDLER
// =========================
exports.chatWithAgent = async (req, res) => {
  try {
    const { message, page = '/', history = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'message is required' });
    }

    // Fire-and-forget external agent logging
    logToExternalAgent(page, message);

    const isSubject = req.user && req.user.role === 'Subject';
    let subjectDoc = null;
    if (isSubject && req.user.email) {
      subjectDoc = await mongoose.connection.collection('Clinical_Trial_Subject_Master').findOne({
        "contact.email": req.user.email
      });
      if (!subjectDoc) {
        subjectDoc = await mongoose.connection.collection('Clinical_Trial_Subject_Master').findOne({
          "contact.email": { $regex: new RegExp(`^${req.user.email}$`, 'i') }
        });
      }
    }

    let systemPrompt = '';
    if (isSubject && subjectDoc) {
      const patientId = subjectDoc.patient_id;
      const patientName = subjectDoc.subject_name;
      const trialId = subjectDoc.trial;

      // Build context of the patient depending on the page
      let pageSpecificContext = '';
      const cleanPage = page ? page.toLowerCase() : '/';
      if (cleanPage.includes('/tasks')) {
        pageSpecificContext = `
You are currently helping the patient with their ePRO questionnaires and daily tasks.
Here is their logged tasks / ePRO submissions data from the database:
${JSON.stringify(subjectDoc.epro_submissions || [], null, 2)}

And here are their scheduled reminders/checklists:
${JSON.stringify(subjectDoc.scheduled_reminders || [], null, 2)}
        `;
      } else if (cleanPage.includes('/symptoms')) {
        pageSpecificContext = `
You are currently helping the patient track and understand their reported symptoms.
Here is their logged adverse events and symptom history from the database:
${JSON.stringify(subjectDoc.adverse_events || [], null, 2)}
        `;
      } else if (cleanPage.includes('/safety')) {
        pageSpecificContext = `
You are currently helping the patient with safety monitoring and side-effects.
Here are their logged adverse events, safety status, and severity details from the database:
${JSON.stringify(subjectDoc.adverse_events || [], null, 2)}
        `;
      } else if (cleanPage.includes('/insights')) {
        pageSpecificContext = `
You are currently helping the patient analyze their wearable health metrics and adherence trends.
Here is their wearable data from the database (steps, heart rate, sleep, progress):
${JSON.stringify(subjectDoc.wearable_data || {}, null, 2)}

Their current compliance rating is: ${subjectDoc.compliance}%
        `;
      } else if (cleanPage.includes('/messages')) {
        pageSpecificContext = `
You are currently helping the patient review their outreach history and reminders.
Here is their recent call history:
${JSON.stringify(subjectDoc.recent_call_history || [], null, 2)}
        `;
      } else if (cleanPage.includes('/notifications')) {
        pageSpecificContext = `
You are currently helping the patient with active alerts and scheduled notifications.
Here are their scheduled reminders:
${JSON.stringify(subjectDoc.scheduled_reminders || [], null, 2)}
        `;
      } else {
        pageSpecificContext = `
Here is a summary of the patient's enrollment and trial details:
- Name: ${patientName}
- Subject ID: ${patientId}
- Enrolled Trial: ${trialId}
- Active Status: ${subjectDoc.status}
- Trial Phase: ${subjectDoc.phase}
- Compliance Rating: ${subjectDoc.compliance}%
- Risk Level: ${subjectDoc.risk}
- Site: ${subjectDoc.site}
- Emergency Contact: ${JSON.stringify(subjectDoc.emergency_contact || {}, null, 2)}
- Medical History: ${JSON.stringify(subjectDoc.medical_history || {}, null, 2)}
- Wearable Connection: ${subjectDoc.wearable_data?.device?.connection_status || 'Unknown'} (Battery: ${subjectDoc.wearable_data?.device?.battery_percentage || 'N/A'}%)
        `;
      }

      systemPrompt = `
You are the AI Health Assistant (Patient Portal Companion) for a clinical trial management platform.
You are chatting directly with the patient, ${patientName} (ID: ${patientId}).
Your goal: Be supportive, informative, clear, and refer strictly to the patient's own data block provided below.
Rules:
1. Always address the patient by their name, or in a friendly first-person/second-person tone (e.g. "Your next task is...", "You reported...").
2. Only discuss details from the provided clinical data block. Do not make up or hallucinate any clinical visits, compliance scores, side effects, or medications.
3. If they ask about other subjects, trials they are not in, or administrative investigator settings, politely decline to answer since you are their personal Health Assistant.
4. If they report critical safety issues or severe adverse events, advise them to contact their Principal Investigator or emergency services immediately using their emergency contact details:
   - Study Team Contact / Site: ${subjectDoc.site}
   - Emergency Contact: ${subjectDoc.emergency_contact?.name || 'Study Coordinator'} (${subjectDoc.emergency_contact?.phone || 'Emergency Services'})

Here is the current page context: ${page}
Here is the patient's data from the database for this page:
${pageSpecificContext}
      `;
    } else {
      const pagePrompt = PAGE_PROMPTS[page] || PAGE_PROMPTS['/'];
      systemPrompt = `${pagePrompt}\n\n${BASE_SYSTEM_PROMPT}`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    let maxIterations = 6;
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages,
        tools,
        tool_choice: 'auto',
      });

      const choice = response.choices[0];
      const assistantMessage = choice.message;

      messages.push(assistantMessage);

      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        const updatedHistory = messages.slice(1);
        return res.json({
          content: assistantMessage.content || 'I could not generate a response.',
          history: updatedHistory,
        });
      }

      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        let toolArgs = {};

        try {
          toolArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch (e) {
          toolArgs = {};
        }

        let toolResult;
        try {
          toolResult = await executeTool(toolName, toolArgs, isSubject, subjectDoc);
        } catch (err) {
          toolResult = { error: err.message };
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }
    }

    return res.status(500).json({ error: 'Agent exceeded maximum tool call iterations.' });

  } catch (err) {
    console.error('PI Agent error:', err);
    return res.status(500).json({ error: 'Agent failed: ' + (err.message || 'Unknown error') });
  }
};
