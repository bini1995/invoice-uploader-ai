import express from 'express';
import pool from '../config/db.js';
import { validateApiKey } from '../middleware/apiKeyAuth.js';

const router = express.Router();

router.get('/claims', validateApiKey, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0, since } = req.query;
    const tenantId = req.apiKey?.tenant_id || 'default';
    
    let query = `
      SELECT id, file_name, status, ai_category, vendor, amount, extracted_date, created_at, updated_at
      FROM documents 
      WHERE tenant_id = $1
    `;
    const params = [tenantId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (since) {
      query += ` AND created_at > $${paramIndex++}`;
      params.push(since);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rows.length
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
      `SELECT * FROM documents WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    res.json({ success: true, data: result.rows[0] });
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
       SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
       WHERE id = $3 AND tenant_id = $4
       RETURNING id, status, updated_at`,
      [status, notes, id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update claim status' });
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
