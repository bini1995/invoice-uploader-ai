const pool = require('../config/db');
const { evaluateWorkflowRules } = require('../utils/workflowRulesEngine');

exports.getWorkflows = async (req, res) => {
  try {
    const result = await pool.query('SELECT department, approval_chain FROM workflows');
    res.json({ workflows: result.rows });
  } catch (err) {
    console.error('Get workflows error:', err);
    res.status(500).json({ message: 'Failed to fetch workflows' });
  }
};

exports.setWorkflow = async (req, res) => {
  const { department, approval_chain } = req.body;
  if (!department || !Array.isArray(approval_chain)) {
    return res.status(400).json({ message: 'Missing department or approval_chain' });
  }
  try {
    await pool.query(
      `INSERT INTO workflows (department, approval_chain)
       VALUES ($1, $2)
       ON CONFLICT (department) DO UPDATE SET approval_chain = $2`,
      [department.toLowerCase(), JSON.stringify(approval_chain)]
    );
    res.json({ message: 'Workflow saved' });
  } catch (err) {
    console.error('Set workflow error:', err);
    res.status(500).json({ message: 'Failed to save workflow' });
  }
};

exports.evaluateWorkflow = async (req, res) => {
  const payload = req.body || {};
  try {
    const result = await evaluateWorkflowRules(payload);
    await pool.query(
      'INSERT INTO workflow_evaluations (payload, result) VALUES ($1,$2)',
      [JSON.stringify(payload), JSON.stringify(result)]
    );
    res.json({ result });
  } catch (err) {
    console.error('Evaluate workflow error:', err);
    res.status(500).json({ message: 'Failed to evaluate workflow rules' });
  }
};
