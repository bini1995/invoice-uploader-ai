// backend/controllers/aiController.js
const axios = require('axios');
require('dotenv').config();
const pool = require("../config/db");

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


// Natural language invoice query -> SQL
exports.naturalLanguageQuery = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Missing question text.' });
    }

    const prompt = `Translate the following request into a SQL SELECT query for a PostgreSQL table named "invoices" with columns id, invoice_number, date, amount, vendor, archived, paid. Only return the SQL query.\n\nRequest: ${question}`;

    const aiRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You convert natural language invoice questions to SQL.' },
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

    const sql = aiRes.data.choices?.[0]?.message?.content?.trim();

    if (!sql || !sql.toLowerCase().startsWith('select')) {
      return res.status(400).json({ message: 'Invalid query generated by AI.' });
    }

    const result = await pool.query(sql);

    res.json({ query: sql, rows: result.rows });
  } catch (error) {
    console.error('AI NL query error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to process natural language query.' });
  }
};

// Invoice quality scoring
exports.invoiceQualityScore = async (req, res) => {
  try {
    const { invoice } = req.body;

    if (!invoice) {
      return res.status(400).json({ message: 'Missing invoice data.' });
    }

    const required = ['invoice_number', 'date', 'amount', 'vendor'];
    const missing = required.filter((f) => !invoice[f]);

    let vendorHistory = 0;
    try {
      const result = await pool.query('SELECT COUNT(*) FROM invoices WHERE vendor = $1', [invoice.vendor]);
      vendorHistory = parseInt(result.rows[0].count, 10) || 0;
    } catch (err) {
      console.error('Vendor history lookup failed:', err.message);
    }

    const prompt = `You are an assistant that evaluates the quality of invoice data.\nInvoice: ${JSON.stringify(
      invoice
    )}\nMissing fields: ${missing.join(', ') || 'none'}\nPrevious invoices from this vendor: ${vendorHistory}.\nReturn a JSON object with \"score\" (0-100) and \"tips\" to improve.`;

    const aiRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You evaluate invoice quality.' },
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

    let data;
    try {
      data = JSON.parse(aiRes.data.choices?.[0]?.message?.content || '{}');
    } catch (e) {
      data = { score: null, tips: aiRes.data.choices?.[0]?.message?.content };
    }

    res.json({ score: data.score, tips: data.tips });
  } catch (error) {
    console.error('Quality score error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to evaluate quality.' });
  }
};

// Conversational assistant
exports.assistantQuery = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: 'Missing question.' });

    const sqlPrompt = `Translate the following request into a SQL SELECT query for a PostgreSQL table named "invoices" with columns id, invoice_number, date, amount, vendor, archived, paid, approval_status. Only return the SQL query.\n\nRequest: ${question}`;

    const sqlRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You convert natural language invoice questions to SQL.' },
          { role: 'user', content: sqlPrompt },
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

    const sql = sqlRes.data.choices?.[0]?.message?.content?.trim();
    if (!sql || !sql.toLowerCase().startsWith('select')) {
      return res.status(400).json({ message: 'Invalid query generated by AI.' });
    }

    const result = await pool.query(sql);

    const answerPrompt = `Question: ${question}\nSQL Result: ${JSON.stringify(result.rows)}\nProvide a concise answer for a user.`;

    const answerRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You answer questions about invoices.' },
          { role: 'user', content: answerPrompt },
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

    const answer = answerRes.data.choices?.[0]?.message?.content?.trim();

    res.json({ query: sql, rows: result.rows, answer });
  } catch (error) {
    console.error('Assistant query error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to process assistant query.' });
  }
};
