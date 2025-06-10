const fs = require('fs');
const pool = require('../config/db');
const path = require('path');
const { parseCSV } = require('../utils/csvParser');
const { parsePDF } = require('../utils/pdfParser');
const openai = require("../config/openai"); // ✅ re-use the config
const axios = require('axios');
const { applyRules } = require('../utils/rulesEngine');
const { logActivity } = require('../utils/activityLogger');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');

// Basic vendor -> tag mapping for quick suggestions
const vendorTagMap = {
  staples: ['Office Supplies'],
  notion: ['SaaS'],
  figma: ['SaaS'],
  aws: ['Cloud'],
  zoom: ['SaaS'],
};

const vendorPaymentMap = {
  aws: 'Net 15',
  zoom: 'Net 30',
};


exports.uploadInvoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let invoices;
    if (ext === '.csv') {
      invoices = await parseCSV(req.file.path);
    } else if (ext === '.pdf') {
      invoices = await parsePDF(req.file.path);
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }
    const fileBuffer = fs.readFileSync(req.file.path);
    const integrityHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const retention = req.body.retention || 'forever';
    let deleteAt = null;
    if (retention === '6m') {
      deleteAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
    } else if (retention === '2y') {
      deleteAt = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
    }
    const validRows = [];
    const errors = [];

    invoices.forEach((inv, index) => {
      const rowNum = index + 1;

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

      const withRules = applyRules({
        invoice_number,
        date: new Date(date),
        amount: parseFloat(amount),
        vendor,
      });
      validRows.push(withRules);
    });

    const tenantId = req.headers['x-tenant-id'] || 'default';
    for (const inv of validRows) {
      const insertRes = await pool.query(
        `INSERT INTO invoices (invoice_number, date, amount, vendor, assignee, flagged, flag_reason, approval_chain, current_step, integrity_hash, retention_policy, delete_at, tenant_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
        [
          inv.invoice_number,
          inv.date,
          inv.amount,
          inv.vendor,
          null,
          inv.flagged || false,
          inv.flag_reason,
          JSON.stringify(['Manager','Finance','CFO']),
          0,
          integrityHash,
          retention,
          deleteAt,
          tenantId,
        ]
      );
      const newId = insertRes.rows[0].id;
      await autoAssignInvoice(newId, inv.vendor, inv.tags || []);
    }

    fs.unlinkSync(req.file.path); // cleanup uploaded file
    await logActivity(req.user?.userId, 'upload_invoice');

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
    const tenantId = req.headers['x-tenant-id'] || req.query.tenant || 'default';
    const conditions = [];
    const params = [];
    if (!includeArchived) {
      conditions.push('archived = false');
    }
    if (assignee) {
      params.push(assignee);
      conditions.push(`assignee = $${params.length}`);
    }
    if (tenantId) {
      params.push(tenantId);
      conditions.push(`tenant_id = $${params.length}`);
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
    await logActivity(req.user?.userId, 'clear_invoices');
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
    await logActivity(req.user?.userId, 'delete_invoice', id);
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

async function autoAssignInvoice(invoiceId, vendor, tags = []) {
  let assignee = null;
  if (vendor && vendor.toLowerCase().includes('figma')) {
    assignee = 'Design Team';
  }
  if (tags.map(t => t.toLowerCase()).includes('marketing')) {
    assignee = 'Alice';
  }
  if (assignee) {
    try {
      await pool.query('UPDATE invoices SET assignee = $1 WHERE id = $2', [assignee, invoiceId]);
    } catch (err) {
      console.error('Auto-assign error:', err);
    }
  }
}

exports.approveInvoice = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body || {};
  try {
    const invRes = await pool.query('SELECT approval_chain, current_step FROM invoices WHERE id = $1', [id]);
    if (invRes.rows.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const invoice = invRes.rows[0];
    const chain = invoice.approval_chain || ['Manager','Finance','CFO'];
    const step = chain[invoice.current_step] || 'Unknown';
    const nextStep = invoice.current_step + 1;
    const status = nextStep >= chain.length ? 'Approved' : 'In Progress';

    const result = await pool.query(
      `UPDATE invoices SET approval_status = $1,
       current_step = $2,
       approval_history = coalesce(approval_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('step',$3,'status','Approved','date', NOW(),'comment',$4))
       WHERE id = $5 RETURNING approval_status, approval_history, current_step`,
      [status, nextStep, step, comment || '', id]
    );
    await logActivity(req.user?.userId, 'approve_invoice', id);
    res.json({ message: 'Invoice approved', invoice: result.rows[0] });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ message: 'Failed to approve invoice' });
  }
};

exports.rejectInvoice = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body || {};
  try {
    const invRes = await pool.query('SELECT approval_chain, current_step FROM invoices WHERE id = $1', [id]);
    if (invRes.rows.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const invoice = invRes.rows[0];
    const chain = invoice.approval_chain || ['Manager','Finance','CFO'];
    const step = chain[invoice.current_step] || 'Unknown';

    const result = await pool.query(
      `UPDATE invoices SET approval_status = 'Rejected',
       current_step = -1,
       approval_history = coalesce(approval_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('step',$1,'status','Rejected','date', NOW(),'comment',$2))
       WHERE id = $3 RETURNING approval_status, approval_history`,
      [step, comment || '', id]
    );
    await logActivity(req.user?.userId, 'reject_invoice', id);
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
    await logActivity(req.user?.userId, 'add_comment', id);
    res.json({ message: 'Comment added', comments: result.rows[0].comments });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

exports.updatePrivateNotes = async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  try {
    await pool.query('UPDATE invoices SET private_notes = $1 WHERE id = $2', [notes || '', id]);
    await logActivity(req.user?.userId, 'update_notes', id);
    res.json({ message: 'Notes updated' });
  } catch (err) {
    console.error('Update notes error:', err);
    res.status(500).json({ message: 'Failed to update notes' });
  }
};

exports.updateRetentionPolicy = async (req, res) => {
  const { id } = req.params;
  const { retention } = req.body;
  let deleteAt = null;
  if (retention === '6m') {
    deleteAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
  } else if (retention === '2y') {
    deleteAt = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
  }
  try {
    await pool.query(
      'UPDATE invoices SET retention_policy = $1, delete_at = $2 WHERE id = $3',
      [retention || 'forever', deleteAt, id]
    );
    await logActivity(req.user?.userId, 'update_retention', id);
    res.json({ message: 'Retention policy updated' });
  } catch (err) {
    console.error('Retention update error:', err);
    res.status(500).json({ message: 'Failed to update retention' });
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

  if (!['amount', 'vendor', 'date', 'priority'].includes(field)) {
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

exports.bulkArchiveInvoices = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No invoice IDs provided' });
  }
  try {
    await pool.query('UPDATE invoices SET archived = TRUE WHERE id = ANY($1::int[])', [ids]);
    await logActivity(req.user?.userId, 'bulk_archive');
    res.json({ message: 'Invoices archived' });
  } catch (err) {
    console.error('Bulk archive error:', err);
    res.status(500).json({ message: 'Failed to archive invoices' });
  }
};

exports.bulkAssignInvoices = async (req, res) => {
  const { ids, assignee } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No invoice IDs provided' });
  }
  try {
    await pool.query('UPDATE invoices SET assignee = $1 WHERE id = ANY($2::int[])', [assignee || null, ids]);
    await logActivity(req.user?.userId, 'bulk_assign');
    res.json({ message: 'Invoices assigned' });
  } catch (err) {
    console.error('Bulk assign error:', err);
    res.status(500).json({ message: 'Failed to assign invoices' });
  }
};

exports.bulkApproveInvoices = async (req, res) => {
  const { ids, comment } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No invoice IDs provided' });
  }
  try {
    for (const id of ids) {
      const invRes = await pool.query('SELECT approval_chain, current_step FROM invoices WHERE id = $1', [id]);
      if (invRes.rows.length === 0) continue;
      const invoice = invRes.rows[0];
      const chain = invoice.approval_chain || ['Manager','Finance','CFO'];
      const step = chain[invoice.current_step] || 'Unknown';
      const nextStep = invoice.current_step + 1;
      const status = nextStep >= chain.length ? 'Approved' : 'In Progress';
      await pool.query(
        `UPDATE invoices SET approval_status = $1, current_step = $2,
         approval_history = coalesce(approval_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('step',$3,'status','Approved','date', NOW(),'comment',$4))
         WHERE id = $5`,
        [status, nextStep, step, comment || '', id]
      );
    }
    await logActivity(req.user?.userId, 'bulk_approve');
    res.json({ message: 'Invoices approved' });
  } catch (err) {
    console.error('Bulk approve error:', err);
    res.status(500).json({ message: 'Failed to approve invoices' });
  }
};

exports.bulkRejectInvoices = async (req, res) => {
  const { ids, comment } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No invoice IDs provided' });
  }
  try {
    for (const id of ids) {
      const invRes = await pool.query('SELECT approval_chain, current_step FROM invoices WHERE id = $1', [id]);
      if (invRes.rows.length === 0) continue;
      const invoice = invRes.rows[0];
      const chain = invoice.approval_chain || ['Manager','Finance','CFO'];
      const step = chain[invoice.current_step] || 'Unknown';
      await pool.query(
        `UPDATE invoices SET approval_status = 'Rejected', current_step = -1,
         approval_history = coalesce(approval_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('step',$1,'status','Rejected','date', NOW(),'comment',$2))
         WHERE id = $3`,
        [step, comment || '', id]
      );
    }
    await logActivity(req.user?.userId, 'bulk_reject');
    res.json({ message: 'Invoices rejected' });
  } catch (err) {
    console.error('Bulk reject error:', err);
    res.status(500).json({ message: 'Failed to reject invoices' });
  }
};

exports.exportPDFBundle = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No invoice IDs provided' });
  }
  try {
    const result = await pool.query('SELECT * FROM invoices WHERE id = ANY($1::int[]) ORDER BY id', [ids]);
    const invoices = result.rows;
    const doc = new PDFDocument({ autoFirstPage: false });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="invoices.pdf"');
    doc.pipe(res);
    invoices.forEach((inv, idx) => {
      doc.addPage();
      doc.fontSize(18).text(`Invoice #${inv.invoice_number}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Vendor: ${inv.vendor}`);
      doc.text(`Date: ${inv.date}`);
      doc.text(`Amount: $${inv.amount}`);
      doc.text(`Assignee: ${inv.assignee || '—'}`);
      doc.text(`Tags: ${(inv.tags || []).join(', ')}`);
    });
    doc.end();
  } catch (err) {
    console.error('PDF bundle error:', err);
    res.status(500).json({ message: 'Failed to export invoices' });
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

// ✅ Update invoice tags in DB
exports.updateInvoiceTags = async (req, res) => {
  const id = parseInt(req.params.id);
  const { tags } = req.body;

  if (!Array.isArray(tags)) {
    return res.status(400).json({ message: 'Tags must be an array' });
  }

  try {
    const result = await pool.query(
      'UPDATE invoices SET tags = $1 WHERE id = $2 RETURNING id, vendor',
      [tags, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await autoAssignInvoice(id, result.rows[0].vendor, tags);
    res.json({ message: 'Tags updated', tags });
  } catch (err) {
    console.error('Failed to save tags:', err);
    res.status(500).json({ message: 'Failed to save updated tags' });
  }
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

exports.getSpendingByTag = async (req, res) => {
  const client = await pool.connect();
  try {
    const { startDate, endDate, minAmount, maxAmount } = req.query;
    const params = [];
    const conditions = [];

    if (startDate) {
      params.push(startDate);
      conditions.push(`date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`date <= $${params.length}`);
    }
    if (minAmount) {
      params.push(minAmount);
      conditions.push(`amount >= $${params.length}`);
    }
    if (maxAmount) {
      params.push(maxAmount);
      conditions.push(`amount <= $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT tag, SUM(amount) AS total
      FROM (
        SELECT jsonb_array_elements_text(tags) AS tag, amount
        FROM invoices
        ${where}
      ) t
      GROUP BY tag
      ORDER BY total DESC`;
    const result = await client.query(query, params);
    const rows = result.rows.map(r => ({ tag: r.tag, total: parseFloat(r.total) }));
    res.json({ byTag: rows });
  } catch (err) {
    console.error('Tag spending error:', err);
    res.status(500).json({ message: 'Failed to fetch spending by tag' });
  } finally {
    client.release();
  }
};

exports.exportDashboardPDF = async (req, res) => {
  const client = await pool.connect();
  try {
    const { tag, startDate, endDate } = req.query;
    const params = [];
    const conditions = [];

    if (startDate) {
      params.push(startDate);
      conditions.push(`date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`date <= $${params.length}`);
    }
    if (tag) {
      params.push(tag);
      conditions.push(`tags ? $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT invoice_number, date, amount, vendor, tags FROM invoices ${where} ORDER BY date DESC`;
    const result = await client.query(query, params);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="dashboard.pdf"');
    doc.pipe(res);

    doc.fontSize(18).text('Invoice Dashboard', { align: 'center' });
    doc.moveDown();

    result.rows.forEach(inv => {
      doc.fontSize(12).text(`Invoice #${inv.invoice_number}`);
      doc.text(`Date: ${inv.date}`);
      doc.text(`Vendor: ${inv.vendor}`);
      doc.text(`Amount: $${parseFloat(inv.amount).toFixed(2)}`);
      doc.text(`Tags: ${(inv.tags || []).join(', ')}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('Dashboard PDF error:', err);
    res.status(500).json({ message: 'Failed to export dashboard PDF' });
  } finally {
    client.release();
  }
};

// Automatically archive invoices older than 90 days unless marked priority
exports.autoArchiveOldInvoices = async () => {
  try {
    const result = await pool.query(`
      UPDATE invoices
      SET archived = TRUE
      WHERE archived = FALSE
        AND priority = FALSE
        AND created_at < NOW() - INTERVAL '90 days'
    `);
    if (result.rowCount > 0) {
      console.log(`\uD83D\uDCE6 Auto-archived ${result.rowCount} invoices`);
    }
  } catch (err) {
    console.error('Auto-archive error:', err);
  }
};

exports.autoDeleteExpiredInvoices = async () => {
  try {
    const result = await pool.query(
      `DELETE FROM invoices WHERE delete_at IS NOT NULL AND delete_at < NOW()`
    );
    if (result.rowCount > 0) {
      console.log(`🗑️ Auto-deleted ${result.rowCount} invoices`);
    }
  } catch (err) {
    console.error('Auto-delete error:', err);
  }
};

exports.checkRecurringInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT vendor, amount, date FROM invoices WHERE id = $1',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const { vendor, amount, date } = rows[0];
    const result = await pool.query(
      `SELECT COUNT(*) FROM invoices
       WHERE vendor = $1 AND amount = $2 AND id <> $3
         AND date >= $4::date - INTERVAL '90 days'`,
      [vendor, amount, id, date]
    );
    const count = parseInt(result.rows[0].count, 10);
    res.json({ recurring: count > 0, count });
  } catch (err) {
    console.error('Recurring check error:', err);
    res.status(500).json({ message: 'Failed to check recurring status' });
  }
};

exports.getRecurringInsights = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vendor, amount, COUNT(*) AS occurrences
      FROM invoices
      GROUP BY vendor, amount
      HAVING COUNT(*) > 1
      ORDER BY occurrences DESC
    `);
    res.json({ recurring: result.rows });
  } catch (err) {
    console.error('Recurring insights error:', err);
    res.status(500).json({ message: 'Failed to fetch recurring insights' });
  }
};

exports.getVendorProfile = async (req, res) => {
  const { vendor } = req.params;
  try {
    const result = await pool.query(
      'SELECT tags, payment_terms FROM invoices WHERE LOWER(vendor) = LOWER($1)',
      [vendor]
    );
    if (result.rows.length === 0) {
      const payment = vendorPaymentMap[vendor.toLowerCase()];
      const tags = vendorTagMap[vendor.toLowerCase()];
      return res.json({ vendor, tags, payment_terms: payment });
    }
    const tagCounts = {};
    const termCounts = {};
    result.rows.forEach((r) => {
      if (Array.isArray(r.tags)) {
        r.tags.forEach((t) => {
          const key = t.toLowerCase();
          tagCounts[key] = (tagCounts[key] || 0) + 1;
        });
      }
      if (r.payment_terms) {
        termCounts[r.payment_terms] = (termCounts[r.payment_terms] || 0) + 1;
      }
    });
    const suggestedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((e) => e[0]);
    const suggestedTerm = Object.entries(termCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    res.json({ vendor, tags: suggestedTags, payment_terms: suggestedTerm });
  } catch (err) {
    console.error('Vendor profile error:', err);
    res.status(500).json({ message: 'Failed to fetch vendor profile' });
  }
};

// Explain why an invoice was flagged
exports.explainFlaggedInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const invoice = result.rows[0];
    if (!invoice.flagged) {
      return res.status(400).json({ message: 'Invoice is not flagged' });
    }
    const avgRes = await pool.query('SELECT AVG(amount) AS avg FROM invoices WHERE vendor = $1 AND id <> $2', [invoice.vendor, id]);
    const avg = parseFloat(avgRes.rows[0].avg) || 0;
    const prompt = `You are a fraud detection assistant. Explain in one short paragraph why this invoice might be flagged.\nInvoice amount: $${invoice.amount}. Average historical amount for vendor ${invoice.vendor} is $${avg.toFixed(2)}. Flag reason: ${invoice.flag_reason || 'None'}.`;
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You explain invoice flagging decisions.' },
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
    const explanation = response.data.choices?.[0]?.message?.content?.trim();
    res.json({ explanation });
  } catch (err) {
    console.error('Flag explanation error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate flag explanation' });
  }
};

// Auto-categorize many invoices using past tagging data
exports.bulkAutoCategorize = async (req, res) => {
  const { invoices } = req.body;
  if (!Array.isArray(invoices) || invoices.length === 0) {
    return res.status(400).json({ message: 'No invoices provided' });
  }
  try {
    const history = await pool.query('SELECT vendor, tags FROM invoices WHERE tags IS NOT NULL');
    const vendorTags = {};
    history.rows.forEach((r) => {
      if (Array.isArray(r.tags)) {
        vendorTags[r.vendor] = vendorTags[r.vendor] || new Set();
        r.tags.forEach((t) => vendorTags[r.vendor].add(t));
      }
    });

    const results = [];
    for (const inv of invoices) {
      const past = Array.from(vendorTags[inv.vendor] || []);
      const prompt = `Suggest 1-3 concise categories for this invoice. Vendor: ${inv.vendor}. Amount: $${inv.amount}. Description: ${inv.description || 'None'}. Past tags for this vendor: ${past.join(', ') || 'none'}.`;
      const aiRes = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You categorize invoices for bookkeeping.' },
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
      const tags = aiRes.data.choices?.[0]?.message?.content?.trim();
      results.push({ invoice_number: inv.invoice_number, tags });
    }

    res.json({ categorizations: results });
  } catch (err) {
    console.error('Bulk categorize error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to categorize invoices' });
  }
};

// Fetch vendor bio with short description and website
exports.getVendorBio = async (req, res) => {
  const { vendor } = req.params;
  try {
    const prompt = `Provide a one sentence description, official website link, and likely industry for the company \"${vendor}\". Respond in JSON with keys description, website, and industry.`;
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You generate short company bios.' },
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
    let data = {};
    try {
      data = JSON.parse(response.data.choices?.[0]?.message?.content || '{}');
    } catch (e) {
      data = { description: response.data.choices?.[0]?.message?.content };
    }
    res.json(data);
  } catch (err) {
    console.error('Vendor bio error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to fetch vendor bio' });
  }
};



module.exports = {
  updateInvoiceTags,
  generateInvoicePDF,
  suggestTags,
  flagSuspiciousInvoice,
  updateInvoiceField,
  // ✅ Add all others you want to expose:
  uploadInvoice,
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
  getSpendingByTag,
  exportDashboardPDF,
  checkRecurringInvoice,
  getRecurringInsights,
  getVendorProfile,
  autoArchiveOldInvoices,
  autoDeleteExpiredInvoices,
  updatePrivateNotes,
  updateRetentionPolicy,
  bulkArchiveInvoices,
  bulkAssignInvoices,
  bulkApproveInvoices,
  bulkRejectInvoices,
  exportPDFBundle,
  explainFlaggedInvoice,
  bulkAutoCategorize,
  getVendorBio,
};

