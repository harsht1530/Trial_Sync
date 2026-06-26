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
  '/': `You are the Site Dashboard Analyst for a clinical trial management platform (Trial Copilot Hub).
You have full access to the Clinical_Trial_Subject_Master MongoDB collection.
Your role: Answer questions about overall site health, active subjects, enrollment trends, compliance rates, adverse events summary, and risk distribution.
Always query the database first. Never hallucinate data.`,

  '/subject': `You are the Patient Management Specialist for Trial Copilot Hub.
You have full access to the Clinical_Trial_Subject_Master MongoDB collection.
Your role: Answer questions about individual subjects — their status, risk level, contact info, medical history, wearable data, visit schedules, and compliance. Help identify high-risk or non-compliant patients.
Always query the database first. Never hallucinate data.`,

  '/visits': `You are the Visit & Scheduling Coordinator for Trial Copilot Hub.
You have full access to the Clinical_Trial_Subject_Master MongoDB collection.
Your role: Answer questions about visit schedules, upcoming visits, visit statuses, scheduling conflicts, and protocol adherence windows. Help identify missed or overdue visits.
Always query the database first. Never hallucinate data.`,

  '/safety': `You are the Safety & Adverse Events Monitor for Trial Copilot Hub.
You have full access to the Clinical_Trial_Subject_Master MongoDB collection.
Your role: Answer questions about adverse events (AEs), SAEs, AI-flagged events, severity grades, resolution timelines, and escalations. Help identify critical safety concerns.
Always query the database first. Never hallucinate data.`,

  '/compliance': `You are the Protocol Compliance Officer for Trial Copilot Hub.
You have full access to the Clinical_Trial_Subject_Master MongoDB collection.
Your role: Answer questions about subject compliance scores, protocol deviations, compliance trends, and regulatory adherence. Help identify deviations requiring resolution.
Always query the database first. Never hallucinate data.`,

  '/tasks': `You are the Task Management Assistant for Trial Copilot Hub.
You have full access to the Clinical_Trial_Subject_Master MongoDB collection.
Your role: Answer questions about pending tasks, reminders, call histories, scheduled follow-ups, and action items for subjects.
Always query the database first. Never hallucinate data.`,

  '/analytics': `You are the Clinical Analytics Expert for Trial Copilot Hub.
You have full access to the Clinical_Trial_Subject_Master MongoDB collection.
Your role: Answer questions about statistical trends, enrollment rates, risk distributions, wearable health metrics, compliance analytics, and trial performance KPIs. Use aggregation tools for statistics.
Always query the database first. Never hallucinate data.`,

  '/communications': `You are the Communications Manager for Trial Copilot Hub.
You have full access to the Clinical_Trial_Subject_Master MongoDB collection.
Your role: Answer questions about subject contact details, recent call histories, emergency contacts, scheduled reminders, and communication status for trial participants.
Always query the database first. Never hallucinate data.`,

  '/training': `You are the Training & Certification Advisor for Trial Copilot Hub.
You have full access to the Clinical_Trial_Subject_Master MongoDB collection.
Your role: Answer questions about site staff training records, protocol certifications, and compliance with GCP training requirements as they relate to trial subjects.
Always query the database first. Never hallucinate data.`,
};

// =========================
// EXTERNAL AGENT MAPPING
// =========================
const EXTERNAL_AGENT_MAP = {
  '/training': '97af0389-fd15-48aa-9081-8c5ce725001e',
  '/communications': '10f41336-18ad-49bf-b7f7-c234a1629495',
  '/analytics': '0b7976ad-5292-4594-b022-4fae8386c822',
  '/tasks': 'fb121645-6e20-4d16-94a4-5dc87f35927e',
  '/compliance': '6c786749-aaed-4f1b-9725-0001c51a6755',
  '/safety': 'e5b76660-a048-4a11-bd17-5ae9c79de91f',
  '/subject': 'cef1782f-0179-4c1b-8d2c-a0557df2f61b',
  '/': 'c047af1f-62eb-4716-b066-7bcde35b4a84', // fallback to AI Content Agent if needed, or omit
};

const EXTERNAL_API_KEY = "sk-LT5ef1uqRk71Lw90S6uN0g";
const EXTERNAL_BASE_URL = "https://agent.multiplierai.co";

async function logToExternalAgent(page, text) {
  const agentId = EXTERNAL_AGENT_MAP[page] || EXTERNAL_AGENT_MAP['/'];
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
      // Fire and forget, just catch network errors silently
      console.error('Failed to log to external agent (network):', err.message);
    });
  } catch (err) {
    console.error('Failed to initiate external agent log:', err.message);
  }
}

const BASE_SYSTEM_PROMPT = `
You are an AI assistant for the Trial Copilot Hub — a clinical trial management platform.
You ONLY answer from MongoDB tool results. Never guess or hallucinate.

Collection: Clinical_Trial_Subject_Master

Key fields:
- piId, patient_id (referred to as subject_id), trial, site, status, compliance, risk
- last_activity, enrollment_date, phase
- contact: { phone, email }
- emergency_contact: { name, relationship, phone }
- medical_history: { conditions, current_medications, allergies }
- wearable_data: { device, health_summary { heart_rate, steps, sleep, calories }, daily_step_goal, recent_readings }
- adverse_events: [{ ae_id, severity, status, aeType, severityGrade, onset_date, is_sae, ai_flagged }]
- visit_schedule: [{ visit_id, visit_name, day, scheduled_date, scheduled_time, status, procedures }]
- audit: { created_at, updated_at, created_by }

Rules:
1. Use find_subjects for filtering and listing subjects.
2. Use count_subjects for totals and counts.
3. Use aggregate_subjects for averages, statistics, and grouped results.
4. Always use valid MongoDB filter syntax.
5. Convert _id to string in results (done automatically).
6. Be concise, accurate, and actionable in responses.

Common filter examples:
- High risk: { "risk": "High" }
- Active subjects: { "status": "Active" }
- By trial: { "trial": "ONCO-2024-A1" }
- By site: { "site": "SITE-NY-001" }
- Low compliance: { "compliance": { "$lt": 50 } }
- Has adverse events: { "adverse_events": { "$ne": [] } }
`;

// =========================
// TOOL DEFINITIONS
// =========================

const tools = [
  {
    type: 'function',
    function: {
      name: 'find_subjects',
      description: 'Find and list subjects from Clinical_Trial_Subject_Master with optional MongoDB filters. Use for searching, filtering, and listing subjects.',
      parameters: {
        type: 'object',
        properties: {
          filters: {
            type: 'object',
            description: 'MongoDB filter object. Use {} for all subjects. Examples: {"risk":"High"}, {"status":"Active"}, {"trial":"ONCO-2024-A1"}',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return. Default 20.',
          },
          projection: {
            type: 'object',
            description: 'MongoDB projection to include/exclude fields. E.g., {"patient_id":1,"risk":1,"status":1}',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'count_subjects',
      description: 'Count the number of subjects matching a filter in Clinical_Trial_Subject_Master. Use for totals and counts.',
      parameters: {
        type: 'object',
        properties: {
          filters: {
            type: 'object',
            description: 'MongoDB filter object. Use {} to count all subjects.',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'aggregate_subjects',
      description: 'Run a MongoDB aggregation pipeline on Clinical_Trial_Subject_Master. Use for averages, grouped stats, distributions, and complex analytics.',
      parameters: {
        type: 'object',
        properties: {
          pipeline: {
            type: 'array',
            description: 'MongoDB aggregation pipeline array. E.g., [{"$group":{"_id":"$risk","count":{"$sum":1}}}]',
            items: { type: 'object' },
          },
        },
        required: ['pipeline'],
      },
    },
  },
];

// =========================
// TOOL EXECUTORS
// =========================

async function executeTool(name, args) {
  const db = mongoose.connection.useDb(process.env.DB_NAME_TCH || 'CLINIK');
  const collection = db.collection('Clinical_Trial_Subject_Master');

  if (name === 'find_subjects') {
    const filters = args.filters || {};
    const limit = args.limit || 20;
    const projection = args.projection || {};

    const docs = await collection.find(filters, { projection }).limit(limit).toArray();
    return docs.map(d => ({ ...d, _id: d._id.toString() }));
  }

  if (name === 'count_subjects') {
    const filters = args.filters || {};
    const count = await collection.countDocuments(filters);
    return { count };
  }

  if (name === 'aggregate_subjects') {
    const pipeline = args.pipeline || [];
    const result = await collection.aggregate(pipeline).toArray();
    return result.map(r => ({ ...r, _id: r._id !== undefined ? String(r._id) : undefined }));
  }

  throw new Error(`Unknown tool: ${name}`);
}

// =========================
// MAIN CHAT HANDLER
// =========================

exports.chatWithAgent = async (req, res) => {
  try {
    const { message, page = '/', history = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'message is required' });
    }

    // Fire-and-forget external agent logging
    logToExternalAgent(page, message);

    // Build system prompt = page-specific persona + base rules
    const pagePrompt = PAGE_PROMPTS[page] || PAGE_PROMPTS['/'];
    const systemPrompt = `${pagePrompt}\n\n${BASE_SYSTEM_PROMPT}`;

    // Build message list: system + history + new user message
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ];

    // =========================
    // AGENTIC TOOL CALL LOOP
    // =========================

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

      // Add assistant response to message history
      messages.push(assistantMessage);

      // If no tool calls — we have the final answer
      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        // Build updated history to return to frontend (exclude system prompt)
        const updatedHistory = messages.slice(1); // Remove system prompt
        return res.json({
          reply: assistantMessage.content || 'I could not generate a response.',
          history: updatedHistory,
        });
      }

      // Execute tool calls
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
          toolResult = await executeTool(toolName, toolArgs);
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

    // If we exceed max iterations
    return res.status(500).json({ error: 'Agent exceeded maximum tool call iterations.' });

  } catch (err) {
    console.error('Agent error:', err);
    return res.status(500).json({ error: 'Agent failed: ' + (err.message || 'Unknown error') });
  }
};
