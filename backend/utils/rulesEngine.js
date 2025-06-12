let rules = [
  { vendor: 'X', amountGreaterThan: 500, flagReason: 'Vendor X amount > $500' },
  { amountGreaterThan: 5000, flagReason: 'Amount exceeds $5000' },
];

function applyRules(invoice) {
  let flagged = false;
  let reason = null;
  for (const r of rules) {
    const matchVendor = !r.vendor || (invoice.vendor && invoice.vendor.toLowerCase() === r.vendor.toLowerCase());
    const matchAmount = r.amountGreaterThan && parseFloat(invoice.amount) > r.amountGreaterThan;
    if (matchVendor && matchAmount) {
      flagged = true;
      reason = r.flagReason || 'Rule triggered';
      break;
    }
  }
  return { ...invoice, flagged, flag_reason: reason };
}

function getRules() {
  return rules;
}

function addRule(rule) {
  rules.push(rule);
}

function setRules(newRules) {
  rules = newRules;
}

module.exports = { applyRules, getRules, addRule, setRules };
