const openai = require('../config/openrouter');
const logger = require('../utils/logger');

async function aiDuplicateCheck(filename, invoice_number, amount, vendor, flags) {
  if (!process.env.OPENROUTER_API_KEY) return { flag: false };
  const start = Date.now();
  try {
    const prompt = `Filename similar: ${flags.similarFile}; Duplicate combo: ${flags.dupCombo}; Off-hours: ${flags.offHours}. Invoice #: ${invoice_number}, Amount: $${amount}, Vendor: ${vendor}. Should this be flagged? Respond with JSON {"flag":true|false,"reason":"reason"}`;
    const resp = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You detect duplicate or suspicious invoices.' },
        { role: 'user', content: prompt }
      ]
    });
    logger.info({ latency: Date.now() - start }, 'aiDuplicateCheck');
    const txt = resp.choices?.[0]?.message?.content?.trim();
    if (!txt) return { flag: false };
    try {
      return JSON.parse(txt);
    } catch {
      const flag = /yes|true|1/i.test(txt);
      return { flag, reason: txt };
    }
  } catch (err) {
    logger.error({ err }, 'AI duplicate check error');
    return { flag: false };
  }
}

async function generateErrorSummary(errors) {
  if (!process.env.OPENROUTER_API_KEY) return null;
  const start = Date.now();
  try {
    const prompt = `You are a helpful assistant for the ClarifyOps AI Document Ops Engine. Given these validation errors on an insurance claim or invoice, provide a short summary with possible fixes using claims terminology where relevant.\n\n${errors.join('\n')}`;
    const aiRes = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You explain CSV upload errors in plain English.' },
        { role: 'user', content: prompt },
      ]
    });
    logger.info({ latency: Date.now() - start }, 'generateErrorSummary');
    return aiRes.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    logger.error({ err: e }, 'AI summary error');
    return null;
  }
}

module.exports = { aiDuplicateCheck, generateErrorSummary };
