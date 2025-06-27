const pool = require('../config/db');

exports.getAuditTrail = async (req, res) => {
  try {
    const { invoiceId } = req.query;
    let result;
    if (invoiceId) {
      result = await pool.query(
        'SELECT * FROM audit_logs WHERE invoice_id = $1 ORDER BY created_at',
        [invoiceId]
      );
    } else {
      result = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC');
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Audit fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};

exports.updateAuditEntry = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  try {
    const result = await pool.query(
      'UPDATE audit_logs SET action = $1 WHERE id = $2 RETURNING *',
      [action, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Audit entry not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Audit update error:', err);
    res.status(500).json({ message: 'Failed to update audit entry' });
  }
};

exports.deleteAuditEntry = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM audit_logs WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Audit entry not found' });
    }
    res.json({ message: 'Audit entry deleted' });
  } catch (err) {
    console.error('Audit delete error:', err);
    res.status(500).json({ message: 'Failed to delete audit entry' });
  }
};
