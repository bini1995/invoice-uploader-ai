const rules = [
  { vendor: 'X', amountGreaterThan: 500, flagReason: 'Vendor X amount > $500' }
];

function applyRules(invoice) {
  let flagged = false;
  let reason = null;
  for (const r of rules) {
    if (
      r.vendor && invoice.vendor && invoice.vendor.toLowerCase() === r.vendor.toLowerCase() &&
      r.amountGreaterThan && parseFloat(invoice.amount) > r.amountGreaterThan
    ) {
      flagged = true;
      reason = r.flagReason || 'Rule triggered';
      break;
    }
  }
  return { ...invoice, flagged, flag_reason: reason };
}

module.exports = { applyRules };
