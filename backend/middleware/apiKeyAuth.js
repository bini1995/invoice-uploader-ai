import pool from '../config/db.js';
import crypto from 'crypto';

export async function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      message: 'Please provide an API key via X-API-Key header or api_key query parameter'
    });
  }

  try {
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    const result = await pool.query(
      `SELECT ak.*, t.name as tenant_name 
       FROM api_keys ak 
       LEFT JOIN tenants t ON ak.tenant_id = t.id
       WHERE ak.key_hash = $1 AND ak.is_active = true 
       AND (ak.expires_at IS NULL OR ak.expires_at > NOW())`,
      [keyHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired API key'
      });
    }

    const keyRecord = result.rows[0];
    
    await pool.query(
      `UPDATE api_keys SET last_used_at = NOW(), usage_count = usage_count + 1 WHERE id = $1`,
      [keyRecord.id]
    );

    req.apiKey = keyRecord;
    req.tenantId = keyRecord.tenant_id;
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to validate API key'
    });
  }
}

export async function generateApiKey(name, tenantId, scopes = ['read'], expiresInDays = null) {
  const rawKey = `ck_${crypto.randomBytes(32).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.substring(0, 10);
  
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const result = await pool.query(
    `INSERT INTO api_keys (name, key_hash, key_prefix, tenant_id, scopes, expires_at, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, true)
     RETURNING id, name, key_prefix, scopes, expires_at, created_at`,
    [name, keyHash, keyPrefix, tenantId, JSON.stringify(scopes), expiresAt]
  );

  return {
    ...result.rows[0],
    key: rawKey
  };
}
