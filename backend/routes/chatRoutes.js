import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

const SYSTEM_PROMPT = `You are the ClarifyOps AI assistant, a helpful support bot for an AI-powered insurance claims processing platform. 

Key facts about ClarifyOps:
- AI-powered claims data extraction from PDFs, images, and documents
- Extracts CPT codes, ICD-10 codes, policy numbers, claim amounts, dates
- Claim Readiness Score (0-100%) shows claim completeness
- HIPAA compliant with 256-bit encryption and audit logging
- Integrates with Guidewire, Duck Creek, Salesforce, ServiceNow
- Pricing: Free (50 claims/mo), Starter ($249/mo for 500 claims), Pro ($499/mo for 2,500 claims), Enterprise ($999/mo for 10,000 claims). Post-beta: $599, $1,499, $2,999/mo respectively.
- OpsClaim for workflow automation and routing
- AuditFlow for fraud detection and risk scoring

Be helpful, concise, and professional. If you don't know something specific, direct users to schedule a demo at calendly.com/clarifyops-demo or email support@clarifyops.com.`;

router.post('/support', authMiddleware, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return res.json({ 
        reply: "I can help with questions about ClarifyOps features, pricing, integrations, and compliance. What would you like to know?" 
      });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://clarifyops.com',
        'X-Title': 'ClarifyOps Support Bot'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      logger.warn('OpenRouter API error', { status: response.status });
      return res.json({ 
        reply: "I can help with questions about ClarifyOps. Try asking about features, pricing, or integrations!" 
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "How can I help you with ClarifyOps today?";

    res.json({ reply });
  } catch (error) {
    logger.error('Chat support error', { error: error.message });
    res.json({ 
      reply: "I'm here to help! Ask me about ClarifyOps features, pricing, or integrations." 
    });
  }
});

export default router;
