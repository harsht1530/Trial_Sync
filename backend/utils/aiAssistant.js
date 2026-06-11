const OpenAI = require('openai');

// Initialize the OpenAI-compatible client pointing to the Multiplier AI agent
const client = new OpenAI({
  apiKey: process.env.AI_AGENT_API_KEY,
  baseURL: process.env.AI_AGENT_BASE_URL,
});

const MODEL = process.env.AI_AGENT_MODEL || 'gpt-oss:20b';

/**
 * Calls the Multiplier AI agent with clinical context messages.
 * Messages format: [{ role: 'system'|'user'|'assistant', content: '...' }]
 */
async function callOllama(messages) {
  try {
    // The agent uses the OpenAI Responses API format
    const inputMessages = messages.map(m => ({
      role: m.role === 'system' ? 'user' : m.role, // fold system into first user if needed
      content: m.content
    }));

    // Prepend any system message as part of the input instructions
    const systemMsg = messages.find(m => m.role === 'system');
    const conversationMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));

    // Build input array: if system prompt exists, inject it as a leading user context block
    const input = systemMsg
      ? [
          { role: 'user', content: `[System Instructions]\n${systemMsg.content}` },
          { role: 'assistant', content: 'Understood. I will follow these instructions.' },
          ...conversationMessages
        ]
      : conversationMessages;

    const response = await client.responses.create({
      model: MODEL,
      input
    });

    return response.output_text;
  } catch (err) {
    console.error('Multiplier AI Agent Error:', err?.message || err);
    throw err;
  }
}

/**
 * System Prompt for the AI Health Assistant (PI-facing chatbot)
 */
function getSystemPrompt(patientName) {
  return `You are the AI Health Assistant for a clinical trial platform called TrialSync.
Current Patient: ${patientName}

Your goals:
1. Introduce yourself warmly as the AI Health Assistant for the clinical trial.
2. Help the Principal Investigator and care team with medication reminders, symptom tracking, and trial questions.
3. If the patient reports a symptom, extract the symptom name and severity (1-10).
4. Be professional, empathetic, and GCP-compliant.
5. Keep responses concise and actionable.

CRITICAL: At the end of every response, if you detected a symptom, append a JSON block on a NEW LINE starting with "METADATA:" followed by a JSON object like:
{"symptom": "headache", "severity": 4, "isAdverseEvent": false}
If severity is 7 or higher, set "isAdverseEvent": true.
If no symptom is detected, do not append the metadata block.`;
}

module.exports = {
  callOllama,
  getSystemPrompt
};
