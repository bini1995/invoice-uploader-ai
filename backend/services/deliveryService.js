import pool from '../config/db.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';

function signPayload(payload, secret) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
}

function buildClaimPayload(doc, fields) {
  let parsedFields = fields;
  if (typeof fields === 'string') {
    try { parsedFields = JSON.parse(fields); } catch { parsedFields = {}; }
  }
  if (parsedFields && parsedFields.raw) {
    try {
      const cleaned = parsedFields.raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedFields = JSON.parse(cleaned);
    } catch { /* keep as-is */ }
  }
  return {
    event: 'claim.extracted',
    timestamp: new Date().toISOString(),
    claim: {
      id: doc.id,
      file_name: doc.file_name,
      doc_type: doc.doc_type,
      status: doc.status,
      contains_phi: doc.contains_phi,
      created_at: doc.created_at,
      extracted_fields: parsedFields
    }
  };
}

export async function deliverToWebhook(config, payload) {
  const url = config.config?.url;
  const secret = config.config?.secret || '';
  if (!url) return { success: false, error: 'No URL configured' };

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'ClarifyOps-Webhook/1.0',
    'X-ClarifyOps-Event': payload.event || 'claim.extracted',
    ...(config.config?.headers || {})
  };

  if (secret) {
    headers['X-Webhook-Signature'] = signPayload(payload, secret);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const body = await res.text().catch(() => '');
    return { success: res.ok, status: res.status, body };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function triggerDelivery(tenantId, documentId, eventType = 'claim.extracted') {
  try {
    const { rows: configs } = await pool.query(
      `SELECT * FROM delivery_configs WHERE tenant_id = $1 AND active = true`,
      [tenantId]
    );

    if (!configs.length) return;

    const { rows: docs } = await pool.query(
      `SELECT d.*, cf.fields FROM documents d 
       LEFT JOIN claim_fields cf ON cf.document_id = d.id 
       WHERE d.id = $1`,
      [documentId]
    );
    if (!docs.length) return;

    const doc = docs[0];
    const payload = buildClaimPayload(doc, doc.fields);
    payload.event = eventType;

    for (const config of configs) {
      const eventFilter = config.config?.events;
      if (eventFilter && Array.isArray(eventFilter) && !eventFilter.includes(eventType)) {
        continue;
      }

      let result;
      if (config.type === 'webhook' || config.type === 'zapier') {
        result = await deliverToWebhook(config, payload);
      } else {
        result = { success: false, error: `Unsupported delivery type: ${config.type}` };
      }

      await pool.query(
        `INSERT INTO delivery_logs (tenant_id, delivery_config_id, document_id, event_type, payload, status, response_code, response_body, attempt_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)`,
        [
          tenantId,
          config.id,
          documentId,
          eventType,
          payload,
          result.success ? 'success' : 'failed',
          result.status || null,
          (result.body || result.error || '').substring(0, 2000)
        ]
      );

      if (!result.success) {
        logger.warn({ configId: config.id, documentId, error: result.error }, 'Delivery failed');
        await pool.query(
          `UPDATE delivery_logs SET status = 'retrying', next_retry_at = NOW() + INTERVAL '5 minutes'
           WHERE delivery_config_id = $1 AND document_id = $2 AND status = 'failed' AND attempt_count < 3`,
          [config.id, documentId]
        );
      }
    }
  } catch (err) {
    logger.error({ err, tenantId, documentId }, 'Delivery orchestration error');
  }
}

export async function retryFailedDeliveries() {
  try {
    const { rows } = await pool.query(
      `SELECT dl.*, dc.config, dc.type FROM delivery_logs dl
       JOIN delivery_configs dc ON dc.id = dl.delivery_config_id
       WHERE dl.status = 'retrying' AND dl.next_retry_at <= NOW() AND dl.attempt_count < 3`
    );

    for (const log of rows) {
      const result = await deliverToWebhook({ config: log.config, type: log.type }, log.payload);
      const backoffMinutes = Math.pow(2, log.attempt_count) * 5;

      await pool.query(
        `UPDATE delivery_logs SET 
          status = $1, response_code = $2, response_body = $3, 
          attempt_count = attempt_count + 1,
          next_retry_at = CASE WHEN $1 = 'failed' AND attempt_count + 1 < 3 THEN NOW() + INTERVAL '${backoffMinutes} minutes' ELSE NULL END
         WHERE id = $4`,
        [
          result.success ? 'success' : (log.attempt_count + 1 >= 3 ? 'failed' : 'retrying'),
          result.status || null,
          (result.body || result.error || '').substring(0, 2000),
          log.id
        ]
      );
    }
  } catch (err) {
    logger.error({ err }, 'Retry delivery error');
  }
}
