const pool = require('../config/db');
const {
  sendSlackNotification,
  sendTeamsNotification,
  sendEmailNotification,
  sendSmsNotification,
} = require('./notify');

async function evaluateWorkflowRules(invoice) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM workflow_rules WHERE active = TRUE ORDER BY priority DESC, id ASC'
    );
    const updates = {};
    for (const rule of rows) {
      const vendorMatch = !rule.vendor ||
        (invoice.vendor && invoice.vendor.toLowerCase().includes(rule.vendor.toLowerCase()));
      const amountMatch =
        !rule.amount_greater_than || parseFloat(invoice.amount) > parseFloat(rule.amount_greater_than);
      if (vendorMatch && amountMatch) {
        if (rule.route_to_department) updates.department = rule.route_to_department;
        if (rule.assign_approver) updates.assignee = rule.assign_approver;
        if (rule.approval_chain) updates.approval_chain = rule.approval_chain;
        if (rule.alert_message) {
          const msg = rule.alert_message.replace('{invoice}', invoice.invoice_number || '');
          await sendSlackNotification?.(msg);
          await sendTeamsNotification?.(msg);
          await sendEmailNotification?.(rule.alert_email, 'Workflow Alert', msg);
          await sendSmsNotification?.(rule.alert_phone, msg);
        }
      }
    }
    return updates;
  } catch (err) {
    console.error('Workflow rule eval error:', err);
    return {};
  }
}

module.exports = { evaluateWorkflowRules };
