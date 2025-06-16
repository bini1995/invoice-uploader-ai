const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { parseCSV } = require('../utils/csvParser');
const { sendSlackNotification, sendTeamsNotification } = require('../utils/notify');

exports.uploadPOs = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== '.csv') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Only CSV files supported' });
    }
    const rows = await parseCSV(req.file.path);
    for (const row of rows) {
      const po_number = row.po_number?.trim();
      const vendor = row.vendor?.trim();
      const amount = parseFloat(row.amount);
      if (!po_number || !vendor || isNaN(amount)) continue;
      await pool.query(
        `INSERT INTO purchase_orders (po_number, vendor, amount)
         VALUES ($1,$2,$3)
         ON CONFLICT (po_number) DO UPDATE SET vendor = $2, amount = $3`,
        [po_number, vendor, amount]
      );
    }
    fs.unlinkSync(req.file.path);
    res.json({ message: 'POs uploaded', inserted: rows.length });
  } catch (err) {
    console.error('PO upload error:', err);
    await sendSlackNotification?.(`PO upload failed: ${err.message}`);
    res.status(500).json({ message: 'Failed to upload POs' });
  }
};

exports.getPOs = async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM purchase_orders ORDER BY created_at DESC');
    res.json({ purchase_orders: result.rows });
  } catch (err) {
    console.error('Get POs error:', err);
    await sendSlackNotification?.(`Fetching POs failed: ${err.message}`);
    res.status(500).json({ message: 'Failed to fetch POs' });
  }
};
