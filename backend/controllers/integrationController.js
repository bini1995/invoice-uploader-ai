
import crypto from 'crypto';
import pool from '../config/db.js';
import { buildAuthorizationUrl, exchangeAuthorizationCode, fetchFhirResource, getFhirConfig } from '../services/fhirService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const resolveTenantId = async (tenantId) => {
  if (!tenantId) return tenantId;
  if (UUID_REGEX.test(tenantId)) return tenantId;
  try {
    const { rows } = await pool.query('SELECT id FROM tenants WHERE slug = $1 LIMIT 1', [tenantId]);
    return rows[0]?.id || tenantId;
  } catch (err) {
    console.error('Tenant resolution error:', err.message);
    return tenantId;
  }
};

const upsertIntegration = async (tenantId, { name, type, provider, webhookUrl, environment }) => {
  const resolvedTenantId = await resolveTenantId(tenantId);
  const { rows } = await pool.query(
    'SELECT id FROM integrations WHERE tenant_id = $1 AND provider = $2 LIMIT 1',
    [resolvedTenantId, provider]
  );
  if (rows.length) return { integrationId: rows[0].id, tenantId: resolvedTenantId };

  const insertRes = await pool.query(
    `INSERT INTO integrations (tenant_id, name, type, provider, webhook_url, environment, status, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, 'active', true)
     RETURNING id`,
    [resolvedTenantId, name, type, provider, webhookUrl || null, environment || 'production']
  );
  return { integrationId: insertRes.rows[0].id, tenantId: resolvedTenantId };
};

const logIntegrationEvent = async (tenantId, integrationId, activity, data) => {
  const payload = data || {};
  await pool.query(
    'INSERT INTO integration_logs (tenant_id, integration_id, activity, data) VALUES ($1, $2, $3, $4)',
    [tenantId, integrationId, activity, payload]
  );
};

export const handleZapier = async (req, res) => {
  try {
    const { integrationId, tenantId } = await upsertIntegration(req.tenantId, {
      name: 'Zapier Automation',
      type: 'workflow',
      provider: 'zapier',
      webhookUrl: req.body?.webhook_url,
      environment: req.body?.environment
    });
    await logIntegrationEvent(tenantId, integrationId, 'zapier_event', req.body);
  } catch (err) {
    console.error('Zapier webhook error:', err.message);
  }
  res.json({ message: 'Event received' });
};

export const guidewireTrigger = async (req, res) => {
  console.log('Guidewire event:', req.body);
  res.json({ message: 'Guidewire trigger received' });
};

export const duckCreekTrigger = async (req, res) => {
  console.log('Duck Creek event:', req.body);
  res.json({ message: 'Duck Creek trigger received' });
};

export const handleErpWebhook = async (req, res) => {
  const provider = req.params.provider || req.body?.provider || req.headers['x-erp-provider'] || 'generic-erp';
  const webhookUrl = req.body?.webhook_url || req.headers['x-webhook-url'];
  const activity = req.body?.event || 'erp_webhook_received';
  try {
    const { integrationId, tenantId } = await upsertIntegration(req.tenantId, {
      name: `${provider} ERP Webhook`,
      type: 'erp',
      provider,
      webhookUrl,
      environment: req.body?.environment
    });
    await logIntegrationEvent(tenantId, integrationId, activity, req.body);
  } catch (err) {
    console.error('ERP webhook error:', err.message);
  }
  res.json({ message: 'ERP webhook received', provider });
};

export const handleEpicWebhook = async (req, res) => {
  const activity = req.body?.event || req.body?.event_type || 'epic_claim_event';
  try {
    const { integrationId, tenantId } = await upsertIntegration(req.tenantId, {
      name: 'Epic EHR Claims',
      type: 'ehr',
      provider: 'epic',
      webhookUrl: req.body?.webhook_url || req.headers['x-webhook-url'],
      environment: req.body?.environment
    });
    await logIntegrationEvent(tenantId, integrationId, activity, req.body);
  } catch (err) {
    console.error('Epic webhook error:', err.message);
  }
  res.json({ message: 'Epic webhook received' });
};

export const handleEhrWebhook = async (req, res) => {
  const provider = req.params.provider || req.body?.provider || req.headers['x-ehr-provider'] || 'generic-ehr';
  const activity = req.body?.event || req.body?.event_type || 'ehr_webhook_received';
  try {
    const { integrationId, tenantId } = await upsertIntegration(req.tenantId, {
      name: `${provider} EHR Webhook`,
      type: 'ehr',
      provider,
      webhookUrl: req.body?.webhook_url || req.headers['x-webhook-url'],
      environment: req.body?.environment
    });
    await logIntegrationEvent(tenantId, integrationId, activity, req.body);
  } catch (err) {
    console.error('EHR webhook error:', err.message);
  }
  res.json({ message: 'EHR webhook received', provider });
};

const ensureFhirConfig = (provider) => {
  const config = getFhirConfig(provider);
  const missing = ['clientId', 'clientSecret', 'authUrl', 'tokenUrl', 'baseUrl', 'redirectUri'].filter(
    (key) => !config[key]
  );
  if (missing.length) {
    const error = new Error(`Missing FHIR configuration: ${missing.join(', ')}`);
    error.status = 400;
    throw error;
  }
  return config;
};

export const startFhirOAuth = async (req, res) => {
  try {
    const provider = req.params.provider || 'epic';
    const config = ensureFhirConfig(provider);
    const state = req.query?.state || crypto.randomBytes(16).toString('hex');
    const authorizationUrl = buildAuthorizationUrl(config, { state });
    res.json({ provider, authorization_url: authorizationUrl, state });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const handleFhirOAuthCallback = async (req, res) => {
  try {
    const provider = req.params.provider || 'epic';
    const config = ensureFhirConfig(provider);
    const code = req.query?.code;
    if (!code) {
      return res.status(400).json({ message: 'Missing authorization code.' });
    }
    const tokenResponse = await exchangeAuthorizationCode(config, code);
    const { integrationId, tenantId } = await upsertIntegration(req.tenantId, {
      name: `${provider} FHIR OAuth`,
      type: 'ehr',
      provider,
      webhookUrl: null,
      environment: req.query?.environment,
    });
    await logIntegrationEvent(tenantId, integrationId, 'fhir_oauth_exchange', {
      scope: tokenResponse.scope,
      token_type: tokenResponse.token_type,
      expires_in: tokenResponse.expires_in,
    });
    res.json({ provider, token: tokenResponse });
  } catch (err) {
    console.error('FHIR OAuth callback error:', err.message);
    res.status(err.status || 500).json({ message: 'Failed to exchange OAuth code.' });
  }
};

export const pullFhirClaims = async (req, res) => {
  try {
    const provider = req.params.provider || 'epic';
    const config = ensureFhirConfig(provider);
    const authHeader = req.headers.authorization || '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.body?.access_token;
    if (!accessToken) {
      return res.status(401).json({ message: 'Bearer access token required.' });
    }
    const params = {
      patient: req.query?.patient,
      status: req.query?.status,
      _count: req.query?._count || 50,
      _since: req.query?._since,
    };
    const claims = await fetchFhirResource(config, 'ExplanationOfBenefit', accessToken, params);
    res.json({ provider, resource: 'ExplanationOfBenefit', bundle: claims });
  } catch (err) {
    console.error('FHIR claims pull error:', err.message);
    res.status(500).json({ message: 'Failed to pull FHIR claims.' });
  }
};

export const handleFhirWebhook = async (req, res) => {
  const provider = req.params.provider || req.body?.provider || req.headers['x-fhir-provider'] || 'fhir';
  const activity = req.body?.event || req.body?.event_type || 'fhir_subscription_event';
  try {
    const { integrationId, tenantId } = await upsertIntegration(req.tenantId, {
      name: `${provider} FHIR Subscription`,
      type: 'ehr',
      provider,
      webhookUrl: req.body?.webhook_url || req.headers['x-webhook-url'],
      environment: req.body?.environment,
    });
    await logIntegrationEvent(tenantId, integrationId, activity, req.body);
  } catch (err) {
    console.error('FHIR webhook error:', err.message);
  }
  res.json({ message: 'FHIR webhook received', provider });
};

export const listPublicInvoices = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, invoice_number, vendor, amount, date FROM invoices LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('Public API error:', err.message);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};
