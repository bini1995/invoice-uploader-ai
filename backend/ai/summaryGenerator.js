
import openai from '../config/openrouter.js';
import logger from '../utils/logger.js';
async function generateSummary(text) {
  const start = Date.now();
  try {
    const input = text.slice(0, 4000);
    const prompt =
      'Summarize the following insurance claim or invoice text using appropriate claims terminology. Focus on policy numbers, deductibles, benefits and key outcomes.\n\n' +
      input;
    const resp = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });
    logger.info({ latency: Date.now() - start }, 'summaryGenerator');
    return resp.choices?.[0]?.message?.content?.trim();
  } catch (err) {
    logger.error({ err }, 'Summary generation failed');
    throw err;
  }
}

export { generateSummary };
