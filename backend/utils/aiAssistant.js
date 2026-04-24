const OLLAMA_URL = 'https://ollama.com/api/chat';
const OLLAMA_AUTH_TOKEN = '7b92c59dfbfc4ff792c4228dbf4a5ba3.83xnmae6F2JDFIZd19__F8J2';
const OLLAMA_COOKIE = 'aid=ba14a101-09b7-4628-8369-ce2808cbc8b7';
const OLLAMA_MODEL = 'deepseek-v3.1:671b-cloud';

/**
 * Calls the project-specific Ollama instance with clinical context.
 */
async function callOllama(messages) {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OLLAMA_AUTH_TOKEN}`,
        'Cookie': OLLAMA_COOKIE,
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (err) {
    console.error('Ollama Utility Error:', err);
    throw err;
  }
}

/**
 * System Prompt for the AI Health Assistant
 */
function getSystemPrompt(patientName) {
  return `You are the AI Health Assistant for a clinical trial.
Current Patient: ${patientName}

Your goals:
1. Introduce yourself warmly: "Hello ${patientName}! I'm your AI Health Assistant for the clinical trial."
2. Help with medication reminders, symptom tracking, and trial questions.
3. If the patient reports a symptom, you MUST extract the symptom name and severity (1-10).
4. Be professional, empathetic, and GCP-compliant.

CRITICAL: At the end of every response, if you detected a symptom, append a JSON block on a NEW LINE starting with "METADATA:" followed by a JSON object like:
{"symptom": "headache", "severity": 4, "isAdverseEvent": false}
If severity is 7 or higher, set "isAdverseEvent": true.
If no symptom is detected, do not append the metadata block.`;
}

module.exports = {
  callOllama,
  getSystemPrompt
};
