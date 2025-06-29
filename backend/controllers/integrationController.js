const pool = require('../config/db');

exports.handleZapier = async (req, res) => {
  console.log('Received Zapier event:', req.body);
  res.json({ message: 'Event received' });
};

exports.listPublicInvoices = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, invoice_number, vendor, amount, date FROM invoices LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('Public API error:', err.message);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};
