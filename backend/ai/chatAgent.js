
import openai from '../config/openrouter.js';
import logger from '../utils/logger.js';
async function chatAgent(messages) {
  const start = Date.now();
  try {
    const resp = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages
    });
    logger.info({ latency: Date.now() - start }, 'chatAgent');
    return resp.choices?.[0]?.message?.content?.trim();
  } catch (err) {
    logger.error({ err }, 'chatAgent error');
    throw err;
  }
}

export { chatAgent };
