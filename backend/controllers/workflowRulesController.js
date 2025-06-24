const pool = require('../config/db');

exports.listWorkflowRules = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM workflow_rules ORDER BY priority DESC, id ASC');
    res.json({ rules: rows });
  } catch (err) {
    console.error('List workflow rules error:', err);
    res.status(500).json({ message: 'Failed to fetch workflow rules' });
  }
};

exports.addWorkflowRule = async (req, res) => {
  const {
    vendor,
    amount_greater_than,
    route_to_department,
    assign_approver,
    approval_chain,
    alert_message,
    alert_email,
    alert_phone,
    priority,
    active,
  } = req.body || {};

  if (!vendor && !amount_greater_than) {
    return res.status(400).json({ message: 'vendor or amount_greater_than required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO workflow_rules (
        vendor, amount_greater_than, route_to_department,
        assign_approver, approval_chain, alert_message, alert_email, alert_phone,
        priority, active
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,TRUE)) RETURNING *`,
      [
        vendor || null,
        amount_greater_than || null,
        route_to_department || null,
        assign_approver || null,
        approval_chain ? JSON.stringify(approval_chain) : null,
        alert_message || null,
        alert_email || null,
        alert_phone || null,
        priority || 0,
        active,
      ]
    );
    res.json({ rule: result.rows[0] });
  } catch (err) {
    console.error('Add workflow rule error:', err);
    res.status(500).json({ message: 'Failed to add workflow rule' });
  }
};

exports.updateWorkflowRule = async (req, res) => {
  const id = parseInt(req.params.id);
  const {
    vendor,
    amount_greater_than,
    route_to_department,
    assign_approver,
    approval_chain,
    alert_message,
    alert_email,
    alert_phone,
    priority,
    active,
  } = req.body || {};
  try {
    const result = await pool.query(
      `UPDATE workflow_rules SET
        vendor = COALESCE($1, vendor),
        amount_greater_than = COALESCE($2, amount_greater_than),
        route_to_department = COALESCE($3, route_to_department),
        assign_approver = COALESCE($4, assign_approver),
        approval_chain = COALESCE($5, approval_chain),
        alert_message = COALESCE($6, alert_message),
        alert_email = COALESCE($7, alert_email),
        alert_phone = COALESCE($8, alert_phone),
        priority = COALESCE($9, priority),
        active = COALESCE($10, active)
       WHERE id = $11 RETURNING *`,
      [
        vendor,
        amount_greater_than,
        route_to_department,
        assign_approver,
        approval_chain ? JSON.stringify(approval_chain) : null,
        alert_message,
        alert_email,
        alert_phone,
        priority,
        active,
        id,
      ]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Rule not found' });
    res.json({ rule: result.rows[0] });
  } catch (err) {
    console.error('Update workflow rule error:', err);
    res.status(500).json({ message: 'Failed to update workflow rule' });
  }
};

exports.deleteWorkflowRule = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query('DELETE FROM workflow_rules WHERE id = $1', [id]);
    res.json({ message: 'Rule deleted' });
  } catch (err) {
    console.error('Delete workflow rule error:', err);
    res.status(500).json({ message: 'Failed to delete workflow rule' });
  }
};
