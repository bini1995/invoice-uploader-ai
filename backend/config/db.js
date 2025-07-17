// backend/config/db.js

const { Pool } = require('pg');
const { AsyncLocalStorage } = require('async_hooks');
require('dotenv').config(); // so we can read from .env
const logger = require('../utils/logger');

logger.info('🔎 Using DATABASE_URL:', process.env.DATABASE_URL);


// Create a connection pool using info from your .env file
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'TATA1tata1',
  database: process.env.DB_NAME || 'invoices_db',
};

// If a full connection string is provided, use it unless it points to localhost
// which would fail inside Docker. In that case, rebuild using DB_* settings.
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    const badHosts = ['localhost', '127.0.0.1', '::1'];
    const needsOverride = badHosts.includes(url.hostname) || url.port === '5433';
    if (needsOverride) {
      url.hostname = process.env.DB_HOST || 'db';
      url.port = process.env.DB_PORT || '5432';
      dbConfig.connectionString = url.toString();
    } else {
      dbConfig.connectionString = process.env.DATABASE_URL;
    }
  } catch (err) {
    // Fallback to using it raw if URL parsing fails
    dbConfig.connectionString = process.env.DATABASE_URL;
  }
}

logger.info('Postgres config:', dbConfig);

const pool = new Pool(dbConfig);

const als = new AsyncLocalStorage();

const origQuery = pool.query.bind(pool);
pool.query = (text, params, callback) => {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  }
  params = params || [];
  const tenantId = als.getStore()?.tenantId || 'default';

  if (tenantId !== 'all') {
    const hasTenant = /tenant_id/i.test(text);
    if (!hasTenant && /FROM\s+invoices/i.test(text)) {
      if (/WHERE/i.test(text)) {
        text = text.replace(/WHERE/i, `WHERE tenant_id = $${params.length + 1} AND`);
      } else {
        text += ` WHERE tenant_id = $${params.length + 1}`;
      }
      params.push(tenantId);
    } else if (/INSERT\s+INTO\s+invoices/i.test(text) && !hasTenant) {
      const colMatch = text.match(/\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (colMatch) {
        text = text.replace(colMatch[0], `(${colMatch[1]}, tenant_id) VALUES (${colMatch[2]}, $${params.length + 1})`);
        params.push(tenantId);
      }
    }
  }

  return origQuery(text, params, callback);
};

// Log when it connects
pool.on('connect', () => {
  logger.info('🟢 Connected to PostgreSQL');
});

pool.als = als;

module.exports = pool;
