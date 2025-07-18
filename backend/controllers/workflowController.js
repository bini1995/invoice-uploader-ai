const pool = require('../config/db');
const { evaluateWorkflowRules } = require('../utils/workflowRulesEngine');

exports.getWorkflows = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, department, doc_type, conditions, approval_chain FROM document_workflows');
    res.json({ workflows: result.rows });
  } catch (err) {
    console.error('Get workflows error:', err);
    res.status(500).json({ message: 'Failed to fetch workflows' });
  }
};

exports.setWorkflow = async (req, res) => {
  const { department, doc_type, conditions, approval_chain } = req.body;
  if (!department || !doc_type || !Array.isArray(approval_chain)) {
    return res.status(400).json({ message: 'Missing department, doc_type or approval_chain' });
  }
  try {
    await pool.query(
      `INSERT INTO document_workflows (department, doc_type, conditions, approval_chain)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (department, doc_type) DO UPDATE SET conditions = $3, approval_chain = $4`,
      [department.toLowerCase(), doc_type.toLowerCase(), conditions || null, JSON.stringify(approval_chain)]
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
