function getWorkflowForDepartment(department, amount) {
  const dept = (department || '').toLowerCase();
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
