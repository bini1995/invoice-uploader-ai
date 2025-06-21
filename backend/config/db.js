// backend/config/db.js

const { Pool } = require('pg');
require('dotenv').config(); // so we can read from .env

// Create a connection pool using info from your .env file
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/invoices',
});

// Log when it connects
pool.on('connect', () => {
  console.log('🟢 Connected to PostgreSQL');
});

module.exports = pool;
