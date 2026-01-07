// backend/controllers/aiController.js

import axios from 'axios';
import chrono from 'chrono-node';
import 'dotenv/config';
import pool from '../config/db.js';
import { sendSlackNotification, sendTeamsNotification } from '../utils/notify.js';
console.log('🔧 AI Controller loaded');

export const summarizeUploadErrors = async (req, res) => {
  try {
    const { errors } = req.body;

    if (!errors || !Array.isArray(errors)) {
      return res.status(400).json({ message: 'Missing or invalid errors array.' });
    }

    // ✅ Define errorText from the errors array
    const errorText = errors.join('\n');

    const prompt = `You are a helpful assistant for the ClarifyOps AI Document Ops Engine.
Given the following upload validation errors for an insurance claim or invoice, provide a concise summary using insurance terminology when appropriate. Then list bullet points under "Possible Fixes" and, if relevant, a "Warnings" section.
\n\n${errorText}`;

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

export const summarizeVendorData = async (req, res) => {
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

export const suggestVendor = async (req, res) => {
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

export const suggestVoucher = async (req, res) => {
  try {
    const { vendor, amount } = req.body || {};
    if (!vendor && !amount) {
      return res.status(400).json({ message: 'Missing vendor or amount.' });
    }

    const prompt = `Given vendor "${vendor || 'Unknown'}" and amount "$${amount ||
      'Unknown'}", suggest a likely expense voucher name or number (e.g., Office,
      Travel, Consulting).`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You guess voucher categories.' },
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

    const suggestion = response.data.choices[0]?.message?.content?.trim();
    res.json({ suggestion });
  } catch (error) {
    console.error(
      'AI voucher suggestion error:',
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ message: 'Failed to generate voucher suggestion.' });
  }
};


// Natural language invoice query -> SQL
export const naturalLanguageQuery = async (req, res) => {
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

export const naturalLanguageSearch = naturalLanguageQuery;

// Invoice quality scoring
export const invoiceQualityScore = async (req, res) => {
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

// Payment risk scoring
export const paymentRiskScore = async (req, res) => {
  try {
    const { vendor } = req.body;
    if (!vendor) {
      return res.status(400).json({ message: 'Missing vendor.' });
    }

    const result = await pool.query(
      'SELECT date, paid FROM invoices WHERE LOWER(vendor) = LOWER($1)',
      [vendor]
    );
    const now = Date.now();
    const overdue = result.rows.filter(
      (r) => !r.paid && new Date(r.date).getTime() < now - 30 * 24 * 60 * 60 * 1000
    ).length;

    const prompt = `Vendor "${vendor}" has ${overdue} overdue invoices out of ${result.rows.length}. Classify the payment delay risk as Low Risk, Medium Risk, or High Risk and respond with just the label.`;

    const aiRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You assess payment delay risk.' },
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

    const risk = aiRes.data.choices?.[0]?.message?.content?.trim();
    res.json({ risk });
  } catch (error) {
    console.error('Risk score error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to evaluate payment risk.' });
  }
};

async function computePaymentLikelihood(vendor) {
  const result = await pool.query(
    'SELECT paid FROM invoices WHERE LOWER(vendor) = LOWER($1)',
    [vendor]
  );
  const paidCount = result.rows.filter(r => r.paid).length;
  const total = result.rows.length || 1;
  const prompt = `Vendor "${vendor}" has paid ${paidCount} of ${total} invoices. Predict the likelihood (0-100) that the next invoice will be paid on time. Respond with just a number.`;
  const aiRes = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You estimate payment likelihood.' },
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
  const raw = aiRes.data.choices?.[0]?.message?.content || '';
  const match = raw.match(/\d+/);
  return match ? parseInt(match[0], 10) : Math.round((paidCount / total) * 100);
}

export const paymentLikelihood = async (req, res) => {
  try {
    const { vendor } = req.body;
    if (!vendor) return res.status(400).json({ message: 'Missing vendor.' });
    const likelihood = await computePaymentLikelihood(vendor);
    res.json({ likelihood });
  } catch (error) {
    console.error('Payment likelihood error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to predict payment likelihood.' });
  }
};

export const paymentBehaviorByVendor = async (req, res) => {
  try {
    const { vendor, invoice_date } = req.body;
    if (!vendor) return res.status(400).json({ message: 'Missing vendor.' });
    const result = await pool.query(
      'SELECT date, updated_at, paid FROM invoices WHERE LOWER(vendor) = LOWER($1)',
      [vendor]
    );
    const delays = result.rows
      .filter(r => r.paid && r.updated_at)
      .map(r => (new Date(r.updated_at) - new Date(r.date)) / (1000 * 60 * 60 * 24));
    const avg = delays.length ? delays.reduce((a,b) => a + b, 0) / delays.length : 30;
    const variance = delays.reduce((s,d) => s + Math.pow(d - avg,2), 0) / (delays.length || 1);
    const confidence = Math.max(0, Math.min(1, delays.length / (result.rows.length || 1) * (1 - Math.sqrt(variance)/(avg || 1))));
    const baseDate = invoice_date ? new Date(invoice_date) : new Date();
    const expected = new Date(baseDate.getTime() + avg * 24 * 60 * 60 * 1000);
    res.json({ expected_payment_date: expected.toISOString().split('T')[0], confidence: Number((confidence * 100).toFixed(1)) });
  } catch (error) {
    console.error('Payment behavior error:', error.message);
    res.status(500).json({ message: 'Failed to predict payment behavior.' });
  }
};

export const alertHighRiskInvoices = async () => {
  try {
    const { rows } = await pool.query("SELECT id, vendor FROM invoices WHERE paid = false");
    for (const inv of rows) {
      const likelihood = await computePaymentLikelihood(inv.vendor);
      if (likelihood < 50) {
        sendSlackNotification?.(`Invoice ${inv.id} from ${inv.vendor} likely unpaid (${likelihood}%).`);
        sendTeamsNotification?.(`Invoice ${inv.id} from ${inv.vendor} likely unpaid (${likelihood}%).`);
      }
    }
  } catch (err) {
    console.error('High risk alert error:', err);
  }
};

// Conversational assistant
export const assistantQuery = async (req, res) => {
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

export const billingQuery = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: 'Missing question.' });

    const sqlPrompt = `Translate the following billing support request into a SQL SELECT query for a PostgreSQL table named "invoices" with columns id, invoice_number, date, amount, vendor, paid, approval_status. Only return the SQL query.\n\nRequest: ${question}`;

    const sqlRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You convert billing questions to SQL.' },
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
    res.json({ query: sql, rows: result.rows });
  } catch (error) {
    console.error('Billing query error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to process billing query.' });
  }
};

// Natural language query for charting
export const nlChartQuery = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: 'Missing question.' });

    const prompt = `Translate the following request into a SQL SELECT query for a PostgreSQL table named "invoices" with columns id, invoice_number, date, amount, vendor, tags. Use aggregates if needed. Only return the SQL query.\n\nRequest: ${question}`;

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
    const cols = result.fields.map(f => f.name);
    let chart;
    if (cols.length === 2) {
      const [labelCol, valueCol] = cols;
      chart = {
        labels: result.rows.map(r => r[labelCol]),
        values: result.rows.map(r => Number(r[valueCol]))
      };
    }
    res.json({ query: sql, rows: result.rows, chart });
  } catch (error) {
    console.error('Chart query error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to process chart query.' });
  }
};

// Suggest semantic colors for invoice tags
export const suggestTagColors = async (req, res) => {
  try {
    const { tags } = req.body;
    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: 'Missing tags array.' });
    }

    const baseMap = {
      flagged: '#dc2626',
      reimbursed: '#16a34a',
      paid: '#16a34a',
      archived: '#6b7280',
      pending: '#facc15',
    };

    const colors = {};
    const unknown = [];
    tags.forEach((t) => {
      if (t === undefined || t === null) return;
      const tagStr = String(t);
      const key = tagStr.toLowerCase();
      if (baseMap[key]) {
        colors[tagStr] = baseMap[key];
      } else {
        unknown.push(tagStr);
      }
    });

    if (unknown.length) {
      if (process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY) {
        const prompt = `Assign an intuitive hex color code for each of these invoice tags: ${unknown.join(
          ', '
        )}. Respond with a JSON object where the keys are the tag names and the values are colors.`;
        const aiRes = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openai/gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You select distinct and meaningful colors for invoice tags.',
              },
              { role: 'user', content: prompt },
            ],
          },{
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://github.com/bini1995/invoice-uploader-ai',
              'X-Title': 'invoice-uploader-ai',
            },
          }
        );

        const raw = aiRes.data.choices?.[0]?.message?.content?.trim();
        let data = {};
        try {
          data = JSON.parse(raw);
        } catch (e) {
          console.error('Color JSON parse error:', e.message);
        }
      Object.entries(data || {}).forEach(([tag, color]) => {
          colors[tag] = color;
        });
      } else {
        // Fallback: assign random colors when no API key is configured
        unknown.forEach((tag) => {
          const rand = Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, '0');
          colors[tag] = `#${rand}`;
        });
      }
    }

    res.json({ colors });
  } catch (error) {
    console.error('Tag color suggestion error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to suggest tag colors.' });
  }
};

// --- Feedback Handling ---
export const logFeedback = async (endpoint, rating) => {
  try {
    await pool.query('INSERT INTO feedback (endpoint, rating) VALUES ($1,$2)', [endpoint, rating]);
  } catch (err) {
    console.error('Feedback log error:', err.message);
  }
};

async function aggregateFeedback() {
  try {
    const result = await pool.query(
      'SELECT endpoint, AVG(rating) AS avg_rating, COUNT(*) AS count FROM feedback GROUP BY endpoint'
    );
    console.log('Aggregated feedback:', result.rows);
  } catch (err) {
    console.error('Feedback aggregation error:', err.message);
  }
}

// aggregate feedback once a day
setInterval(aggregateFeedback, 24 * 60 * 60 * 1000);

export const onboardingHelp = async (req, res) => {
  try {
    const { topic } = req.query;
    const prompt = `Provide a short step-by-step onboarding guide for the following feature: ${topic}.`;
    const aiRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful onboarding assistant.' },
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
    const text = aiRes.data.choices?.[0]?.message?.content?.trim();
    res.json({ guide: text });
  } catch (err) {
    console.error('Onboarding help error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to fetch onboarding help.' });
  }
};

// Suggest actions for an invoice based on vendor history
export const thinkSuggestion = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: 'Missing invoice id.' });

    const invRes = await pool.query(
      'SELECT invoice_number, vendor, amount, due_date FROM invoices WHERE id = $1',
      [id]
    );
    if (!invRes.rows.length) return res.status(404).json({ message: 'Invoice not found' });
    const inv = invRes.rows[0];

    const histRes = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE due_date < NOW() AND paid=FALSE) AS overdue,
              COUNT(*) AS total
         FROM invoices WHERE vendor = $1`,
      [inv.vendor]
    );
    const history = histRes.rows[0];

    const prompt = `Given this invoice:\n- Number: ${inv.invoice_number}\n- Amount: $${inv.amount}\n- Vendor: ${inv.vendor}\n- Due: ${inv.due_date}
Vendor has ${history.overdue} overdue out of ${history.total} invoices historically.
In one short sentence, suggest an action for accounts payable (e.g. \"Delay invoice – vendor historically late\").`;

    const aiRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You give concise AP suggestions.' },
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
    const suggestion = aiRes.data.choices?.[0]?.message?.content?.trim();
    res.json({ suggestion });
  } catch (err) {
    console.error('Think suggestion error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate suggestion.' });
  }
};

// Generate an email reminder template for an overdue invoice
export const overdueEmailTemplate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: 'Missing invoice id.' });

    const invRes = await pool.query(
      'SELECT invoice_number, vendor, amount, due_date FROM invoices WHERE id = $1',
      [id]
    );
    if (!invRes.rows.length) return res.status(404).json({ message: 'Invoice not found' });
    const inv = invRes.rows[0];

    const prompt = `Draft a short professional email reminding the vendor that invoice #${inv.invoice_number} for $${inv.amount} is overdue. Ask for prompt payment.`;

    const aiRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You draft polite payment reminder emails.' },
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
    const template = aiRes.data.choices?.[0]?.message?.content?.trim();
    res.json({ template });
  } catch (err) {
    console.error('Email template error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate email template.' });
  }
};

// OpsClaim copilot uses claim metadata for context-aware answers
export const invoiceCopilot = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { question } = req.body || {};
    if (!id || !question) {
      return res.status(400).json({ message: 'Missing invoice id or question.' });
    }

    const invRes = await pool.query(
      'SELECT invoice_number, vendor, amount, date, approval_status, paid, tags FROM invoices WHERE id = $1',
      [id]
    );
    if (!invRes.rows.length) return res.status(404).json({ message: 'Invoice not found' });
    const inv = invRes.rows[0];
    const tagList = Array.isArray(inv.tags) ? inv.tags.join(', ') : inv.tags || '';
    const context =
      `Invoice #${inv.invoice_number} from ${inv.vendor} for $${inv.amount} ` +
      `dated ${inv.date ? inv.date.toISOString().split('T')[0] : ''}. ` +
      `Status: ${inv.approval_status || 'N/A'}, Paid: ${inv.paid ? 'Yes' : 'No'}. ` +
      `Tags: ${tagList || 'none'}.`;

    const prompt = `${context}\n\nUser question: ${question}`;

    const aiRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an accounting assistant that answers questions about a single invoice using the provided context.',
          },
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
    const answer = aiRes.data.choices?.[0]?.message?.content?.trim();
    res.json({ answer });
  } catch (err) {
    console.error('Invoice copilot error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to process copilot query.' });
  }
};

// Use OpenAI function calling to suggest fixes for CSV upload errors
export const suggestFixes = async (req, res) => {
  try {
    const { errors } = req.body;
    if (!Array.isArray(errors) || errors.length === 0) {
      return res.status(400).json({ message: 'No errors provided' });
    }

    const functions = [
      {
        name: 'suggest_fixes',
        description: 'Suggest fixes for invoice errors',
        parameters: {
          type: 'object',
          properties: {
            fixes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', description: 'field to fix' },
                  fix: { type: 'string', description: 'recommended value' },
                },
                required: ['field', 'fix'],
              },
            },
          },
          required: ['fixes'],
        },
      },
    ];

    const completion = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo-1106',
        messages: [
          { role: 'system', content: 'You suggest fixes for invoice CSV errors.' },
          { role: 'user', content: `Errors:\n${errors.join('\n')}` },
        ],
        functions,
        function_call: 'auto',
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

    const choice = completion.data.choices?.[0];
    if (choice?.finish_reason === 'function_call') {
      const args = JSON.parse(choice.message.function_call.arguments || '{}');
      return res.json(args);
    }
    res.json({ suggestion: choice?.message?.content?.trim() });
  } catch (err) {
    console.error('Fix suggestion error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate fix suggestions' });
  }
};

// Parse natural language search queries into filter parameters
export const smartSearchParse = (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Missing query text.' });
    const filters = {};
    const vendorMatch = query.match(/from\s+([\w\s&]+)/i);
    if (vendorMatch) filters.vendor = vendorMatch[1].trim();
    const gt = query.match(/>\s*\$?([0-9,\.]+)/);
    if (gt) filters.minAmount = parseFloat(gt[1].replace(/,/g, ''));
    const lt = query.match(/<\s*\$?([0-9,\.]+)/);
    if (lt) filters.maxAmount = parseFloat(lt[1].replace(/,/g, ''));
    const between = query.match(/\$?([0-9,\.]+)\s*-\s*\$?([0-9,\.]+)/);
    if (between) {
      filters.minAmount = parseFloat(between[1].replace(/,/g, ''));
      filters.maxAmount = parseFloat(between[2].replace(/,/g, ''));
    }
    const range = chrono.parse(query);
    if (range.length) {
      const { start, end } = range[0];
      if (start) filters.startDate = start.date().toISOString().slice(0, 10);
      if (end) filters.endDate = end.date().toISOString().slice(0, 10);
    }
    res.json({ filters });
  } catch (err) {
    console.error('Smart search parse error:', err);
    res.status(500).json({ message: 'Failed to parse query' });
  }
};

// Suggest high level categories for any document content
export const categorizeDocument = async (req, res) => {
  try {
    const { content, claim_type } = req.body || {};
    if (!content) {
      return res.status(400).json({ message: 'Missing document content' });
    }
    const typeHint = claim_type ? `Claim type: ${claim_type}. ` : '';
    const prompt =
      `${typeHint}Suggest up to 3 broad business categories like HR or Expense for this document:\n\n${content.slice(0, 2000)}`;
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const raw = response.data.choices?.[0]?.message?.content?.trim() || '';
    const categories = raw.split(/[\n,]/).map((c) => c.trim()).filter(Boolean);
    const confidences = [0.9, 0.6, 0.3];
    const inserted = [];
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const conf = confidences[i] || 0.1;
      const r = await pool.query(
        `INSERT INTO category_feedback (document_id, suggested_category, confidence)
         VALUES ($1,$2,$3) RETURNING id`,
        [req.body.document_id || null, cat, conf]
      );
      inserted.push({ id: r.rows[0].id, category: cat, confidence: conf, claim_type: claim_type || null });
    }
    res.json({ categories: inserted, claim_type: claim_type || null });
  } catch (err) {
    console.error('Categorize document error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to categorize document' });
  }
};

export const categoryFeedback = async (req, res) => {
  const { id } = req.params;
  const { accepted } = req.body || {};
  if (typeof accepted === 'undefined') {
    return res.status(400).json({ message: 'accepted required' });
  }
  try {
    await pool.query('UPDATE category_feedback SET accepted = $1 WHERE id = $2', [accepted, id]);
    res.json({ message: 'Feedback recorded' });
  } catch (err) {
    console.error('Category feedback error:', err);
    res.status(500).json({ message: 'Failed to record feedback' });
  }
};
