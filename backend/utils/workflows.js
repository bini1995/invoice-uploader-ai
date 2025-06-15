const pool = require('../config/db');

async function getWorkflowForDepartment(department, amount) {
  const dept = (department || '').toLowerCase();
  try {
    const result = await pool.query('SELECT approval_chain FROM workflows WHERE department = $1', [dept]);
    if (result.rows.length) {
      return { approvalChain: result.rows[0].approval_chain, autoApprove: false };
    }
  } catch (err) {
    console.error('Workflow lookup error:', err);
  }
  if (dept === 'finance') {
    return { approvalChain: ['Finance Level 1', 'Finance Level 2'], autoApprove: false };
  }
  if (dept === 'legal') {
    return { approvalChain: [], autoApprove: true };
  }
  if (dept === 'ops') {
    if (parseFloat(amount) < 100) {
      return { approvalChain: [], autoApprove: true };
    }
    return { approvalChain: ['Ops Manager'], autoApprove: false };
  }
  return { approvalChain: ['Manager', 'Finance', 'CFO'], autoApprove: false };
}

module.exports = { getWorkflowForDepartment };
