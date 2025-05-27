// backend/controllers/aiController.js
const axios = require('axios');
require('dotenv').config();

console.log('🔧 AI Controller loaded');

exports.summarizeUploadErrors = async (req, res) => {
  try {
    const { errors } = req.body;

    if (!errors || !Array.isArray(errors)) {
      return res.status(400).json({ message: 'Missing or invalid errors array.' });
    }

    // ✅ Define errorText from the errors array
    const errorText = errors.join('\n');

    const prompt = `You are a helpful assistant for a CSV invoice uploader tool. 
Given the following upload validation errors, summarize them clearly and offer suggestions 
to help the user fix them:\n\n${errorText}`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes upload errors.',
          },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/bini1995/invoice-uploader-ai', // optional
          'X-Title': 'invoice-uploader-ai', // optional
        },
      }
    );

    const summary = response.data.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
    console.error('AI summary error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to generate AI summary.' });
  }
};

exports.summarizeVendorData = async (req, res) => {
  try {
    const { vendorData } = req.body;

    if (!vendorData || typeof vendorData !== 'object') {
      return res.status(400).json({ message: 'Missing or invalid vendor data.' });
    }

    const formatted = Object.entries(vendorData).map(([vendor, total]) => `- ${vendor}: $${total.toFixed(2)}`).join('\n');

    const prompt = `You are a business analyst. Summarize the following vendor invoice totals and highlight any patterns or high-spending vendors:\n\n${formatted}`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You analyze business spending data.' },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/bini1995/invoice-uploader-ai',
          'X-Title': 'invoice-uploader-ai',
        },
      }
    );

    const summary = response.data.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
    console.error('AI vendor summary error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to summarize vendor data.' });
  }
};

exports.suggestVendor = async (req, res) => {
  try {
    const { invoice_number, amount } = req.body;

    if (!invoice_number || !amount) {
      return res.status(400).json({ message: "Missing invoice_number or amount." });
    }

    const prompt = `Based on this invoice number "${invoice_number}" and amount "$${amount}", what would be a reasonable guess for a vendor name in a business setting?`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that guesses the most likely vendor name.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/bini1995/invoice-uploader-ai',
          'X-Title': 'invoice-uploader-ai',
        },
      }
    );

    const suggestion = response.data.choices[0].message.content;
    res.json({ suggestion });
  } catch (error) {
    console.error('AI vendor suggestion error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to generate vendor suggestion.' });
  }
};

