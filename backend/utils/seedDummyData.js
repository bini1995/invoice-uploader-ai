
import crypto from 'crypto';
import pool from '../config/db.js';
import logger from './logger.js';

(async function seedDummy() {
  const client = await pool.connect();
  try {
    const tenantResult = await client.query(
      'SELECT id FROM tenants ORDER BY created_at ASC LIMIT 1'
    );
    if (!tenantResult.rows.length) {
      throw new Error('No tenant found to seed demo data.');
    }
    const tenantId = tenantResult.rows[0].id;
    const vendors = ['Acme Corp', 'Globex', 'Soylent', 'Initech', 'Umbrella'];
    const categories = ['Office Supplies', 'Software', 'Travel', 'Utilities'];
    const ttlDays = Number(process.env.DEMO_TTL_DAYS || 7);
    const deleteAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    let inserted = 0;
    for (let i = 0; i < 20; i++) {
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const amount = (Math.random() * 900 + 100).toFixed(2);
      const date = new Date(Date.now() - Math.random() * 60 * 86400000);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const docTitle = `DEMO-${Date.now()}-${i}`;
      const fileName = `${docTitle}.pdf`;
      const docType = 'invoice';
      const contentHash = crypto
        .createHash('sha256')
        .update(`${docTitle}-${amount}-${vendor}`)
        .digest('hex');
      const metadata = {
        demo: true,
        seeded_at: new Date().toISOString(),
        ttl_days: ttlDays,
        category,
        vendor
      };
      await client.query(
        `INSERT INTO documents (
          tenant_id,
          file_name,
          doc_type,
          document_type,
          path,
          retention_policy,
          delete_at,
          expires_at,
          expiration,
          status,
          version,
          metadata,
          type,
          content_hash,
          doc_title,
          file_type,
          raw_text,
          contains_phi,
          phi_fields,
          phi_encrypted_payload,
          anonymized_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
        [
          tenantId,
          fileName,
          docType,
          docType,
          `uploads/demo/${fileName}`,
          'demo',
          deleteAt,
          null,
          null,
          'processed',
          1,
          metadata,
          docType,
          contentHash,
          docTitle,
          'application/pdf',
          `Demo invoice dated ${date.toISOString().split('T')[0]} for ${vendor} totaling $${amount}.`,
          false,
          JSON.stringify([]),
          null,
          null
        ]
      );
      inserted++;
    }
    logger.info(`Seeded ${inserted} dummy invoices with TTL (${ttlDays} days)`);
  } catch (err) {
    console.error('Seed demo data error:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    pool.end();
  }
})();
