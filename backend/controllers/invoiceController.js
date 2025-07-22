const fs = require('fs');
const pool = require('../config/db');
const path = require('path');
const JSZip = require('jszip');
const { parseFile } = require('../services/ocrService');
const { aiDuplicateCheck, generateErrorSummary } = require('../services/aiService');
const { validateDocumentRow, validateInvoiceRow, checkSimilarity } = require('../services/validationService');
const { autoAssignInvoice, insertInvoice } = require('../services/invoiceService');
const logger = require('../utils/logger');
const { checkTenantInvoiceLimit } = require('../utils/tenantContext');
const openai = require("../config/openrouter"); // ✅ re-use the config
const axios = require('axios');
const { applyRules } = require('../utils/rulesEngine');
const { logActivity } = require('../utils/activityLogger');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');
const settings = require('../config/settings');
const { submitHashToBlockchain } = require('../utils/blockchain');
const { getWorkflowForDocument } = require('../utils/workflows');
const { evaluateWorkflowRules } = require('../utils/workflowRulesEngine');
const { getExchangeRate } = require('../utils/exchangeRates');
const { sendSlackNotification, sendTeamsNotification, sendEmailNotification } = require('../utils/notify');
const { triggerAutomations } = require('../utils/automationEngine');
const { broadcastMessage } = require('../utils/chatServer');
const { recordInvoiceVersion } = require('../utils/versionLogger');
const { getAssigneeFromVendorHistory, getAssigneeFromTags } = require('../utils/assignment');
const { encrypt } = require('../utils/encryption');
const levenshtein = require('fast-levenshtein');
const { categorizeInvoice } = require('../utils/categorize');
const { applyCorrections, loadCorrections } = require('../utils/parserTrainer');
const { selfHealInvoices } = require('../utils/selfHeal');
const { updateWeights } = require('../utils/parserTrainer');

// Basic vendor -> tag mapping for quick suggestions
const vendorTagMap = {
  staples: ['Office Supplies'],
  notion: ['SaaS'],
  figma: ['SaaS'],
  aws: ['Cloud'],
  zoom: ['SaaS'],
  verizon: ['Utilities'],
  comcast: ['Utilities'],
  netflix: ['Subscription'],
};

const vendorPaymentMap = {
  aws: 'Net 15',
  zoom: 'Net 30',
};

// Predefined categories for AI tagging
const CATEGORY_LIST = ['Office', 'Travel', 'Consulting', 'Marketing', 'Supplies'];


exports.parseInvoiceSample = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const allowed = await checkTenantInvoiceLimit(req.tenantId);
    if (!allowed) {
      fs.unlinkSync(req.file.path);
      return res.status(429).json({ message: 'Monthly invoice limit reached' });
    }

    let invoices;
    try {
      invoices = await parseFile(req.file.path);
    } catch (err) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: err.message });
    }

    invoices = invoices.map(applyCorrections);
    invoices = await selfHealInvoices(invoices);

    fs.unlinkSync(req.file.path);
    const invoice = invoices[0];
    if (!invoice) {
      return res.status(400).json({ message: 'Unable to parse invoice' });
    }

    let tags = vendorTagMap[invoice.vendor?.toLowerCase()] || [];
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const prompt = `Suggest short comma-separated tags for an invoice from ${invoice.vendor} for $${invoice.amount}.`;
        const resp = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openai/gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You provide concise invoice tags.' },
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
        const txt = resp.data.choices?.[0]?.message?.content?.trim();
        if (txt) {
          tags = txt
            .split(/[,\n]/)
            .map((t) => t.trim())
            .filter(Boolean);
        }
      } catch (err) {
        console.error('Tag suggest error:', err.response?.data || err.message);
      }
    }

    res.json({ invoice, tags });
  } catch (err) {
    console.error('Parse sample error:', err);
    res.status(500).json({ message: 'Failed to parse invoice sample' });
  }
};


exports.uploadInvoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    if ((ext === '.csv' || ext === '.xls' || ext === '.xlsx') && req.file.size > settings.csvSizeLimitMB * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: `CSV exceeds ${settings.csvSizeLimitMB}MB limit` });
    }
    if (ext === '.pdf' && req.file.size > settings.pdfSizeLimitMB * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: `PDF exceeds ${settings.pdfSizeLimitMB}MB limit` });
    }
    if ((ext === '.png' || ext === '.jpg' || ext === '.jpeg') && req.file.size > settings.pdfSizeLimitMB * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: `Image exceeds ${settings.pdfSizeLimitMB}MB limit` });
    }
    let invoices;
    try {
      invoices = await parseFile(req.file.path);
    } catch (err) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: err.message });
    }
    invoices = invoices.map(applyCorrections);
    const fileBuffer = fs.readFileSync(req.file.path);
    const integrityHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const bc = await submitHashToBlockchain(integrityHash);
    const blockchainTx = bc.txId || null;

    const encryptUploads = process.env.UPLOAD_ENCRYPTION_KEY && (req.body.encrypt === 'true' || req.headers['x-encrypt'] === 'true');

    const retention = req.body.retention || settings.defaultRetention || 'forever';
    let deleteAt = null;
    if (retention === '3mo') {
      deleteAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    } else if (retention === '1yr') {
      deleteAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    } else if (retention === '6m') {
      deleteAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
    } else if (retention === '2y') {
      deleteAt = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
    }
    const validRows = [];
    const errors = [];
    const warnings = [];

    const deptBudgetsRes = await pool.query(
      "SELECT tag, amount FROM budgets WHERE period='monthly' AND vendor IS NULL AND tag IS NOT NULL"
    );
    const deptBudgets = {};
    deptBudgetsRes.rows.forEach(b => { deptBudgets[b.tag] = parseFloat(b.amount); });
    const deptSpendCache = {};

    for (const [index, inv] of invoices.entries()) {
      const rowNum = index + 1;

      const invoice_number = inv.invoice_number?.trim();
      const date = inv.date?.trim();
      const amount = inv.amount?.trim();
      const currency = inv.currency?.trim() || req.body.currency || settings.defaultCurrency;
      const vatPercent = parseFloat(inv.vat_percent || req.body.vat_percent || settings.defaultVatPercent || 0);
      const vendor = inv.vendor?.trim();
      const party_name = inv.party_name?.trim();
      const finalParty = party_name || vendor;

      const rowErrors = await validateDocumentRow({ invoice_number, date, amount, vendor: finalParty }, rowNum, 'invoice');
      if (rowErrors.length) {
        errors.push(...rowErrors);
        continue;
      }

      const contentHash = crypto
        .createHash('sha256')
        .update(`${invoice_number}|${amount}|${finalParty}`)
        .digest('hex');
      const simWarn = await checkSimilarity(finalParty, invoice_number, amount);
      if (simWarn) warnings.push(`Row ${rowNum}: ${simWarn}`);

      const department = inv.department?.trim() || req.body.department;
      const exchangeRate = await getExchangeRate(currency);
      const originalAmount = parseFloat(amount);
      const convertedAmount = parseFloat((originalAmount * exchangeRate).toFixed(2));
      const vatAmount = parseFloat(((originalAmount * vatPercent) / 100).toFixed(2));
      const expiresAt = inv.expires_at || req.body.expires_at ||
        (req.body.expiration_days ? new Date(new Date(date).getTime() + parseInt(req.body.expiration_days) * 24 * 60 * 60 * 1000) : null);
      const withRules = await applyRules({
        invoice_number,
        date: new Date(date),
        amount: convertedAmount,
        vendor: finalParty,
        due_date: inv.due_date || inv.dueDate || null,
      });
      const ruleUpdates = await evaluateWorkflowRules({
        invoice_number,
        amount: convertedAmount,
        vendor: finalParty,
        department,
      });
      const finalDept = ruleUpdates.department || department;
      const workflow = await getWorkflowForDocument(finalDept, 'invoice', parseFloat(amount));

      try {
        if (deptBudgets[finalDept]) {
          const d = new Date(date);
          const start = new Date(d.getFullYear(), d.getMonth(), 1);
          const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
          if (deptSpendCache[finalDept] === undefined) {
            const r = await pool.query(
              'SELECT SUM(amount) AS total FROM invoices WHERE department = $1 AND date >= $2 AND date < $3',
              [finalDept, start, end]
            );
            deptSpendCache[finalDept] = parseFloat(r.rows[0].total || 0);
          }
          const projected = deptSpendCache[finalDept] + parseFloat(amount);
          if (projected > deptBudgets[finalDept]) {
            warnings.push(`Row ${rowNum}: ${finalDept} budget exceeded by this upload`);
          }
          deptSpendCache[finalDept] = projected;
        }
      } catch (e) { console.error('Budget guardrail check failed:', e.message); }

      const category = categorizeInvoice({ vendor: finalParty, description: inv.description });

      const flags = { similarFile: false, dupCombo: false, offHours: false };
      try {
        const { rows: files } = await pool.query('SELECT file_name FROM invoices WHERE file_name IS NOT NULL ORDER BY id DESC LIMIT 50');
        const fname = req.file.originalname.toLowerCase();
        for (const f of files) {
          const prev = f.file_name?.toLowerCase();
          if (!prev) continue;
          const d = levenshtein.get(fname, prev);
          if (1 - d / Math.max(fname.length, prev.length) > 0.8) { flags.similarFile = true; break; }
        }
      } catch (e) { console.error('Filename similarity check failed:', e.message); }
      try {
        const dup = await pool.query('SELECT id FROM invoices WHERE invoice_number = $1 AND amount = $2 LIMIT 1', [invoice_number, amount]);
        if (dup.rows.length) flags.dupCombo = true;
      } catch (e) { console.error('Dup combo check failed:', e.message); }
      flags.offHours = new Date().getHours() < 7 || new Date().getHours() > 19;
      const aiRes = await aiDuplicateCheck(req.file.originalname, invoice_number, amount, finalParty, flags);

      validRows.push({
        ...withRules,
        vendor: finalParty,
        party_name: finalParty,
        category,
        department: finalDept,
        assignee: ruleUpdates.assignee || null,
        original_amount: originalAmount,
        currency,
        exchange_rate: exchangeRate,
        vat_percent: vatPercent,
        vat_amount: vatAmount,
        expires_at: expiresAt,
        content_hash: contentHash,
        approval_chain: ruleUpdates.approval_chain || workflow.approvalChain,
        autoApprove: workflow.autoApprove,
        flagged: aiRes.flag || false,
        flag_reason: aiRes.reason,
      });

      try {
        const start = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), 1);
        const end = new Date(new Date(date).getFullYear(), new Date(date).getMonth() + 1, 1);
        const spendRes = await pool.query(
          'SELECT SUM(amount) AS total FROM invoices WHERE vendor = $1 AND date >= $2 AND date < $3',
          [finalParty, start, end]
        );
        const current = parseFloat(spendRes.rows[0].total || 0);
        const newTotal = current + parseFloat(amount);
        if (newTotal > 10000) {
          warnings.push(`Vendor ${finalParty} has charged $${newTotal.toFixed(2)} this month`);
        }
      } catch (e) {
        console.error('Warning check failed:', e.message);
      }
    }

    const tenantId = req.tenantId;
    for (const inv of validRows) {
      const newId = await insertInvoice({
        ...inv,
        file_name: req.file.originalname,
        integrity_hash: integrityHash,
        retention_policy: retention,
        delete_at: deleteAt,
        editor_id: req.user?.userId,
        editor_name: req.user?.username
      }, tenantId);
      if (!inv.assignee) {
        await autoAssignInvoice(newId, inv.party_name, inv.tags || []);
      }

      try {
        const poRes = await pool.query(
          'SELECT id FROM purchase_orders WHERE vendor = $1 AND amount = $2 AND matched_invoice_id IS NULL LIMIT 1',
          [inv.party_name, inv.amount]
        );
        const totalPOsRes = await pool.query('SELECT COUNT(*) AS count FROM purchase_orders');
        const hasPOs = parseInt(totalPOsRes.rows[0].count, 10) > 0;
        if (poRes.rows.length) {
          const poId = poRes.rows[0].id;
          await pool.query('UPDATE purchase_orders SET matched_invoice_id = $1, status = $2 WHERE id = $3', [newId, 'Matched', poId]);
          await pool.query('UPDATE invoices SET po_id = $1 WHERE id = $2', [poId, newId]);
        } else if (hasPOs) {
          await pool.query('UPDATE invoices SET flagged = TRUE, flag_reason = $1 WHERE id = $2', ['No matching PO', newId]);
          await sendSlackNotification(`Invoice ${inv.invoice_number} missing matching PO`);
          await sendTeamsNotification(`Invoice ${inv.invoice_number} missing matching PO`);
        }
      } catch (poErr) {
        console.error('PO match error:', poErr.message);
      }
    }

    fs.unlinkSync(req.file.path); // cleanup uploaded file
    await logActivity(req.user?.userId, 'upload_invoice', null, req.user?.username);

    let summary = null;
    if (errors.length && process.env.OPENROUTER_API_KEY) {
      summary = await generateErrorSummary(errors);
    }

    res.json({
      message: 'Upload complete',
      inserted: validRows.length,
      errors,
      warnings,
      summary,
    });
  } catch (err) {
    const logger = require('../utils/logger');
    logger.error({ err }, 'uploadInvoice failed');
    await sendSlackNotification?.(`Invoice upload failed: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.voiceUpload = async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ message: 'No voice text provided' });

    const match = text.match(/for\s+(.+?),\s*\$([0-9,.]+),\s*(.+)/i);
    if (!match) {
      return res.status(400).json({ message: 'Could not parse voice text' });
    }

    const vendor = match[1].trim();
    const amount = parseFloat(match[2].replace(/,/g, ''));
    const date = new Date(match[3].trim());
    const corrected = applyCorrections({ vendor });
    const finalVendor = corrected.vendor;
    const invoice_number = `VOICE-${Date.now()}`;

    const csv = `invoice_number,date,amount,vendor\n${invoice_number},${date
      .toISOString()
      .split('T')[0]},${amount},${vendor}\n`;

    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => {
      const pdf = Buffer.concat(chunks).toString('base64');
      res.json({ invoice_number, vendor: finalVendor, amount, date: date.toISOString(), csv, pdf });
    });
    doc.fontSize(18).text(`Invoice #${invoice_number}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Vendor: ${finalVendor}`);
    doc.text(`Date: ${date.toISOString().split('T')[0]}`);
    doc.text(`Amount: $${amount.toFixed(2)}`);
    doc.end();
  } catch (err) {
    console.error('Voice upload error:', err);
    await sendSlackNotification?.(`Voice upload failed: ${err.message}`);
    res.status(500).json({ message: 'Failed to process voice upload' });
  }
};

exports.conversationalUpload = async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ message: 'No text provided' });

    const amountMatch = text.match(/\$([0-9,.]+)/);
    const vendorMatch = text.match(/invoice for ([^,]+?)(?: due|$)/i);
    const dueMatch = text.match(/due (.+)$/i);

    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;
    const vendor = vendorMatch ? vendorMatch[1].trim() : null;
    let dueDate = null;
    if (dueMatch) {
      const chrono = require('chrono-node');
      const parsed = chrono.parseDate(dueMatch[1]);
      if (parsed) {
        dueDate = parsed.toISOString().split('T')[0];
      }
    }

    if (!amount || !vendor || !dueDate) {
      return res.status(400).json({ message: 'Could not parse invoice command' });
    }

    const invoice_number = `CONV-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      'INSERT INTO invoices (invoice_number, date, amount, vendor, due_date) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [invoice_number, date, amount, vendor, dueDate]
    );

    res.json({ id: result.rows[0].id, invoice_number, vendor, amount, due_date: dueDate });
  } catch (err) {
    console.error('Conversational upload error:', err);
    res.status(500).json({ message: 'Failed to create invoice from text' });
  }
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  const client = await pool.connect();
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const assignee = req.query.assignee;
    const vendor = req.query.vendor;
    const team = req.query.team;
    const status = req.query.status;
    const tenantId = req.query.tenant || req.tenantId;
    const conditions = [];
    const params = [];
    if (req.user?.role === 'legal') {
      conditions.push('flagged = true');
    }
    if (!includeArchived) {
      conditions.push('archived = false');
    }
    if (assignee) {
      params.push(assignee);
      conditions.push(`assignee = $${params.length}`);
    }
    if (vendor) {
      params.push(vendor);
      conditions.push(`vendor = $${params.length}`);
    }
    if (team) {
      params.push(team);
      conditions.push(`department = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`approval_status = $${params.length}`);
    }
    if (tenantId) {
      params.push(tenantId);
      conditions.push(`tenant_id = $${params.length}`);
    }
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const cursor = req.query.cursor ? parseInt(req.query.cursor, 10) : null;

    if (cursor) {
      params.push(cursor);
      conditions.push(`id < $${params.length}`);
    }

    const whereFinal = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(limit);
    let query = `SELECT * FROM invoices ${whereFinal} ORDER BY id DESC LIMIT $${params.length}`;

    if (!cursor) {
      params.push(offset);
      query += ` OFFSET $${params.length}`;
    }

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
    await logActivity(req.user?.userId, 'clear_invoices', null, req.user?.username);
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
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const summary = completion.choices[0].message.content;
    res.json({ summary });

  } catch (error) {
    console.error('OpenRouter error:', error.message);
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
    await logActivity(req.user?.userId, 'delete_invoice', id, req.user?.username);
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

exports.importInvoicesCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    let rows = [];
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext === '.zip') {
      const data = fs.readFileSync(req.file.path);
      const zip = await JSZip.loadAsync(data);
      for (const name of Object.keys(zip.files)) {
        if (name.toLowerCase().endsWith('.csv')) {
          const buf = await zip.files[name].async('nodebuffer');
          const tmp = await new Promise((resolve, reject) => {
            const results = [];
            const csv = require('csv-parser');
            const stream = require('stream');
            const s = new stream.PassThrough();
            s.end(buf);
            s.pipe(csv())
              .on('data', (r) => results.push(r))
              .on('end', () => resolve(results))
              .on('error', (e) => reject(e));
          });
          rows = rows.concat(tmp);
        }
      }
    } else {
      rows = await parseCSV(req.file.path);
    }
    rows = await selfHealInvoices(rows);
    const encryptUploads = process.env.UPLOAD_ENCRYPTION_KEY && (req.body.encrypt === 'true' || req.headers['x-encrypt'] === 'true');
    const inserted = [];
    const totalRows = rows.length;
    for (const row of rows) {
      const { invoice_number, date, amount, vendor } = row;
      const result = await pool.query(
        'INSERT INTO invoices (invoice_number, date, amount, vendor, file_name, encrypted_payload) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
        [invoice_number || null, row.date || date || new Date(), parseFloat(amount || 0), vendor || null,
          req.file.originalname, encryptUploads ? encrypt(JSON.stringify(row), process.env.UPLOAD_ENCRYPTION_KEY) : null]
      );
      inserted.push(result.rows[0].id);
    }
    res.json({ inserted, totalRows });
  } catch (err) {
    console.error('Import invoices error:', err);
    res.status(500).json({ message: 'Failed to import invoices' });
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

    await sendSlackNotification(`Invoice ${invoice.invoice_number} flagged for review.`);
    await sendTeamsNotification(`Invoice ${invoice.invoice_number} flagged for review.`);
    res.json({ insights: result });
  } catch (error) {
    console.error('AI suspicion check error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to get suspicion insights.' });
  }
};

exports.archiveInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    await pool.query('UPDATE invoices SET archived = TRUE WHERE id = $1', [id]);
    const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (before.rows.length && after.rows.length) {
      await recordInvoiceVersion(id, before.rows[0], after.rows[0], req.user?.userId, req.user?.username);
    }
    res.json({ message: 'Invoice archived.' });
  } catch (err) {
    console.error('Archive error:', err);
    res.status(500).json({ message: 'Failed to archive invoice.' });
  }
};

exports.unarchiveInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    const result = await pool.query(
      'UPDATE invoices SET archived = false WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const after = result.rows[0];
    if (before.rows.length) {
      await recordInvoiceVersion(id, before.rows[0], after, req.user?.userId, req.user?.username);
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
    const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    const result = await pool.query('UPDATE invoices SET paid = $1 WHERE id = $2 RETURNING *', [paid, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }
    const after = result.rows[0];
    if (before.rows.length) {
      await recordInvoiceVersion(id, before.rows[0], after, req.user?.userId, req.user?.username);
    }
    res.json({ message: `Invoice marked as ${paid ? 'paid' : 'unpaid'}.`, invoice: result.rows[0] });
  } catch (err) {
    console.error('Mark paid error:', err);
    res.status(500).json({ message: 'Failed to update invoice.' });
  }
};

exports.setPaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['Paid', 'Scheduled', 'Declined', 'Pending'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    const result = await pool.query(
      'UPDATE invoices SET payment_status = $1, paid = ($1 = \"Paid\") WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }
    if (before.rows.length) {
      await recordInvoiceVersion(id, before.rows[0], result.rows[0], req.user?.userId, req.user?.username);
    }
    res.json({ message: `Status set to ${status}.`, invoice: result.rows[0] });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: 'Failed to update payment status.' });
  }
};

exports.setFlaggedStatus = async (req, res) => {
  const id = parseInt(req.params.id);
  const { flagged } = req.body || {};
  try {
    const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    const status = flagged === true ? 'Flagged' : 'Pending';
    const result = await pool.query(
      'UPDATE invoices SET flagged = $1, approval_status = $2 WHERE id = $3 RETURNING *',
      [flagged === true, status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await logActivity(
      req.user?.userId,
      flagged ? 'flag_invoice' : 'unflag_invoice',
      id,
      req.user?.username
    );
    const after = result.rows[0];
    if (before.rows.length) {
      await recordInvoiceVersion(id, before.rows[0], after, req.user?.userId, req.user?.username);
    }
    const msg = flagged ? `Invoice ${id} flagged for review.` : `Invoice ${id} unflagged.`;
    await sendSlackNotification?.(msg);
    await sendTeamsNotification?.(msg);
    await sendEmailNotification?.(null, 'Invoice Update', msg);
    res.json({ message: 'Flag status updated', invoice: after });
  } catch (err) {
    console.error('Flag status error:', err);
    res.status(500).json({ message: 'Failed to update flag status' });
  }
};

exports.shareInvoices = async (req, res) => {
  const { invoiceIds, role } = req.body;
  if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
    return res.status(400).json({ message: 'invoiceIds array required' });
  }
  const mode = role === 'editor' ? 'editor' : 'comment';
  const token = crypto.randomBytes(16).toString('hex');
  try {
    await pool.query(
      'INSERT INTO shared_views (token, invoice_ids, role) VALUES ($1,$2,$3)',
      [token, invoiceIds, mode]
    );
    res.json({ url: `/api/documents/shared/${token}` });
  } catch (err) {
    console.error('Share error:', err);
    res.status(500).json({ message: 'Failed to create share' });
  }
};

exports.shareDashboard = async (req, res) => {
  const { filters } = req.body;
  const token = crypto.randomBytes(16).toString('hex');
  try {
    await pool.query(
      'INSERT INTO shared_dashboards (token, filters) VALUES ($1,$2)',
      [token, filters || {}]
    );
    res.json({ url: `/api/documents/dashboard/shared/${token}` });
  } catch (err) {
    console.error('Share dashboard error:', err);
    res.status(500).json({ message: 'Failed to create dashboard share' });
  }
};

exports.getSharedInvoices = async (req, res) => {
  const { token } = req.params;
  try {
    const share = await pool.query('SELECT invoice_ids, role FROM shared_views WHERE token = $1', [token]);
    if (share.rows.length === 0) return res.status(404).json({ message: 'Invalid token' });
    const { invoice_ids, role } = share.rows[0];
    const result = await pool.query('SELECT * FROM invoices WHERE id = ANY($1)', [invoice_ids]);
    res.json({ invoices: result.rows, role });
  } catch (err) {
    console.error('Get share error:', err);
    res.status(500).json({ message: 'Failed to fetch shared invoices' });
  }
};

exports.getSharedDashboard = async (req, res) => {
  const { token } = req.params;
  const client = await pool.connect();
  try {
    const share = await pool.query('SELECT filters FROM shared_dashboards WHERE token = $1', [token]);
    if (share.rows.length === 0) return res.status(404).json({ message: 'Invalid token' });
    const { filters } = share.rows[0];
    const { vendor, team, status, tenant: tenantFilter, startDate, endDate } = filters || {};
    const tenant = req.tenantId || tenantFilter;
    const conditions = [];
    const params = [];
    if (vendor) {
      params.push(vendor);
      conditions.push(`vendor = $${params.length}`);
    }
    if (team) {
      params.push(team);
      conditions.push(`department = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`approval_status = $${params.length}`);
    }
    if (tenant) {
      params.push(tenant);
      conditions.push(`tenant_id = $${params.length}`);
    }
    if (startDate) {
      params.push(startDate);
      conditions.push(`date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`date <= $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const summary = await client.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM invoices${where}`,
      params
    );

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const totalRes = await client.query(
      `SELECT COALESCE(SUM(amount),0) AS total FROM invoices WHERE date >= $1 AND date < $2`,
      [start, end]
    );

    const pendingRes = await client.query(
      "SELECT COUNT(*) AS count FROM invoices WHERE approval_status = 'Pending'"
    );

    const flaggedRes = await client.query(
      'SELECT COUNT(*) AS count FROM invoices WHERE flagged = TRUE'
    );

    const anomalyRes = await client.query(
      `SELECT vendor, DATE_TRUNC('month', date) AS m, SUM(amount) AS total FROM invoices WHERE date >= $1 GROUP BY vendor, m ORDER BY vendor, m`,
      [new Date(now.getFullYear(), now.getMonth() - 6, 1)]
    );
    const data = {};
    anomalyRes.rows.forEach((r) => {
      if (!data[r.vendor]) data[r.vendor] = [];
      data[r.vendor].push({ month: r.m, total: parseFloat(r.total) });
    });
    let anomalies = 0;
    for (const rows of Object.values(data)) {
      const totals = rows.map((r) => r.total);
      const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
      const last = totals[totals.length - 1];
      if (totals.length > 1 && last > avg * 1.5) anomalies++;
    }

    res.json({
      totalInvoices: parseInt(summary.rows[0].count, 10) || 0,
      totalAmount: parseFloat(summary.rows[0].total) || 0,
      totalInvoicedThisMonth: parseFloat(totalRes.rows[0].total) || 0,
      invoicesPending: parseInt(pendingRes.rows[0].count, 10) || 0,
      anomaliesFound: anomalies,
      aiSuggestions: parseInt(flaggedRes.rows[0].count, 10) || 0,
    });
  } catch (err) {
    console.error('Get shared dashboard error:', err);
    res.status(500).json({ message: 'Failed to fetch shared dashboard' });
  } finally {
    client.release();
  }
};

exports.getInvoiceVersions = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, editor_name, diff, created_at FROM invoice_versions WHERE invoice_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch versions error:', err);
    res.status(500).json({ message: 'Failed to fetch versions' });
  }
};

exports.restoreInvoiceVersion = async (req, res) => {
  const { id, versionId } = req.params;
  try {
    const verRes = await pool.query(
      'SELECT snapshot FROM invoice_versions WHERE id = $1 AND invoice_id = $2',
      [versionId, id]
    );
    if (verRes.rows.length === 0) {
      return res.status(404).json({ message: 'Version not found' });
    }
    const snapshot = verRes.rows[0].snapshot;
    const keys = Object.keys(snapshot || {});
    if (keys.length === 0) return res.status(400).json({ message: 'Invalid snapshot' });
    const sets = [];
    const values = [];
    let idx = 1;
    for (const key of keys) {
      sets.push(`${key} = $${idx}`);
      values.push(snapshot[key]);
      idx++;
    }
    values.push(id);
    const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    await pool.query(`UPDATE invoices SET ${sets.join(', ')} WHERE id = $${idx}`, values);
    const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (before.rows.length && after.rows.length) {
      await recordInvoiceVersion(id, before.rows[0], after.rows[0], req.user?.userId, req.user?.username);
    }
    res.json({ message: 'Invoice restored', invoice: after.rows[0] });
  } catch (err) {
    console.error('Restore version error:', err);
    res.status(500).json({ message: 'Failed to restore version' });
  }
};

exports.checkInvoiceSimilarity = async (req, res) => {
  const { invoice_number, vendor, amount } = req.body || {};
  if (!invoice_number || !vendor || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT id, invoice_number, amount, vendor FROM invoices ORDER BY id DESC LIMIT 50'
    );
    const base = `${invoice_number}|${amount}|${vendor}`.toLowerCase();
    const matches = rows
      .map(r => {
        const str = `${r.invoice_number}|${r.amount}|${r.vendor}`.toLowerCase();
        const distance = levenshtein.get(base, str);
        const similarity = 1 - distance / Math.max(base.length, str.length);
        return { id: r.id, similarity };
      })
      .filter(m => m.similarity > 0.8)
      .sort((a, b) => b.similarity - a.similarity);
    res.json({ matches });
  } catch (err) {
    console.error('Similarity detection error:', err);
    res.status(500).json({ message: 'Failed to check similarity' });
  }
};

exports.assignInvoice = async (req, res) => {
  const { id } = req.params;
  const { assignee } = req.body;
  try {
    const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    await pool.query('UPDATE invoices SET assignee = $1 WHERE id = $2', [assignee, id]);
    const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (before.rows.length && after.rows.length) {
      await recordInvoiceVersion(id, before.rows[0], after.rows[0], req.user?.userId, req.user?.username);
    }
    res.json({ message: `Invoice assigned to ${assignee || 'nobody'}.` });
  } catch (err) {
    console.error('Assign error:', err);
    res.status(500).json({ message: 'Failed to assign invoice.' });
  }
};


exports.approveInvoice = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body || {};
  try {
    const invRes = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (invRes.rows.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const invoice = invRes.rows[0];
    const chain = invoice.approval_chain || ['Manager','Finance','CFO'];
    const step = chain[invoice.current_step] || 'Unknown';
    if (req.user?.role !== 'admin' && req.user?.role !== step.toLowerCase()) {
      return res.status(403).json({ message: `Only ${step} may approve at this step` });
    }
    const nextStep = invoice.current_step + 1;
    const status = nextStep >= chain.length ? 'Approved' : 'In Progress';

    const result = await pool.query(
      `UPDATE invoices SET approval_status = $1,
       current_step = $2,
       approval_history = coalesce(approval_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('step',$3,'status','Approved','date', NOW(),'comment',$4))
       WHERE id = $5 RETURNING approval_status, approval_history, current_step`,
      [status, nextStep, step, comment || '', id]
    );
    await recordInvoiceVersion(id, invoice, { ...invoice, ...result.rows[0], current_step: nextStep, approval_status: status }, req.user?.userId, req.user?.username);
    await logActivity(req.user?.userId, 'approve_invoice', id, req.user?.username);
    const nextLabel = nextStep >= chain.length ? 'Completed' : `Next: ${chain[nextStep]}`;
    const msg = `Invoice ${id} step ${step} approved. ${nextLabel}`;
    await sendSlackNotification(msg);
    await sendTeamsNotification(msg);
    await sendEmailNotification?.(null, 'Invoice Approved', msg);
    if (status === 'Approved') {
      await triggerAutomations('invoice.approved', { invoice: { ...invoice, ...result.rows[0], id: parseInt(id,10) } });
    }
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
    const invRes = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (invRes.rows.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const invoice = invRes.rows[0];
    const chain = invoice.approval_chain || ['Manager','Finance','CFO'];
    const step = chain[invoice.current_step] || 'Unknown';
    if (req.user?.role !== 'admin' && req.user?.role !== step.toLowerCase()) {
      return res.status(403).json({ message: `Only ${step} may reject at this step` });
    }

    const result = await pool.query(
      `UPDATE invoices SET approval_status = 'Rejected',
       current_step = -1,
       approval_history = coalesce(approval_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('step',$1,'status','Rejected','date', NOW(),'comment',$2))
       WHERE id = $3 RETURNING approval_status, approval_history`,
      [step, comment || '', id]
    );
    await recordInvoiceVersion(id, invoice, { ...invoice, ...result.rows[0], current_step: -1, approval_status: 'Rejected' }, req.user?.userId, req.user?.username);
    await logActivity(req.user?.userId, 'reject_invoice', id, req.user?.username);
    await sendSlackNotification(`Invoice ${id} rejected.`);
    await sendTeamsNotification(`Invoice ${id} rejected.`);
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
    await logActivity(req.user?.userId, 'add_comment', id, req.user?.username);
    const message = { text, user: req.user?.userId || 'anon', date: new Date().toISOString(), invoiceId: parseInt(id,10) };
    broadcastMessage(id, message);
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
    const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    await pool.query('UPDATE invoices SET private_notes = $1 WHERE id = $2', [notes || '', id]);
    await logActivity(req.user?.userId, 'update_notes', id, req.user?.username);
    const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (before.rows.length && after.rows.length) {
      await recordInvoiceVersion(id, before.rows[0], after.rows[0], req.user?.userId, req.user?.username);
    }
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
  if (retention === '3mo') {
    deleteAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  } else if (retention === '1yr') {
    deleteAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  } else if (retention === '6m') {
    deleteAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
  } else if (retention === '2y') {
    deleteAt = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
  }
  try {
    const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    await pool.query(
      'UPDATE invoices SET retention_policy = $1, delete_at = $2 WHERE id = $3',
      [retention || 'forever', deleteAt, id]
    );
    await logActivity(req.user?.userId, 'update_retention', id, req.user?.username);
    const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (before.rows.length && after.rows.length) {
      await recordInvoiceVersion(id, before.rows[0], after.rows[0], req.user?.userId, req.user?.username);
    }
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

  if (!['amount', 'vendor', 'date', 'priority', 'currency', 'vat_percent', 'vat_amount', 'expires_at', 'expired', 'approval_status'].includes(field)) {
    return res.status(400).json({ message: 'Invalid field to update.' });
  }

  try {
    const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (before.rows.length && String(before.rows[0][field]) !== String(value)) {
      await pool.query(
        'INSERT INTO ocr_corrections (invoice_id, field, old_value, new_value, user_id) VALUES ($1,$2,$3,$4,$5)',
        [id, field, String(before.rows[0][field]), String(value), req.user?.userId || null]
      );
      updateWeights(field, value);
    }
    await pool.query(`UPDATE invoices SET ${field} = $1 WHERE id = $2`, [value, id]);
    await loadCorrections();
    const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (before.rows.length && after.rows.length) {
      await recordInvoiceVersion(id, before.rows[0], after.rows[0], req.user?.userId, req.user?.username);
    }
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
    for (const id of ids) {
      const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
      await pool.query('UPDATE invoices SET archived = TRUE WHERE id = $1', [id]);
      const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
      if (before.rows.length && after.rows.length) {
        await recordInvoiceVersion(id, before.rows[0], after.rows[0], req.user?.userId, req.user?.username);
      }
    }
    await logActivity(req.user?.userId, 'bulk_archive', null, req.user?.username);
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
    for (const id of ids) {
      const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
      await pool.query('UPDATE invoices SET assignee = $1 WHERE id = $2', [assignee || null, id]);
      const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
      if (before.rows.length && after.rows.length) {
        await recordInvoiceVersion(id, before.rows[0], after.rows[0], req.user?.userId, req.user?.username);
      }
    }
    await logActivity(req.user?.userId, 'bulk_assign', null, req.user?.username);
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
      if (req.user?.role !== 'admin' && req.user?.role !== step.toLowerCase()) {
        continue;
      }
      const nextStep = invoice.current_step + 1;
      const status = nextStep >= chain.length ? 'Approved' : 'In Progress';
      await pool.query(
        `UPDATE invoices SET approval_status = $1, current_step = $2,
         approval_history = coalesce(approval_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('step',$3,'status','Approved','date', NOW(),'comment',$4))
         WHERE id = $5`,
        [status, nextStep, step, comment || '', id]
      );
      const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
      if (invRes.rows.length && after.rows.length) {
        await recordInvoiceVersion(id, invRes.rows[0], after.rows[0], req.user?.userId, req.user?.username);
      }
      const nextLabel = nextStep >= chain.length ? 'Completed' : `Next: ${chain[nextStep]}`;
      const msg = `Invoice ${id} step ${step} approved. ${nextLabel}`;
      await sendSlackNotification(msg);
      await sendTeamsNotification(msg);
      if (status === 'Approved' && after.rows.length) {
        await triggerAutomations('invoice.approved', { invoice: after.rows[0] });
      }
    }
    await logActivity(req.user?.userId, 'bulk_approve', null, req.user?.username);
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
      if (req.user?.role !== 'admin' && req.user?.role !== step.toLowerCase()) {
        continue;
      }
      await pool.query(
        `UPDATE invoices SET approval_status = 'Rejected', current_step = -1,
         approval_history = coalesce(approval_history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('step',$1,'status','Rejected','date', NOW(),'comment',$2))
         WHERE id = $3`,
        [step, comment || '', id]
      );
      const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
      if (invRes.rows.length && after.rows.length) {
        await recordInvoiceVersion(id, invRes.rows[0], after.rows[0], req.user?.userId, req.user?.username);
      }
    }
    await logActivity(req.user?.userId, 'bulk_reject', null, req.user?.username);
    res.json({ message: 'Invoices rejected' });
  } catch (err) {
    console.error('Bulk reject error:', err);
    res.status(500).json({ message: 'Failed to reject invoices' });
  }
};

exports.bulkDeleteInvoices = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No invoice IDs provided' });
  }
  try {
    await pool.query('DELETE FROM invoices WHERE id = ANY($1::int[])', [ids]);
    await logActivity(req.user?.userId, 'bulk_delete', null, req.user?.username);
    res.json({ message: 'Invoices deleted' });
  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ message: 'Failed to delete invoices' });
  }
};

exports.bulkUpdateInvoices = async (req, res) => {
  const { ids, fields } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !fields) {
    return res.status(400).json({ message: 'Missing ids or fields' });
  }
  try {
    const sets = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(fields)) {
      sets.push(`${key} = $${idx++}`);
      values.push(value);
    }
    values.push(ids);
    const query = `UPDATE invoices SET ${sets.join(', ')} WHERE id = ANY($${idx}::int[])`;
    const before = await pool.query('SELECT * FROM invoices WHERE id = ANY($1::int[])', [ids]);
    await pool.query(query, values);
    const after = await pool.query('SELECT * FROM invoices WHERE id = ANY($1::int[])', [ids]);
    for (const b of before.rows) {
      const a = after.rows.find(r => r.id === b.id);
      if (a) await recordInvoiceVersion(b.id, b, a, req.user?.userId, req.user?.username);
    }
    await logActivity(req.user?.userId, 'bulk_update', null, req.user?.username);
    res.json({ message: 'Invoices updated' });
  } catch (err) {
    console.error('Bulk update error:', err);
    res.status(500).json({ message: 'Failed to update invoices' });
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

    const text = `${invoice.vendor || ''} ${invoice.description || ''}`.toLowerCase();
    const simpleTags = new Set();
    if (/utility|electric|water|power|gas/.test(text)) simpleTags.add('Utilities');
    if (/subscription|monthly|plan/.test(text)) simpleTags.add('Subscription');
    if (/one[- ]?time|setup|installation/.test(text)) simpleTags.add('One-time');
    if (simpleTags.size > 0) {
      return res.json({ tags: Array.from(simpleTags) });
    }

    const prompt = `You are an intelligent finance assistant. Based on the following invoice details:
      - Vendor: ${invoice.vendor}
      - Amount: ${invoice.amount}
      - Description: ${invoice.description || 'None'}
      Suggest 1–3 relevant tags or categories and briefly explain why. Return a JSON object with \"tags\" (array), \"reason\" and \"confidence\" (0-1).`;

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

    const raw = response.data.choices[0]?.message?.content?.trim();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      data = { tags: raw };
    }
    res.json({ tags: data.tags, reason: data.reason, confidence: data.confidence });
  } catch (err) {
    console.error('Tag suggestion error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate tag suggestions' });
  }
};

// Suggest column mappings for CSV uploads
exports.suggestMappings = async (req, res) => {
  const { headers } = req.body;
  if (!Array.isArray(headers) || headers.length === 0) {
    return res.status(400).json({ message: 'No headers provided' });
  }
  const mapping = {};
  headers.forEach((h) => {
    const l = h.toLowerCase();
    if (!mapping.line_item && /(item|description)/.test(l)) mapping.line_item = h;
    if (!mapping.total && /(total|amount)/.test(l)) mapping.total = h;
    if (!mapping.tax && /(tax|vat)/.test(l)) mapping.tax = h;
  });
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const prompt = `Map these CSV columns to invoice fields (line item, total, tax) and return JSON. Headers: ${headers.join(', ')}`;
      const resp = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You suggest invoice CSV mappings.' },
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
      const raw = resp.data.choices?.[0]?.message?.content?.trim();
      const aiMap = JSON.parse(raw);
      Object.assign(mapping, aiMap);
    } catch (e) {
      console.error('Mapping suggestion error:', e.response?.data || e.message);
    }
  }
  res.json({ mapping });
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
exports.updateDocumentTags = async (req, res) => {
  const id = parseInt(req.params.id);
  const { tags } = req.body;

  if (!Array.isArray(tags)) {
    return res.status(400).json({ message: 'Tags must be an array' });
  }

  try {
    const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    const result = await pool.query(
      'UPDATE invoices SET tags = $1 WHERE id = $2 RETURNING id, vendor',
      [tags, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await autoAssignInvoice(id, result.rows[0].vendor, tags);
    const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (before.rows.length && after.rows.length) {
      await recordInvoiceVersion(id, before.rows[0], after.rows[0], req.user?.userId, req.user?.username);
    }
    res.json({ message: 'Tags updated', tags });
  } catch (err) {
    console.error('Failed to save tags:', err);
    res.status(500).json({ message: 'Failed to save updated tags' });
  }
};

// Auto-categorize a single invoice with rules + AI
exports.autoCategorizeInvoice = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    let invoice = result.rows[0];
    invoice = await applyRules(invoice);
    let tags = invoice.tags || [];
    if (invoice.tags) {
      tags = Array.from(new Set([...tags, ...(invoice.tags || [])]));
    }
    if ((!tags || tags.length === 0) && process.env.OPENROUTER_API_KEY) {
      const prompt = `Suggest 1-3 concise categories for this invoice. Vendor: ${invoice.vendor}. Amount: $${invoice.amount}. Description: ${invoice.description || 'None'}.`;
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
      const raw = aiRes.data.choices?.[0]?.message?.content?.trim() || '';
      const aiTags = raw.split(/[,\n]/).map((t) => t.trim()).filter(Boolean);
      tags = Array.from(new Set([...(tags || []), ...aiTags]));
    }
    const category = tags[0] || categorizeInvoice(invoice);
    const before = result.rows[0];
    await pool.query('UPDATE invoices SET tags = $1, category = $2 WHERE id = $3', [tags, category, id]);
    const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (after.rows.length) {
      await recordInvoiceVersion(id, before, after.rows[0], req.user?.userId, req.user?.username);
    }
    res.json({ id, tags, category });
  } catch (err) {
    console.error('Auto categorize error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to auto-categorize invoice' });
  }
};

// Auto-tag an invoice with predefined categories using AI
exports.autoTagCategories = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const invoice = result.rows[0];
    const prompt = `Choose 1-2 categories from [${CATEGORY_LIST.join(', ')}] for this invoice. Vendor: ${invoice.vendor}. Amount: $${invoice.amount}. Description: ${invoice.description || 'None'}. Respond with a comma separated list.`;
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
    const raw = aiRes.data.choices?.[0]?.message?.content || '';
    const tags = raw
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const before = invoice;
    await pool.query('UPDATE invoices SET tags = $1 WHERE id = $2', [tags, id]);
    const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (after.rows.length) {
      await recordInvoiceVersion(id, before, after.rows[0], req.user?.userId, req.user?.username);
    }
    res.json({ id, tags });
  } catch (err) {
    console.error('Auto tag error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to auto-tag invoice' });
  }
};

// Flag or unflag invoice for internal review
exports.setReviewFlag = async (req, res) => {
  const id = parseInt(req.params.id);
  const { flag, notes } = req.body || {};
  try {
    const before = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    const result = await pool.query(
      'UPDATE invoices SET review_flag = $1, review_notes = $2 WHERE id = $3',
      [flag === true, notes || '', id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await logActivity(
      req.user?.userId,
      flag ? 'flag_review' : 'unflag_review',
      id,
      req.user?.username
    );
    const after = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (before.rows.length && after.rows.length) {
      await recordInvoiceVersion(id, before.rows[0], after.rows[0], req.user?.userId, req.user?.username);
    }
    res.json({ message: 'Review flag updated' });
  } catch (err) {
    console.error('Review flag error:', err);
    res.status(500).json({ message: 'Failed to update review flag' });
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
      model: 'openai/gpt-3.5-turbo',
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

exports.getUploadHeatmap = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT EXTRACT(DOW FROM created_at) AS dow,
             EXTRACT(HOUR FROM created_at) AS hour,
             COUNT(*) AS count
      FROM invoices
      GROUP BY dow, hour
    `);
    const heatmap = result.rows.map(r => ({
      day: parseInt(r.dow, 10),
      hour: parseInt(r.hour, 10),
      count: parseInt(r.count, 10)
    }));
    res.json({ heatmap });
  } catch (err) {
    console.error('Upload heatmap error:', err);
    res.status(500).json({ message: 'Failed to fetch heatmap data' });
  }
};

// Quick stats for dashboard
exports.getQuickStats = async (_req, res) => {
  const client = await pool.connect();
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const totalRes = await client.query(
      `SELECT COALESCE(SUM(amount),0) AS total
       FROM invoices
       WHERE date >= $1 AND date < $2`,
      [start, end]
    );

    const pendingRes = await client.query(
      "SELECT COUNT(*) AS count FROM invoices WHERE approval_status = 'Pending'"
    );

    const flaggedRes = await client.query(
      'SELECT COUNT(*) AS count FROM invoices WHERE flagged = TRUE'
    );

    const anomalyRes = await client.query(
      `SELECT vendor, DATE_TRUNC('month', date) AS m, SUM(amount) AS total
       FROM invoices
       WHERE date >= $1
       GROUP BY vendor, m
       ORDER BY vendor, m`,
      [new Date(now.getFullYear(), now.getMonth() - 6, 1)]
    );

    const data = {};
    anomalyRes.rows.forEach((r) => {
      if (!data[r.vendor]) data[r.vendor] = [];
      data[r.vendor].push({ month: r.m, total: parseFloat(r.total) });
    });
    let anomalies = 0;
    for (const rows of Object.values(data)) {
      const totals = rows.map((r) => r.total);
      const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
      const last = totals[totals.length - 1];
      if (totals.length > 1 && last > avg * 1.5) anomalies++;
    }

    res.json({
      totalInvoicedThisMonth: parseFloat(totalRes.rows[0].total) || 0,
      invoicesPending: parseInt(pendingRes.rows[0].count, 10) || 0,
      anomaliesFound: anomalies,
      aiSuggestions: parseInt(flaggedRes.rows[0].count, 10) || 0,
    });
  } catch (err) {
    console.error('Quick stats error:', err);
    res.status(500).json({ message: 'Failed to fetch quick stats' });
  } finally {
    client.release();
  }
};

// Tenant dashboard summary with filters
exports.getDashboardData = async (req, res) => {
  const client = await pool.connect();
  try {
    const { vendor, team, status, tenant: tenantQuery, startDate, endDate } = req.query;
    const tenant = req.tenantId || tenantQuery;
    const conditions = [];
    const params = [];
    if (vendor) {
      params.push(vendor);
      conditions.push(`vendor = $${params.length}`);
    }
    if (team) {
      params.push(team);
      conditions.push(`department = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`approval_status = $${params.length}`);
    }
    if (tenant) {
      params.push(tenant);
      conditions.push(`tenant_id = $${params.length}`);
    }
    if (startDate) {
      params.push(startDate);
      conditions.push(`date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`date <= $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await client.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM invoices ${where}`,
      params
    );
    res.json({
      totalInvoices: parseInt(result.rows[0].count, 10) || 0,
      totalAmount: parseFloat(result.rows[0].total) || 0,
    });
  } catch (err) {
    console.error('Dashboard data error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  } finally {
    client.release();
  }
};

exports.exportDashboardPDF = async (req, res) => {
  const client = await pool.connect();
  try {
    const { tag, startDate, endDate } = req.query;
    const now = new Date();
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
    const rangeStart = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const rangeEnd = endDate ? new Date(endDate) : new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 1);
    const query = `SELECT invoice_number, date, amount, vendor, tags, department FROM invoices ${where} ORDER BY date DESC`;
    const result = await client.query(query, params);

    // summary stats
    const total = result.rows.reduce((s, r) => s + parseFloat(r.amount), 0);
    const topVendorsRes = await client.query(
      `SELECT vendor, SUM(amount) AS total FROM invoices ${where} GROUP BY vendor ORDER BY total DESC LIMIT 5`,
      params
    );
    const tagRes = await client.query(
      `SELECT tag, SUM(amount) AS total FROM (SELECT jsonb_array_elements_text(tags) AS tag, amount FROM invoices ${where}) t GROUP BY tag ORDER BY total DESC LIMIT 5`,
      params
    );

    const nowDate = new Date();
    const anomalyStart = new Date(nowDate.getFullYear(), nowDate.getMonth() - 6, 1);
    const anomalyRes = await client.query(
      `SELECT vendor, DATE_TRUNC('month', date) AS m, SUM(amount) AS total FROM invoices WHERE date >= $1 GROUP BY vendor, m ORDER BY vendor, m`,
      [anomalyStart]
    );
    const data = {};
    anomalyRes.rows.forEach(r => {
      if (!data[r.vendor]) data[r.vendor] = [];
      data[r.vendor].push({ month: r.m, total: parseFloat(r.total) });
    });
    const anomalies = [];
    for (const [vendor, rows] of Object.entries(data)) {
      const totals = rows.map(r => r.total);
      const avg = totals.reduce((a,b)=>a+b,0) / totals.length;
      const last = totals[totals.length - 1];
      if (totals.length > 1 && last > avg * 1.5) {
        anomalies.push({ vendor, avg, last });
      }
    }

    const budgetRes = await pool.query(
      `SELECT tag AS department, amount FROM budgets WHERE period = 'monthly' AND vendor IS NULL AND tag IS NOT NULL`
    );
    const budgetData = [];
    for (const b of budgetRes.rows) {
      const r = await pool.query(
        'SELECT SUM(amount) AS sum FROM invoices WHERE department = $1 AND date >= $2 AND date < $3',
        [b.department, rangeStart, rangeEnd]
      );
      budgetData.push({ department: b.department, budget: parseFloat(b.amount), spent: parseFloat(r.rows[0].sum) || 0 });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="dashboard.pdf"');
    doc.pipe(res);

    doc.fontSize(18).text('Invoice Dashboard', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Total Spend: $${total.toFixed(2)}`);
    doc.moveDown();
    doc.fontSize(14).text('Top Vendors');
    topVendorsRes.rows.forEach(v => {
      doc.fontSize(12).text(`${v.vendor}: $${parseFloat(v.total).toFixed(2)}`);
    });
    doc.moveDown();
    doc.fontSize(14).text('Top Categories');
    tagRes.rows.forEach(t => {
      doc.fontSize(12).text(`${t.tag}: $${parseFloat(t.total).toFixed(2)}`);
    });
    doc.moveDown();
    doc.fontSize(14).text('Unusual Invoice Spikes');
    anomalies.forEach(a => {
      doc.fontSize(12).text(`${a.vendor}: avg $${a.avg.toFixed(2)} last $${a.last.toFixed(2)}`);
    });
    doc.moveDown();
    doc.fontSize(14).text('Budget vs Actual');
    budgetData.forEach(b => {
      doc.fontSize(12).text(`${b.department}: budget $${b.budget.toFixed(2)} spent $${b.spent.toFixed(2)}`);
    });
    doc.addPage();

    result.rows.forEach(inv => {
      doc.fontSize(12).text(`Invoice #${inv.invoice_number}`);
      doc.text(`Date: ${inv.date}`);
      doc.text(`Vendor: ${inv.vendor}`);
      doc.text(`Amount: $${parseFloat(inv.amount).toFixed(2)}`);
      doc.text(`Tags: ${(inv.tags || []).join(', ')}`);
      doc.text(`Department: ${inv.department || ''}`);
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
  if (!settings.autoArchive) return;
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

exports.autoCloseExpiredInvoices = async () => {
  try {
    const result = await pool.query(
      `UPDATE invoices SET expired = TRUE, approval_status = 'Closed', flagged = TRUE, flag_reason = 'Expired'
       WHERE expires_at IS NOT NULL AND expires_at < NOW() AND expired = FALSE`
    );
    if (result.rowCount > 0) {
      console.log(`\uD83D\uDD12 Auto-closed ${result.rowCount} expired invoices`);
    }
  } catch (err) {
    console.error('Auto-close error:', err);
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
    const avgRes = await pool.query(
      'SELECT AVG(amount) AS avg FROM invoices WHERE vendor = $1 AND id <> $2',
      [invoice.vendor, id]
    );
    const avg = parseFloat(avgRes.rows[0].avg) || 0;
    const prompt = `You are a fraud detection assistant. Explain in one short paragraph why this invoice might be flagged. Invoice amount: $${invoice.amount}. Average historical amount for vendor ${invoice.vendor} is $${avg.toFixed(2)}. Flag reason: ${invoice.flag_reason || 'None'}. Return a JSON object with \"explanation\" and a \"confidence\" score between 0 and 1.`;
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
    const raw = response.data.choices?.[0]?.message?.content?.trim();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      data = { explanation: raw };
    }
    res.json({ explanation: data.explanation, confidence: data.confidence });
  } catch (err) {
    console.error('Flag explanation error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate flag explanation' });
  }
};

// Provide a short AI explanation of any invoice and note potential anomalies
exports.explainInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const invoice = result.rows[0];
    const avgRes = await pool.query('SELECT AVG(amount) AS avg FROM invoices WHERE vendor = $1 AND id <> $2', [invoice.vendor, id]);
    const avg = parseFloat(avgRes.rows[0].avg) || 0;
    const prompt = `Explain this invoice in simple terms. The vendor's historical average amount is $${avg.toFixed(2)}. Include an "anomaly_score" from 0-1 indicating how unusual this invoice appears.` +
      `\n\n${JSON.stringify({ invoice_number: invoice.invoice_number, amount: invoice.amount, date: invoice.date, vendor: invoice.vendor, description: invoice.description })}`;
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You analyze invoices and spot anomalies.' },
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
    const raw = response.data.choices?.[0]?.message?.content?.trim();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      data = { explanation: raw };
    }
    res.json({ explanation: data.explanation, anomaly_score: data.anomaly_score });
  } catch (err) {
    console.error('Invoice explanation error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to explain invoice' });
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

// Generate vendor scorecards for responsiveness, payment consistency,
// and volume/price changes
exports.getVendorScorecards = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        vendor,
        AVG(EXTRACT(EPOCH FROM (COALESCE(updated_at, created_at) - created_at))/86400) AS avg_response,
        AVG(CASE WHEN paid THEN 1 ELSE 0 END) AS paid_ratio,
        SUM(CASE WHEN date >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS recent_count,
        SUM(CASE WHEN date >= NOW() - INTERVAL '60 days' AND date < NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS prev_count,
        AVG(CASE WHEN date >= NOW() - INTERVAL '30 days' THEN amount END) AS recent_avg_amount,
        AVG(CASE WHEN date >= NOW() - INTERVAL '60 days' AND date < NOW() - INTERVAL '30 days' THEN amount END) AS prev_avg_amount
      FROM invoices
      GROUP BY vendor
    `);

    const scorecards = result.rows.map((r) => {
      const avgResp = parseFloat(r.avg_response) || 0;
      const responsiveness = 100 - Math.min(avgResp * 20, 100); // lower is better
      const paymentConsistency = (parseFloat(r.paid_ratio) || 0) * 100;
      const volumeChange = r.prev_count
        ? ((r.recent_count - r.prev_count) / r.prev_count) * 100
        : 0;
      const priceChange = r.prev_avg_amount
        ? ((r.recent_avg_amount - r.prev_avg_amount) / r.prev_avg_amount) * 100
        : 0;
      return {
        vendor: r.vendor,
        responsiveness: Math.round(responsiveness),
        payment_consistency: Math.round(paymentConsistency),
        volume_change_pct: Math.round(volumeChange),
        price_change_pct: Math.round(priceChange),
      };
    });

    res.json({ scorecards });
  } catch (err) {
    console.error('Vendor scorecard error:', err);
    res.status(500).json({ message: 'Failed to generate vendor scorecards' });
  }
};

// Build a relationship graph of vendors and invoices
exports.getRelationshipGraph = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, invoice_number, vendor, amount FROM invoices'
    );

    const nodes = [];
    const links = [];
    const vendorSet = new Set();

    rows.forEach((inv) => {
      if (!vendorSet.has(inv.vendor)) {
        vendorSet.add(inv.vendor);
        nodes.push({ id: `vendor-${inv.vendor}`, label: inv.vendor, type: 'vendor' });
      }
      nodes.push({ id: `inv-${inv.id}`, label: inv.invoice_number, type: 'invoice' });
      links.push({ source: `vendor-${inv.vendor}`, target: `inv-${inv.id}`, type: 'vendor-invoice' });
    });

    const byNumber = {};
    rows.forEach((inv) => {
      byNumber[inv.invoice_number] = byNumber[inv.invoice_number] || [];
      byNumber[inv.invoice_number].push(inv);
    });
    Object.values(byNumber).forEach((list) => {
      if (list.length > 1) {
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            links.push({ source: `inv-${list[i].id}`, target: `inv-${list[j].id}`, type: 'duplicate' });
          }
        }
      }
    });

    const byVendorAmount = {};
    rows.forEach((inv) => {
      const key = `${inv.vendor}_${inv.amount}`;
      byVendorAmount[key] = byVendorAmount[key] || [];
      byVendorAmount[key].push(inv);
    });
    Object.values(byVendorAmount).forEach((list) => {
      if (list.length > 1) {
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            links.push({ source: `inv-${list[i].id}`, target: `inv-${list[j].id}`, type: 'recurring' });
          }
        }
      }
    });

    res.json({ nodes, links });
  } catch (err) {
    console.error('Graph build error:', err);
    res.status(500).json({ message: 'Failed to build graph' });
  }
};

// Simple progress metrics for investor dashboard
exports.getProgressStats = async (_req, res) => {
  try {
    const uploadedRes = await pool.query('SELECT COUNT(*) FROM invoices');
    const categorizedRes = await pool.query(
      "SELECT COUNT(*) FROM invoices WHERE category IS NOT NULL AND category <> ''"
    );
    const flaggedRes = await pool.query('SELECT COUNT(*) FROM invoices WHERE flagged = TRUE');
    res.json({
      uploaded: parseInt(uploadedRes.rows[0].count, 10) || 0,
      categorized: parseInt(categorizedRes.rows[0].count, 10) || 0,
      flagged: parseInt(flaggedRes.rows[0].count, 10) || 0,
    });
  } catch (err) {
    console.error('Progress stats error:', err);
    res.status(500).json({ message: 'Failed to fetch progress stats' });
  }
};

// Insert a batch of dummy invoices for demos
exports.seedDummyData = async (req, res) => {
  const client = await pool.connect();
  try {
    const vendors = ['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Umbrella'];
    const categories = ['Office Supplies', 'Software', 'Travel', 'Utilities'];
    const inserted = [];
    for (let i = 0; i < 20; i++) {
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const amount = (Math.random() * 900 + 100).toFixed(2);
      const date = new Date(Date.now() - Math.random() * 60 * 86400000);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const result = await client.query(
        'INSERT INTO invoices (invoice_number, date, amount, vendor, category) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [`DEMO-${Date.now()}-${i}`, date, amount, vendor, category]
      );
      inserted.push(result.rows[0].id);
    }
    res.json({ inserted: inserted.length });
  } catch (err) {
    console.error('Seed demo data error:', err);
    res.status(500).json({ message: 'Failed to seed demo data' });
  } finally {
    client.release();
  }
};

// Suggest previous amounts close to the user's input
exports.amountSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Missing q' });
  const value = parseFloat(String(q).replace(/[^0-9.]/g, ''));
  if (isNaN(value)) return res.status(400).json({ message: 'Invalid amount' });
  try {
    const result = await pool.query('SELECT DISTINCT amount FROM invoices');
    const amounts = result.rows
      .map((r) => parseFloat(r.amount))
      .filter((a) => !isNaN(a));
    const suggestions = amounts
      .map((a) => ({ a, diff: Math.abs(a - value) }))
      .sort((x, y) => x.diff - y.diff)
      .slice(0, 5)
      .map((x) => x.a);
    res.json({ matches: suggestions });
  } catch (err) {
    console.error('Amount suggestion error:', err);
    res.status(500).json({ message: 'Failed to fetch suggestions' });
  }
};



module.exports = {
  updateDocumentTags: exports.updateDocumentTags,
  updateInvoiceTags: exports.updateDocumentTags,
  generateInvoicePDF: exports.generateInvoicePDF,
  suggestTags: exports.suggestTags,
  flagSuspiciousInvoice: exports.flagSuspiciousInvoice,
  updateInvoiceField: exports.updateInvoiceField,
  // ✅ Add all others you want to expose:
  uploadInvoice: exports.uploadInvoice,
  voiceUpload: exports.voiceUpload,
  conversationalUpload: exports.conversationalUpload,
  getAllInvoices: exports.getAllInvoices,
  clearAllInvoices: exports.clearAllInvoices,
  deleteInvoiceById: exports.deleteInvoiceById,
  searchInvoicesByVendor: exports.searchInvoicesByVendor,
  exportFilteredInvoicesCSV: exports.exportFilteredInvoicesCSV,
  exportAllInvoices: exports.exportAllInvoices,
  importInvoicesCSV: exports.importInvoicesCSV,
  exportArchivedInvoicesCSV: exports.exportArchivedInvoicesCSV,
  archiveInvoice: exports.archiveInvoice,
  unarchiveInvoice: exports.unarchiveInvoice,
  markInvoicePaid: exports.markInvoicePaid,
  assignInvoice: exports.assignInvoice,
  approveInvoice: exports.approveInvoice,
  rejectInvoice: exports.rejectInvoice,
  addComment: exports.addComment,
  handleSuggestion: exports.handleSuggestion,
  summarizeErrors: exports.summarizeErrors,
  getMonthlyInsights: exports.getMonthlyInsights,
  getCashFlow: exports.getCashFlow,
  getTopVendors: exports.getTopVendors,
  getSpendingByTag: exports.getSpendingByTag,
  exportDashboardPDF: exports.exportDashboardPDF,
  checkRecurringInvoice: exports.checkRecurringInvoice,
  getRecurringInsights: exports.getRecurringInsights,
  getVendorProfile: exports.getVendorProfile,
  autoArchiveOldInvoices: exports.autoArchiveOldInvoices,
  autoDeleteExpiredInvoices: exports.autoDeleteExpiredInvoices,
  autoCloseExpiredInvoices: exports.autoCloseExpiredInvoices,
  updatePrivateNotes: exports.updatePrivateNotes,
  updateRetentionPolicy: exports.updateRetentionPolicy,
  bulkArchiveInvoices: exports.bulkArchiveInvoices,
  bulkAssignInvoices: exports.bulkAssignInvoices,
  bulkApproveInvoices: exports.bulkApproveInvoices,
  bulkRejectInvoices: exports.bulkRejectInvoices,
  bulkDeleteInvoices: exports.bulkDeleteInvoices,
  bulkUpdateInvoices: exports.bulkUpdateInvoices,
  exportPDFBundle: exports.exportPDFBundle,
  explainFlaggedInvoice: exports.explainFlaggedInvoice,
  explainInvoice: exports.explainInvoice,
  bulkAutoCategorize: exports.bulkAutoCategorize,
  autoCategorizeInvoice: exports.autoCategorizeInvoice,
  autoTagCategories: exports.autoTagCategories,
  getVendorBio: exports.getVendorBio,
  getVendorScorecards: exports.getVendorScorecards,
  getRelationshipGraph: exports.getRelationshipGraph,
  getQuickStats: exports.getQuickStats,
  getUploadHeatmap: exports.getUploadHeatmap,
  getDashboardData: exports.getDashboardData,
  setReviewFlag: exports.setReviewFlag,
  setFlaggedStatus: exports.setFlaggedStatus,
  setPaymentStatus: exports.setPaymentStatus,
  shareDashboard: exports.shareDashboard,
  getSharedDashboard: exports.getSharedDashboard,
  shareInvoices: exports.shareInvoices,
  getSharedInvoices: exports.getSharedInvoices,
  getInvoiceVersions: exports.getInvoiceVersions,
  restoreInvoiceVersion: exports.restoreInvoiceVersion,
  checkInvoiceSimilarity: exports.checkInvoiceSimilarity,
  parseInvoiceSample: exports.parseInvoiceSample,
  suggestMappings: exports.suggestMappings,
  getProgressStats: exports.getProgressStats,
  seedDummyData: exports.seedDummyData,
  amountSuggestions: exports.amountSuggestions,
};

