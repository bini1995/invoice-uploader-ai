
import openrouter from '../config/openrouter.js';
import logger from '../utils/logger.js';
async function extractEntities(text) {
  const start = Date.now();
  try {
    const resp = await openrouter.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You extract structured entities from documents.' },
        { role: 'user', content: `Extract key dates, parties, terms and clauses as JSON.\n\n${text}` }
      ]
    });
    logger.info({ latency: Date.now() - start }, 'extractEntities');
    const raw = resp.choices?.[0]?.message?.content || '{}';
    try {
      return JSON.parse(raw);
    } catch {
      return { raw };
    }
  } catch (err) {
    logger.error({ err }, 'Entity extraction failed');
    throw err;
  }
}

export { extractEntities };
