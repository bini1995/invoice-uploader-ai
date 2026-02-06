import express from 'express';
import pool from '../config/db.js';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
import { deliverToWebhook, triggerDelivery } from '../services/deliveryService.js';
import crypto from 'crypto';

const router = express.Router();

router.get('/configs', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, tenant_id, name, type, config, active, created_at, updated_at FROM delivery_configs WHERE tenant_id = $1 ORDER BY created_at DESC',
      [req.tenantId]
    );
    const masked = rows.map(r => ({
      ...r,
      config: { ...r.config, secret: r.config?.secret ? '••••••••' : undefined }
    }));
    res.json({ success: true, data: masked });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch delivery configs' });
  }
});

router.post('/configs', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, type, config } = req.body;
    if (!name || !type) return res.status(400).json({ success: false, error: 'name and type are required' });
    
    const validTypes = ['webhook', 'zapier', 'email', 'erp'];
    if (!validTypes.includes(type)) return res.status(400).json({ success: false, error: `type must be one of: ${validTypes.join(', ')}` });

    const finalConfig = { ...config };
    if ((type === 'webhook' || type === 'zapier') && !finalConfig.secret) {
      finalConfig.secret = crypto.randomBytes(32).toString('hex');
    }

    const { rows } = await pool.query(
      `INSERT INTO delivery_configs (tenant_id, name, type, config) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.tenantId, name, type, finalConfig]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create delivery config' });
  }
});

router.put('/configs/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, config, active } = req.body;
    const { rows } = await pool.query(
      `UPDATE delivery_configs SET name = COALESCE($1, name), config = COALESCE($2, config), active = COALESCE($3, active), updated_at = NOW()
       WHERE id = $4 AND tenant_id = $5 RETURNING *`,
      [name, config, active, id, req.tenantId]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Config not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update delivery config' });
  }
});

router.delete('/configs/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM delivery_configs WHERE id = $1 AND tenant_id = $2',
      [id, req.tenantId]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Config not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete delivery config' });
  }
});

router.post('/configs/:id/test', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM delivery_configs WHERE id = $1 AND tenant_id = $2',
      [id, req.tenantId]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Config not found' });

    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      claim: {
        id: 0,
        file_name: 'test_claim.pdf',
        doc_type: 'medical_bill',
        status: 'pending',
        extracted_fields: {
          claim_id: 'TEST-001',
          claimant_name: 'Test Patient',
          total_claimed_amount: 1250.00,
          cpt_codes: ['99213'],
          icd10_codes: ['M54.5']
        }
      }
    };

    const result = await deliverToWebhook(rows[0], testPayload);
    res.json({ success: result.success, status: result.status, body: result.body, error: result.error });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Test failed' });
  }
});

router.post('/trigger/:documentId', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { documentId } = req.params;
    const { event_type = 'claim.extracted' } = req.body;
    await triggerDelivery(req.tenantId, parseInt(documentId), event_type);
    res.json({ success: true, message: 'Delivery triggered' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to trigger delivery' });
  }
});

router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, config_id } = req.query;
    let query = `SELECT dl.*, dc.name as config_name, dc.type as config_type, d.file_name
                 FROM delivery_logs dl
                 LEFT JOIN delivery_configs dc ON dc.id = dl.delivery_config_id
                 LEFT JOIN documents d ON d.id = dl.document_id
                 WHERE dl.tenant_id = $1`;
    const params = [req.tenantId];
    let idx = 2;

    if (status) { query += ` AND dl.status = $${idx++}`; params.push(status); }
    if (config_id) { query += ` AND dl.delivery_config_id = $${idx++}`; params.push(parseInt(config_id)); }

    query += ` ORDER BY dl.created_at DESC LIMIT $${idx++} OFFSET $${idx}`;
    params.push(parseInt(limit), parseInt(offset));

    const { rows } = await pool.query(query, params);
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM delivery_logs WHERE tenant_id = $1`,
      [req.tenantId]
    );
    res.json({ success: true, data: rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch delivery logs' });
  }
});

export default router;
