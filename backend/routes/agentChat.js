const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const BASE_URL = (process.env.AI_AGENT_BASE_URL || "https://agent.multiplierai.co").trim();
const API_KEY = (process.env.AI_AGENT_API_KEY || "sk-LT5ef1uqRk71Lw90S6uN0g").trim();

router.post('/chat', async (req, res) => {
  try {
    const { message, agentId } = req.body;

    if (!message || !agentId) {
      return res.status(400).json({ error: "message and agentId are required" });
    }

    const payload = {
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method: "message/send",
      params: {
        message: {
          role: "user",
          parts: [{ kind: "text", text: message }],
          messageId: crypto.randomUUID(),
          kind: "message"
        }
      }
    };

    const response = await fetch(`${BASE_URL}/v1/a2a/${agentId}/message/send`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Agent API Error:", data.error || response.statusText);
      return res.status(response.status || 500).json({ error: data.error || "Error communicating with AI Agent" });
    }

    const parts = (data.result || {}).parts || [];
    const replyText = parts.filter(p => p.kind === 'text').map(p => p.text).join(' ').trim();

    res.json({ content: replyText });
  } catch (err) {
    console.error("Backend Proxy Error:", err);
    res.status(500).json({ error: "Failed to process chat request." });
  }
});

module.exports = router;
