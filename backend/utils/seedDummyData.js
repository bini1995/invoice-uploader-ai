
import pool from '../config/db.js';
import logger from './logger.js';
(async function seedDummy() {
  const client = await pool.connect();
  try {
    const vendors = ['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Umbrella'];
    const categories = ['Office Supplies', 'Software', 'Travel', 'Utilities'];
    let inserted = 0;
    for (let i = 0; i < 20; i++) {
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const amount = (Math.random() * 900 + 100).toFixed(2);
      const date = new Date(Date.now() - Math.random() * 60 * 86400000);
      const category = categories[Math.floor(Math.random() * categories.length)];
      await client.query(
        `INSERT INTO documents (invoice_number, date, amount, vendor, category, type, title, entity, fileType, contentHash)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          `DEMO-${Date.now()}-${i}`,
          date,
          amount,
          vendor,
          category,
          'invoice',
          `DEMO-${i}`,
          vendor,
          'pdf',
          null
        ]
      );
      inserted++;
    }
    logger.info(`Seeded ${inserted} dummy invoices`);
  } catch (err) {
    console.error('Seed demo data error:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    pool.end();
  }
})();
