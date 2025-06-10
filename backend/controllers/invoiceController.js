const fs = require('fs');
const pool = require('../config/db');
const { parseCSV } = require('../utils/csvParser');
const openai = require("../config/openai"); // ✅ re-use the config
const axios = require('axios');

// Basic vendor -> tag mapping for quick suggestions
const vendorTagMap = {
  staples: ['Office Supplies'],
  notion: ['SaaS'],
  figma: ['SaaS'],
};


exports.uploadInvoiceCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const invoices = await parseCSV(req.file.path);
    const validRows = [];
    const errors = [];

    invoices.forEach((inv, index) => {
      const rowNum = index + 2; // header + 1-index

      const invoice_number = inv.invoice_number?.trim();
      const date = inv.date?.trim();
      const amount = inv.amount?.trim();
      const vendor = inv.vendor?.trim();

      if (!invoice_number || !date || !amount || !vendor) {
        errors.push(`Row ${rowNum}: Missing required field`);
        return;
      }

      if (isNaN(parseFloat(amount))) {
        errors.push(`Row ${rowNum}: Amount is not a valid number`);
        return;
      }

      if (isNaN(Date.parse(date))) {
        errors.push(`Row ${rowNum}: Date is not valid`);
        return;
      }

      validRows.push({
        invoice_number,
        date: new Date(date),
        amount: parseFloat(amount),
        vendor,
      });
    });

    for (const inv of validRows) {
      await pool.query(
        `INSERT INTO invoices (invoice_number, date, amount, vendor, assignee)
         VALUES ($1, $2, $3, $4, $5)`,
        [inv.invoice_number, inv.date, inv.amount, inv.vendor, null]
      );
    }

    fs.unlinkSync(req.file.path); // cleanup uploaded file

    res.json({
      message: 'Upload complete',
      inserted: validRows.length,
      errors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  const client = await pool.connect();
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const assignee = req.query.assignee;
    const conditions = [];
    const params = [];
    if (!includeArchived) {
      conditions.push('archived = false');
    }
    if (assignee) {
      params.push(assignee);
      conditions.push(`assignee = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM invoices ${where} ORDER BY id DESC`;

    const result = await client.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices.' });
  } finally {
    client.release();
  }
};

// Clear all invoices 


// Delete all invoices
exports.clearAllInvoices = async (req, res) => {
  try {
    await pool.query('DELETE FROM invoices');
    res.json({ message: 'All invoices deleted successfully.' });
  } catch (err) {
    console.error('Error deleting invoices:', err);
    res.status(500).json({ message: 'Failed to delete invoices.' });
  }
};


exports.summarizeErrors = async (req, res) => {
  try {
    const { errors } = req.body;

    if (!Array.isArray(errors) || errors.length === 0) {
      return res.status(400).json({ message: 'No errors provided' });
    }

    const prompt = `Summarize these CSV row validation errors clearly:\n\n${errors.join('\n')}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const summary = completion.choices[0].message.content;
    res.json({ summary });

  } catch (error) {
    console.error('OpenAI error:', error.message);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
};

exports.deleteInvoiceById = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query('DELETE FROM invoices WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting invoice' });
  }
};


exports.searchInvoicesByVendor = async (req, res) => {
  const { vendor } = req.query;

  if (!vendor) {
    return res.status(400).json({ message: 'Vendor name is required for search.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM invoices WHERE LOWER(vendor) LIKE LOWER($1) ORDER BY created_at DESC',
      [`%${vendor}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Failed to search invoices.' });
  }
};

const { Parser } = require('json2csv');

exports.exportFilteredInvoicesCSV = async (req, res) => {
  try {
    const invoices = req.body.invoices;

    if (!Array.isArray(invoices) || invoices.length === 0) {
      return res.status(400).json({ message: 'No invoices provided for export.' });
    }

    const fields = ['id', 'invoice_number', 'date', 'amount', 'vendor'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(invoices);

    res.header('Content-Type', 'text/csv');
    res.attachment('filtered_invoices.csv');
    return res.send(csv);
  } catch (err) {
    console.error('CSV export error:', err);
    return res.status(500).json({ message: 'Failed to export invoices.' });
  }
};

const { stringify } = require('csv-stringify');

exports.exportAllInvoices = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
    const invoices = result.rows;

    const csvStream = stringify({
      header: true,
      columns: ['id', 'invoice_number', 'date', 'amount', 'vendor', 'created_at']
    });

    res.setHeader('Content-Disposition', 'attachment; filename="all_invoices.csv"');
    res.setHeader('Content-Type', 'text/csv');

    invoices.forEach((inv) => {
      csvStream.write(inv);
    });

    csvStream.end();
    csvStream.pipe(res);
  } catch (error) {
    console.error('Export all invoices error:', error);
    res.status(500).json({ message: 'Failed to export invoices.' });
  }
};

// backend/controllers/invoiceController.js


exports.flagSuspiciousInvoice = async (req, res) => {
  try {
    const { invoice } = req.body;

    if (!invoice || !invoice.invoice_number || !invoice.amount || !invoice.date || !invoice.vendor) {
      return res.status(400).json({ message: 'Incomplete invoice data provided.' });
    }

    const prompt = `
You're a fraud detection expert. Here's an invoice:
- Invoice #: ${invoice.invoice_number}
- Date: ${invoice.date}
- Amount: $${invoice.amount}
- Vendor: ${invoice.vendor}

Analyze this invoice for potential fraud or unusual patterns.
Return a brief explanation.
`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a fraud detection assistant.' },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/bini1995/invoice-uploader-ai',
          'X-Title': 'invoice-uploader-ai'
        },
      }
    );

    console.log('🔍 AI raw response:', JSON.stringify(response.data, null, 2));

    const result = response.data.choices?.[0]?.message?.content?.trim();

    if (!result) {
      console.warn('⚠️ No AI message content returned.');
      return res.status(200).json({ message: 'No insights returned.' });
    }

    res.json({ insights: result });
  } catch (error) {
    console.error('AI suspicion check error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to get suspicion insights.' });
  }
};

exports.archiveInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE invoices SET archived = TRUE WHERE id = $1', [id]);
    res.json({ message: 'Invoice archived.' });
  } catch (err) {
    console.error('Archive error:', err);
    res.status(500).json({ message: 'Failed to archive invoice.' });
  }
};

exports.unarchiveInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE invoices SET archived = false WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice unarchived successfully', invoice: result.rows[0] });
  } catch (error) {
    console.error('Unarchive error:', error);
    res.status(500).json({ message: 'Failed to unarchive invoice' });
  }
};

exports.markInvoicePaid = async (req, res) => {
  const { id } = req.params;
  const { paid } = req.body;

  try {
    const result = await pool.query('UPDATE invoices SET paid = $1 WHERE id = $2 RETURNING *', [paid, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }
    res.json({ message: `Invoice marked as ${paid ? 'paid' : 'unpaid'}.`, invoice: result.rows[0] });
  } catch (err) {
    console.error('Mark paid error:', err);
    res.status(500).json({ message: 'Failed to update invoice.' });
  }
};

exports.assignInvoice = async (req, res) => {
  const { id } = req.params;
  const { assignee } = req.body;
  try {
    await pool.query('UPDATE invoices SET assignee = $1 WHERE id = $2', [assignee, id]);
    res.json({ message: `Invoice assigned to ${assignee || 'nobody'}.` });
  } catch (err) {
    console.error('Assign error:', err);
    res.status(500).json({ message: 'Failed to assign invoice.' });
  }
};

exports.approveInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE invoices SET approval_status = 'Approved',
       approval_history = coalesce(approval_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('status','Approved','date', NOW()))
       WHERE id = $1 RETURNING approval_status, approval_history`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice approved', invoice: result.rows[0] });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ message: 'Failed to approve invoice' });
  }
};

exports.rejectInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE invoices SET approval_status = 'Rejected',
       approval_history = coalesce(approval_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('status','Rejected','date', NOW()))
       WHERE id = $1 RETURNING approval_status, approval_history`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice rejected', invoice: result.rows[0] });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ message: 'Failed to reject invoice' });
  }
};

exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Comment text required' });
  try {
    const result = await pool.query(
      `UPDATE invoices SET comments = coalesce(comments, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('text',$1,'date',NOW()))
       WHERE id = $2 RETURNING comments`,
      [text, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Comment added', comments: result.rows[0].comments });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

exports.handleSuggestion = async (req, res) => {
  try {
    const { invoice } = req.body;

    if (!invoice || !invoice.invoice_number || !invoice.amount || !invoice.date || !invoice.vendor) {
      return res.status(400).json({ message: 'Missing invoice data for suggestion.' });
    }

    const prompt = `
      You're an expert in vendor optimization. Based on this invoice:
      - Invoice #: ${invoice.invoice_number}
      - Date: ${invoice.date}
      - Amount: $${invoice.amount}
      - Vendor: ${invoice.vendor}

      Suggest a better or more suitable vendor (if any) based on common industry practices, and explain why. If the current vendor is appropriate, state that too.
      `;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a vendor suggestion assistant.' },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/bini1995/invoice-uploader-ai',
          'X-Title': 'invoice-uploader-ai'
        },
      }
    );

    const suggestion = response.data.choices?.[0]?.message?.content?.trim();

    if (!suggestion) {
      return res.status(200).json({ message: 'No vendor suggestion returned.' });
    }

    res.json({ suggestion });
  } catch (error) {
    console.error('Vendor suggestion error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to generate vendor suggestion.' });
  }
};

exports.updateInvoiceField = async (req, res) => {
  const { id } = req.params;
  const { field, value } = req.body;

  if (!['amount', 'vendor', 'date'].includes(field)) {
    return res.status(400).json({ message: 'Invalid field to update.' });
  }

  try {
    await pool.query(
      `UPDATE invoices SET ${field} = $1 WHERE id = $2`,
      [value, id]
    );
    res.json({ message: `Invoice ${field} updated successfully.` });
  } catch (err) {
    console.error('Update invoice error:', err);
    res.status(500).json({ message: 'Failed to update invoice.' });
  }
};

exports.suggestTags = async (req, res) => {
  try {
    const { invoice } = req.body;

    // Check simple mapping first
    const vendorKey = invoice.vendor?.toLowerCase() || '';
    for (const [key, tags] of Object.entries(vendorTagMap)) {
      if (vendorKey.includes(key)) {
        return res.json({ tags });
      }
    }

    const prompt = `
      You are an intelligent finance assistant. Based on the following invoice details:
      - Vendor: ${invoice.vendor}
      - Amount: ${invoice.amount}
      - Description: ${invoice.description || 'None'}

      Suggest 1–3 relevant tags or categories (e.g., 'Marketing', 'Office Supplies', 'Travel', etc.).
    `;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful finance assistant.' },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const tags = response.data.choices[0]?.message?.content?.trim();
    res.json({ tags });
  } catch (err) {
    console.error('Tag suggestion error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate tag suggestions' });
  }
};


const PDFDocument = require('pdfkit');


const { parse } = require('json2csv');

function exportArchivedInvoicesCSV(req, res) {
  try {
    const invoices = require('../data/invoices.json');
    const archivedInvoices = invoices.filter((inv) => inv.archived);
    const csv = parse(archivedInvoices, {
      fields: ['id', 'invoice_number', 'date', 'amount', 'vendor', 'tags'],
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('archived_invoices.csv');
    return res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: 'Failed to export archived invoices.' });
  }
}

module.exports.exportArchivedInvoicesCSV = exportArchivedInvoicesCSV;

// ✅ Update invoice tags
exports.updateInvoiceTags = (req, res) => {
  const id = parseInt(req.params.id);
  const { tags } = req.body;

  if (!Array.isArray(tags)) {
    return res.status(400).json({ message: 'Tags must be an array' });
  }

  const invoices = require('../data/invoices.json');
  const invoiceIndex = invoices.findIndex((inv) => inv.id === id);

  if (invoiceIndex === -1) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  invoices[invoiceIndex].tags = tags;
  fs.writeFileSync(path.join(__dirname, '../data/invoices.json'), JSON.stringify(invoices, null, 2));
  res.json({ message: '✅ Tags updated successfully' });
};

// ✅ Generate PDF for one invoice
exports.generateInvoicePDF = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const invoices = require('../data/invoices.json');
    const invoice = invoices.find(inv => inv.id === id);

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text(`Invoice #${invoice.invoice_number}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Vendor: ${invoice.vendor}`);
    doc.text(`Date: ${invoice.date}`);
    doc.text(`Amount: $${invoice.amount}`);
    doc.text(`Tags: ${(invoice.tags || []).join(', ')}`);
    doc.text(`Created At: ${invoice.created_at}`);
    doc.text(`Updated At: ${invoice.updated_at}`);
    doc.end();
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};



const updateInvoiceTags = (req, res) => {
  const invoiceId = parseInt(req.params.id);
  const { tags } = req.body;

  if (!Array.isArray(tags)) {
    return res.status(400).json({ message: 'Tags must be an array' });
  }

  const filePath = path.join(__dirname, '../data/invoices.json');
  let invoices = [];

  try {
    invoices = JSON.parse(fs.readFileSync(filePath));
  } catch (err) {
    console.error('Failed to read invoices:', err);
    return res.status(500).json({ message: 'Failed to read invoice data' });
  }

  const invoice = invoices.find(inv => inv.id === invoiceId);
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  invoice.tags = tags;

  try {
    fs.writeFileSync(filePath, JSON.stringify(invoices, null, 2));
    res.json({ message: 'Tags updated', tags });
  } catch (err) {
    console.error('Failed to save tags:', err);
    res.status(500).json({ message: 'Failed to save updated tags' });
  }
};


const generateInvoicePDF = (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoices = require('../data/invoices.json'); // Adjust this if you're using a database
    const invoice = invoices.find((inv) => inv.id == invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text(`Invoice #${invoice.invoice_number}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${invoice.date}`);
    doc.text(`Vendor: ${invoice.vendor}`);
    doc.text(`Amount: $${parseFloat(invoice.amount).toFixed(2)}`);
    doc.text(`Tags: ${(invoice.tags || []).join(', ')}`);
    doc.text(`Created At: ${invoice.created_at || '—'}`);
    doc.text(`Updated At: ${invoice.updated_at || '—'}`);
    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};

exports.getMonthlyInsights = async (req, res) => {
  const client = await pool.connect();
  try {
    const now = new Date();
    const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    const startNext = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentRes = await client.query(
      `SELECT vendor, SUM(amount) AS total
       FROM invoices
       WHERE date >= $1 AND date < $2
       GROUP BY vendor`,
      [startCurrent, startNext]
    );

    const prevRes = await client.query(
      `SELECT vendor, SUM(amount) AS total
       FROM invoices
       WHERE date >= $1 AND date < $2
       GROUP BY vendor`,
      [startPrev, startCurrent]
    );

    const prevMap = {};
    prevRes.rows.forEach(r => {
      prevMap[r.vendor] = parseFloat(r.total);
    });

    const vendorTotals = currentRes.rows.map(r => {
      const prev = prevMap[r.vendor] || 0;
      const change = prev === 0 ? (parseFloat(r.total) > 0 ? 100 : 0) : ((parseFloat(r.total) - prev) / prev) * 100;
      return {
        vendor: r.vendor,
        total: parseFloat(r.total),
        percentChange: parseFloat(change.toFixed(2)),
      };
    });

    const formatted = vendorTotals
      .map(v => `${v.vendor}: $${v.total.toFixed(2)} (${v.percentChange > 0 ? '+' : ''}${v.percentChange.toFixed(1)}%)`)
      .join('\n');

    const prompt = `Provide a short summary of this month's spending compared to last month:\n\n${formatted}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const summary = completion.choices[0].message.content;

    res.json({ vendorTotals, summary });
  } catch (err) {
    console.error('Monthly insights error:', err);
    res.status(500).json({ message: 'Failed to generate monthly insights' });
  } finally {
    client.release();
  }
};

exports.getCashFlow = async (req, res) => {
  const interval = req.query.interval === 'weekly' ? 'week' : 'month';
  const groupExpr = interval === 'week' ? "DATE_TRUNC('week', date)" : "DATE_TRUNC('month', date)";
  try {
    const result = await pool.query(
      `SELECT ${groupExpr} AS period, SUM(amount) AS total
       FROM invoices
       GROUP BY period
       ORDER BY period`
    );
    const rows = result.rows.map(r => ({
      period: r.period,
      total: parseFloat(r.total)
    }));
    res.json({ interval, data: rows });
  } catch (err) {
    console.error('Cash flow trend error:', err);
    res.status(500).json({ message: 'Failed to fetch cash flow trends' });
  }
};

exports.getTopVendors = async (req, res) => {
  const client = await pool.connect();
  try {
    let { tag, startDate, endDate, minAmount, maxAmount } = req.query;

    if (!startDate || !endDate) {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      const end = new Date(now.getFullYear(), quarter * 3 + 3, 1);
      startDate = startDate || start.toISOString();
      endDate = endDate || end.toISOString();
    }

    const conditions = [];
    const params = [];
    if (startDate) {
      params.push(startDate);
      conditions.push(`date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`date < $${params.length}`);
    }
    if (minAmount) {
      params.push(minAmount);
      conditions.push(`amount >= $${params.length}`);
    }
    if (maxAmount) {
      params.push(maxAmount);
      conditions.push(`amount <= $${params.length}`);
    }
    if (tag) {
      params.push(tag);
      conditions.push(`tags ? $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT vendor, SUM(amount) AS total FROM invoices ${where} GROUP BY vendor ORDER BY total DESC LIMIT 5`;
    const result = await client.query(query, params);
    const rows = result.rows.map(r => ({ vendor: r.vendor, total: parseFloat(r.total) }));
    res.json({ topVendors: rows });
  } catch (err) {
    console.error('Top vendors error:', err);
    res.status(500).json({ message: 'Failed to fetch top vendors' });
  } finally {
    client.release();
  }
};



module.exports = {
  updateInvoiceTags,
  generateInvoicePDF,
  suggestTags,
  flagSuspiciousInvoice,
  updateInvoiceField,
  // ✅ Add all others you want to expose:
  uploadInvoiceCSV,
  getAllInvoices,
  clearAllInvoices,
  deleteInvoiceById,
  searchInvoicesByVendor,
  exportFilteredInvoicesCSV,
  exportAllInvoices,
  exportArchivedInvoicesCSV,
  archiveInvoice,
  unarchiveInvoice,
  markInvoicePaid,
  assignInvoice,
  approveInvoice,
  rejectInvoice,
  addComment,
  handleSuggestion,
  summarizeErrors,
  getMonthlyInsights,
  getCashFlow,
  getTopVendors,
};

