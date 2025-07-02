// backend/config/openrouter.js
require('dotenv').config();
const { OpenAI } = require('openai');

const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

const openrouter = new OpenAI({
  apiKey,
  baseURL: 'https://openrouter.ai/api/v1',
});

module.exports = openrouter;
