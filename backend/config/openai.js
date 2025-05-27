// backend/config/openai.js
require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, // Make sure it's OPENROUTER_API_KEY
  baseURL: 'https://openrouter.ai/api/v1',
});

module.exports = openai;
