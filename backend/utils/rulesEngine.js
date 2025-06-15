let rules = [
  { vendor: 'X', amountGreaterThan: 500, flagReason: 'Vendor X amount > $500' },
  { amountGreaterThan: 5000, flagReason: 'Amount exceeds $5000' },
  // Example categorization rule
  { vendor: 'Google', category: 'Marketing' },
];

function applyRules(invoice) {
  let flagged = false;
  let reason = null;
  let tags = Array.isArray(invoice.tags) ? [...invoice.tags] : [];
  for (const r of rules) {
    const matchVendor = !r.vendor || (invoice.vendor && invoice.vendor.toLowerCase().includes(r.vendor.toLowerCase()));
    const matchAmount = r.amountGreaterThan ? parseFloat(invoice.amount) > r.amountGreaterThan : true;
    const matchDesc = !r.descriptionContains || ((invoice.description || '').toLowerCase().includes(r.descriptionContains.toLowerCase()));
    if (matchVendor && matchAmount && matchDesc) {
      if (r.flagReason) {
        flagged = true;
        reason = r.flagReason || 'Rule triggered';
      }
      if (r.category) {
        tags.push(r.category);
      }
    }
  }
  tags = Array.from(new Set(tags));
  return { ...invoice, flagged, flag_reason: reason, tags };
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
