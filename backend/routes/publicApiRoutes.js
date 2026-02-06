import express from 'express';
import pool from '../config/db.js';
import { validateApiKey } from '../middleware/apiKeyAuth.js';
import crypto from 'crypto';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

const router = express.Router();

function parseExtractedFields(fields) {
  if (!fields) return null;
  if (typeof fields === 'string') {
    try { fields = JSON.parse(fields); } catch { return null; }
  }
  if (fields && fields.raw) {
    try {
      const cleaned = fields.raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch { return fields; }
  }
  return fields;
}

router.get('/claims', validateApiKey, async (req, res) => {
  try {
    const { status, doc_type, limit = 50, offset = 0, since, until, cursor, sort = 'desc' } = req.query;
    const tenantId = req.apiKey?.tenant_id || 'default';
    const lim = Math.min(parseInt(limit) || 50, 200);
    const off = parseInt(offset) || 0;
    const sortDir = sort === 'asc' ? 'ASC' : 'DESC';

    let query = `
      SELECT d.id, d.file_name, d.doc_type, d.status, d.contains_phi, 
             d.created_at, d.assignee,
             cf.fields as extracted_fields, cf.extracted_at
      FROM documents d
      LEFT JOIN claim_fields cf ON cf.document_id = d.id
      WHERE d.tenant_id = $1
    `;
    const params = [tenantId];
    let idx = 2;

    if (status) { query += ` AND d.status = $${idx++}`; params.push(status); }
    if (doc_type) { query += ` AND d.doc_type = $${idx++}`; params.push(doc_type); }
    if (since) { query += ` AND d.created_at >= $${idx++}`; params.push(since); }
    if (until) { query += ` AND d.created_at <= $${idx++}`; params.push(until); }
    if (cursor) { 
      query += sortDir === 'DESC' ? ` AND d.id < $${idx++}` : ` AND d.id > $${idx++}`;
      params.push(parseInt(cursor)); 
    }

    let countQuery = `SELECT COUNT(*) FROM documents d WHERE d.tenant_id = $1`;
    const countParams = [tenantId];
    let cIdx = 2;
    if (status) { countQuery += ` AND d.status = $${cIdx++}`; countParams.push(status); }
    if (doc_type) { countQuery += ` AND d.doc_type = $${cIdx++}`; countParams.push(doc_type); }
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY d.id ${sortDir}`;
    if (!cursor && off > 0) {
      query += ` OFFSET $${idx++}`;
      params.push(off);
    }
    query += ` LIMIT $${idx++}`;
    params.push(lim + 1);

    const result = await pool.query(query, params);
    const hasMore = result.rows.length > lim;
    const rows = hasMore ? result.rows.slice(0, lim) : result.rows;

    const data = rows.map(r => ({
      ...r,
      extracted_fields: parseExtractedFields(r.extracted_fields)
    }));

    const nextCursor = hasMore && rows.length > 0 ? rows[rows.length - 1].id : null;

    if (data.length > 0) {
      const latest = data.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b);
      res.set('Last-Modified', new Date(latest.created_at).toUTCString());
    }

    const etag = crypto.createHash('md5').update(JSON.stringify(data.map(d => d.id))).digest('hex');
    res.set('ETag', `"${etag}"`);

    if (req.get('If-None-Match') === `"${etag}"`) {
      return res.status(304).end();
    }

    res.json({
      success: true,
      data,
      pagination: {
        total,
        limit: lim,
        offset: off,
        has_more: hasMore,
        next_cursor: nextCursor
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch claims' });
  }
});

router.get('/claims/:id', validateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.apiKey?.tenant_id || 'default';

    const result = await pool.query(
      `SELECT d.*, cf.fields as extracted_fields, cf.extracted_at, cf.version as extraction_version
       FROM documents d
       LEFT JOIN claim_fields cf ON cf.document_id = d.id
       WHERE d.id = $1 AND d.tenant_id = $2`,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    const claim = result.rows[0];
    claim.extracted_fields = parseExtractedFields(claim.extracted_fields);
    
    delete claim.raw_text;
    delete claim.embedding;
    delete claim.phi_encrypted_payload;

    res.json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch claim' });
  }
});

router.post('/claims/:id/status', validateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const tenantId = req.apiKey?.tenant_id || 'default';

    const validStatuses = ['pending', 'approved', 'denied', 'review', 'escalated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const result = await pool.query(
      `UPDATE documents 
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3
       RETURNING id, status, updated_at`,
      [status, id, tenantId]
    );

    if (notes) {
      await pool.query(
        `INSERT INTO activity_logs (action, details, created_at) VALUES ($1, $2, NOW())`,
        [`status_update_${id}`, JSON.stringify({ claim_id: id, status, notes })]
      ).catch(() => {});
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update claim status' });
  }
});

router.get('/triggers/new-claims', validateApiKey, async (req, res) => {
  try {
    const tenantId = req.apiKey?.tenant_id || 'default';
    const { rows } = await pool.query(
      `SELECT d.id, d.file_name, d.doc_type, d.status, d.contains_phi, d.created_at,
              cf.fields as extracted_fields
       FROM documents d
       LEFT JOIN claim_fields cf ON cf.document_id = d.id
       WHERE d.tenant_id = $1
       ORDER BY d.created_at DESC LIMIT 20`,
      [tenantId]
    );
    res.json(rows.map(r => ({
      id: r.id,
      file_name: r.file_name,
      doc_type: r.doc_type,
      status: r.status,
      contains_phi: r.contains_phi,
      created_at: r.created_at,
      extracted_fields: parseExtractedFields(r.extracted_fields)
    })));
  } catch (error) {
    res.status(500).json([]);
  }
});

router.get('/triggers/extracted-claims', validateApiKey, async (req, res) => {
  try {
    const tenantId = req.apiKey?.tenant_id || 'default';
    const { rows } = await pool.query(
      `SELECT d.id, d.file_name, d.doc_type, d.status, d.contains_phi, d.created_at,
              cf.fields as extracted_fields, cf.extracted_at
       FROM documents d
       INNER JOIN claim_fields cf ON cf.document_id = d.id
       WHERE d.tenant_id = $1
       ORDER BY cf.extracted_at DESC LIMIT 20`,
      [tenantId]
    );
    res.json(rows.map(r => ({
      id: r.id,
      file_name: r.file_name,
      doc_type: r.doc_type,
      status: r.status,
      contains_phi: r.contains_phi,
      created_at: r.created_at,
      extracted_at: r.extracted_at,
      extracted_fields: parseExtractedFields(r.extracted_fields)
    })));
  } catch (error) {
    res.status(500).json([]);
  }
});

router.post('/webhooks/claim-update', async (req, res) => {
  try {
    const { claim_id, external_status, external_id, source } = req.body;
    if (!claim_id || !external_status) {
      return res.status(400).json({
        success: false,
        error: 'claim_id and external_status are required'
      });
    }
    await pool.query(
      `INSERT INTO webhook_events (claim_id, event_type, payload, source, created_at)
       VALUES ($1, 'external_update', $2, $3, NOW())`,
      [claim_id, JSON.stringify(req.body), source || 'unknown']
    );
    res.json({ success: true, message: 'Webhook received' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process webhook' });
  }
});

router.get('/export/csv', validateApiKey, async (req, res) => {
  try {
    const tenantId = req.apiKey?.tenant_id || 'default';
    const { status, doc_type, since, until } = req.query;

    let query = `
      SELECT d.id, d.file_name, d.doc_type, d.status, d.contains_phi, d.created_at, d.assignee,
             cf.fields as extracted_fields, cf.extracted_at
      FROM documents d
      LEFT JOIN claim_fields cf ON cf.document_id = d.id
      WHERE d.tenant_id = $1
    `;
    const params = [tenantId];
    let idx = 2;
    if (status) { query += ` AND d.status = $${idx++}`; params.push(status); }
    if (doc_type) { query += ` AND d.doc_type = $${idx++}`; params.push(doc_type); }
    if (since) { query += ` AND d.created_at >= $${idx++}`; params.push(since); }
    if (until) { query += ` AND d.created_at <= $${idx++}`; params.push(until); }
    query += ' ORDER BY d.created_at DESC';

    const { rows } = await pool.query(query, params);

    const flatRows = rows.map(r => {
      const ef = parseExtractedFields(r.extracted_fields) || {};
      return {
        id: r.id,
        file_name: r.file_name,
        doc_type: r.doc_type,
        status: r.status,
        contains_phi: r.contains_phi,
        created_at: r.created_at,
        assignee: r.assignee,
        extracted_at: r.extracted_at,
        claim_id: ef.claim_id || '',
        claimant_name: ef.claimant_name || '',
        date_of_incident: ef.date_of_incident || '',
        policy_number: ef.policy_number || '',
        total_claimed_amount: ef.total_claimed_amount || '',
        loss_description: ef.loss_description || '',
        cpt_codes: Array.isArray(ef.cpt_codes) ? ef.cpt_codes.join('; ') : '',
        icd10_codes: Array.isArray(ef.icd10_codes) ? ef.icd10_codes.join('; ') : ''
      };
    });

    const fields = ['id', 'file_name', 'doc_type', 'status', 'contains_phi', 'created_at', 'assignee', 'extracted_at', 'claim_id', 'claimant_name', 'date_of_incident', 'policy_number', 'total_claimed_amount', 'loss_description', 'cpt_codes', 'icd10_codes'];
    const parser = new Parser({ fields });
    const csv = parser.parse(flatRows);

    res.header('Content-Type', 'text/csv');
    res.attachment(`clarifyops_claims_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Export failed' });
  }
});

router.get('/export/excel', validateApiKey, async (req, res) => {
  try {
    const tenantId = req.apiKey?.tenant_id || 'default';
    const { status, doc_type, since, until } = req.query;

    let query = `
      SELECT d.id, d.file_name, d.doc_type, d.status, d.contains_phi, d.created_at, d.assignee,
             cf.fields as extracted_fields, cf.extracted_at
      FROM documents d
      LEFT JOIN claim_fields cf ON cf.document_id = d.id
      WHERE d.tenant_id = $1
    `;
    const params = [tenantId];
    let idx = 2;
    if (status) { query += ` AND d.status = $${idx++}`; params.push(status); }
    if (doc_type) { query += ` AND d.doc_type = $${idx++}`; params.push(doc_type); }
    if (since) { query += ` AND d.created_at >= $${idx++}`; params.push(since); }
    if (until) { query += ` AND d.created_at <= $${idx++}`; params.push(until); }
    query += ' ORDER BY d.created_at DESC';

    const { rows } = await pool.query(query, params);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ClarifyOps';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Claims Export', {
      headerFooter: { firstHeader: 'ClarifyOps Claims Export' }
    });

    sheet.columns = [
      { header: 'Claim ID', key: 'id', width: 10 },
      { header: 'File Name', key: 'file_name', width: 35 },
      { header: 'Document Type', key: 'doc_type', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'PHI Detected', key: 'contains_phi', width: 14 },
      { header: 'Upload Date', key: 'created_at', width: 20 },
      { header: 'Assignee', key: 'assignee', width: 15 },
      { header: 'Extracted At', key: 'extracted_at', width: 20 },
      { header: 'Extracted Claim ID', key: 'claim_id_field', width: 22 },
      { header: 'Claimant Name', key: 'claimant_name', width: 25 },
      { header: 'Date of Incident', key: 'date_of_incident', width: 18 },
      { header: 'Policy Number', key: 'policy_number', width: 22 },
      { header: 'Total Amount', key: 'total_claimed_amount', width: 16 },
      { header: 'CPT Codes', key: 'cpt_codes', width: 25 },
      { header: 'ICD-10 Codes', key: 'icd10_codes', width: 25 },
      { header: 'Description', key: 'loss_description', width: 40 }
    ];

    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B1B4B' } };
      cell.alignment = { horizontal: 'center' };
    });

    rows.forEach(r => {
      const ef = parseExtractedFields(r.extracted_fields) || {};
      sheet.addRow({
        id: r.id,
        file_name: r.file_name,
        doc_type: r.doc_type,
        status: r.status,
        contains_phi: r.contains_phi ? 'Yes' : 'No',
        created_at: r.created_at ? new Date(r.created_at).toLocaleString() : '',
        assignee: r.assignee || '',
        extracted_at: r.extracted_at ? new Date(r.extracted_at).toLocaleString() : '',
        claim_id_field: ef.claim_id || '',
        claimant_name: ef.claimant_name || '',
        date_of_incident: ef.date_of_incident || '',
        policy_number: ef.policy_number || '',
        total_claimed_amount: ef.total_claimed_amount || '',
        cpt_codes: Array.isArray(ef.cpt_codes) ? ef.cpt_codes.join('; ') : '',
        icd10_codes: Array.isArray(ef.icd10_codes) ? ef.icd10_codes.join('; ') : '',
        loss_description: ef.loss_description || ''
      });
    });

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];
    summarySheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B1B4B' } };
    });

    const typeCount = {};
    const statusCount = {};
    let totalAmount = 0;
    rows.forEach(r => {
      typeCount[r.doc_type] = (typeCount[r.doc_type] || 0) + 1;
      statusCount[r.status || 'unknown'] = (statusCount[r.status || 'unknown'] || 0) + 1;
      const ef = parseExtractedFields(r.extracted_fields) || {};
      if (ef.total_claimed_amount) totalAmount += parseFloat(ef.total_claimed_amount) || 0;
    });

    summarySheet.addRow({ metric: 'Total Claims', value: rows.length });
    summarySheet.addRow({ metric: 'Total Claimed Amount', value: `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` });
    summarySheet.addRow({ metric: 'Export Date', value: new Date().toLocaleString() });
    summarySheet.addRow({ metric: '', value: '' });
    summarySheet.addRow({ metric: 'Document Types', value: '' });
    Object.entries(typeCount).forEach(([type, count]) => {
      summarySheet.addRow({ metric: `  ${type}`, value: count });
    });
    summarySheet.addRow({ metric: '', value: '' });
    summarySheet.addRow({ metric: 'Status Distribution', value: '' });
    Object.entries(statusCount).forEach(([st, count]) => {
      summarySheet.addRow({ metric: `  ${st}`, value: count });
    });

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment(`clarifyops_claims_export_${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, error: 'Excel export failed' });
  }
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

router.get('/sso/providers', (req, res) => {
  res.json({
    success: true,
    providers: {
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    }
  });
});

export default router;
