const pool = require('../config/db');
const { sendSlackNotification, sendTeamsNotification } = require('../utils/notify');

async function createRecurringTemplate(req, res) {
  const { vendor, amount, description, interval_days, next_run } = req.body;
  if (!vendor || !amount || !interval_days || !next_run) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO recurring_templates (vendor, amount, description, interval_days, next_run, user_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [vendor, amount, description || null, interval_days, new Date(next_run), req.user?.userId || null]
    );
    res.json({ template: result.rows[0] });
  } catch (err) {
    console.error('Recurring template create error:', err);
    res.status(500).json({ message: 'Failed to create template' });
  }
}

async function getRecurringTemplates(req, res) {
  try {
    const result = await pool.query('SELECT * FROM recurring_templates ORDER BY id DESC');
    res.json({ templates: result.rows });
  } catch (err) {
    console.error('Recurring template fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch templates' });
  }
}

async function runRecurringInvoices() {
  try {
    const now = new Date();
    const { rows } = await pool.query('SELECT * FROM recurring_templates WHERE next_run <= $1', [now]);
    for (const t of rows) {
      const invoiceNumber = `REC-${Date.now()}`;
      await pool.query(
        `INSERT INTO invoices (invoice_number, date, amount, vendor, approval_chain, current_step, approval_status, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          invoiceNumber,
          now,
          t.amount,
          t.vendor,
          JSON.stringify(['Manager','Finance','CFO']),
          0,
          'Pending',
          t.description || null,
        ]
      );
      const next = new Date(now.getTime() + t.interval_days * 24 * 60 * 60 * 1000);
      await pool.query('UPDATE recurring_templates SET next_run = $1 WHERE id = $2', [next, t.id]);
      sendSlackNotification?.(`Created recurring invoice ${invoiceNumber} for ${t.vendor}`);
      sendTeamsNotification?.(`Created recurring invoice ${invoiceNumber} for ${t.vendor}`);
    }
  } catch (err) {
    console.error('Run recurring invoices error:', err);
  }
}

module.exports = {
  createRecurringTemplate,
  getRecurringTemplates,
  runRecurringInvoices,
};
