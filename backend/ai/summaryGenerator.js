const openai = require('../config/openrouter');
const logger = require('../utils/logger');

async function generateSummary(text) {
  const start = Date.now();
  try {
    const input = text.slice(0, 4000);
    const resp = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: input }]
    });
    logger.info({ latency: Date.now() - start }, 'summaryGenerator');
    return resp.choices?.[0]?.message?.content?.trim();
  } catch (err) {
    logger.error({ err }, 'Summary generation failed');
    throw err;
  }
}

module.exports = { generateSummary };
