const fs = require('fs');
const pool = require('../config/db');
const { parseCSV } = require('../utils/csvParser');
const openai = require("../config/openai"); // ✅ re-use the config
const axios = require('axios');


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
        `INSERT INTO invoices (invoice_number, date, amount, vendor)
         VALUES ($1, $2, $3, $4)`,
        [inv.invoice_number, inv.date, inv.amount, inv.vendor]
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
    const query = includeArchived
      ? 'SELECT * FROM invoices ORDER BY id DESC'
      : 'SELECT * FROM invoices WHERE archived = false ORDER BY id DESC';

    const result = await client.query(query);
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
  handleSuggestion,
  summarizeErrors,
};

