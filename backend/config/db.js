// backend/config/db.js


import { Pool } from 'pg';
import { AsyncLocalStorage } from 'async_hooks';
import 'dotenv/config';
import logger from '../utils/logger.js';
logger.info('🔎 Using DATABASE_URL:', process.env.DATABASE_URL);

// Create a connection pool using info from your .env file
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'TATA1tata1',
  database: process.env.DB_NAME || 'invoices_db',
  // Connection pool optimization
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  // SSL configuration for production - disabled for local development
  ssl: false, // process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
    }
    // Add SSL disable parameter for local development
    url.searchParams.set('sslmode', 'disable');
    dbConfig.connectionString = url.toString();
  } catch (err) {
    // Fallback to using it raw if URL parsing fails
    dbConfig.connectionString = process.env.DATABASE_URL;
  }
}

if (!process.env.DATABASE_URL) {
  logger.info('DATABASE_URL not set, using individual DB_* env vars');
}

console.log('🔎 Final dbConfig:', dbConfig);
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

export default pool;
