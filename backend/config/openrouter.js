// backend/config/openrouter.js
require('dotenv').config();
const { OpenAI } = require('openai');

const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

let openrouter;

if (apiKey) {
  openrouter = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
  });
} else {
  console.warn('OPENROUTER_API_KEY or OPENAI_API_KEY not set. AI features will be disabled.');
  openrouter = {
    chat: {
      completions: {
        create: async () => {
          throw new Error('AI client not configured');
        },
      },
    },
  };
}

module.exports = openrouter;
