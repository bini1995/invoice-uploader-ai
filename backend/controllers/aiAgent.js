const openrouter = require('../config/openrouter');

async function summarize(text) {
  const resp = await openrouter.chat.completions.create({
    model: 'openai/gpt-3.5-turbo',
    messages: [{ role: 'user', content: `Summarize:\n\n${text}` }],
  });
  return resp.choices?.[0]?.message?.content?.trim();
}

async function extractEntities(text) {
  const resp = await openrouter.chat.completions.create({
    model: 'openai/gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Return structured JSON for key entities.' },
      { role: 'user', content: text },
    ],
  });
  try {
    return JSON.parse(resp.choices?.[0]?.message?.content || '{}');
  } catch {
    return {};
  }
}

async function compare(a, b) {
  const prompt = `Compare these two documents and highlight differences.\nDoc A:\n${a}\nDoc B:\n${b}`;
  const resp = await openrouter.chat.completions.create({
    model: 'openai/gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });
  return resp.choices?.[0]?.message?.content?.trim();
}

async function suggest(prompt) {
  const resp = await openrouter.chat.completions.create({
    model: 'openai/gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });
  return resp.choices?.[0]?.message?.content?.trim();
}

module.exports = { summarize, extractEntities, compare, suggest };
