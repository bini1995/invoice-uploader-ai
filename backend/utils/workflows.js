const pool = require('../config/db');

async function getWorkflowForDocument(department, docType, amount) {
  const dept = (department || '').toLowerCase();
  const type = (docType || '').toLowerCase();
  try {
    const result = await pool.query(
      'SELECT approval_chain, conditions FROM document_workflows WHERE department = $1 AND doc_type = $2',
      [dept, type]
    );
    if (result.rows.length) {
      return {
        approvalChain: result.rows[0].approval_chain,
        conditions: result.rows[0].conditions || null,
        autoApprove: false
      };
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

module.exports = { getWorkflowForDocument };
