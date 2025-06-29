// backend/config/db.js

const { Pool } = require('pg');
const { AsyncLocalStorage } = require('async_hooks');
require('dotenv').config(); // so we can read from .env

// Create a connection pool using info from your .env file
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/invoices',
});

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
  console.log('🟢 Connected to PostgreSQL');
});

pool.als = als;

module.exports = pool;
