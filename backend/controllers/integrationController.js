
import pool from '../config/db.js';
export const handleZapier = async (req, res) => {
  console.log('Received Zapier event:', req.body);
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

export const listPublicInvoices = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, invoice_number, vendor, amount, date FROM invoices LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('Public API error:', err.message);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};
