const pool = require('../config/db');

let rules = [
  { vendor: 'X', amountGreaterThan: 500, flagReason: 'Vendor X amount > $500' },
  { amountGreaterThan: 5000, flagReason: 'Amount exceeds $5000' },
  // Example categorization rule
  { vendor: 'Google', category: 'Marketing' },
  // Claim-specific examples
  { deductibleGreaterThan: 1000, flagReason: 'Deductible over $1000' },
  { benefitMax: 10000, flagReason: 'Benefit exceeds $10000' },
];

// Track how many times each rule triggered
let ruleStats = rules.map(() => 0);

async function applyRules(invoice) {
  let flagged = false;
  let reason = null;
  let tags = Array.isArray(invoice.tags) ? [...invoice.tags] : [];
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    const matchVendor = !r.vendor || (invoice.vendor && invoice.vendor.toLowerCase().includes(r.vendor.toLowerCase()));
    const matchAmount = r.amountGreaterThan ? parseFloat(invoice.amount) > r.amountGreaterThan : true;
    const matchDesc = !r.descriptionContains || ((invoice.description || '').toLowerCase().includes(r.descriptionContains.toLowerCase()));
    const matchDeductible = r.deductibleGreaterThan ? parseFloat(invoice.deductible || 0) > r.deductibleGreaterThan : true;
    const matchBenefit = r.benefitMax ? parseFloat(invoice.benefit_amount || 0) > r.benefitMax : true;
    let matchNewVendor = true;
    if (r.newVendor && invoice.vendor) {
      const { rows } = await pool.query('SELECT 1 FROM invoices WHERE vendor = $1 LIMIT 1', [invoice.vendor]);
      matchNewVendor = rows.length === 0;
    }
    let matchPastDue = true;
    if (r.pastDue) {
      matchPastDue = invoice.due_date && new Date(invoice.due_date) < new Date();
    }
    let matchDup = true;
    if (r.duplicateId && invoice.invoice_number) {
      const { rows } = await pool.query('SELECT 1 FROM invoices WHERE invoice_number = $1 LIMIT 1', [invoice.invoice_number]);
      matchDup = rows.length > 0;
    }
    if (matchVendor && matchAmount && matchDesc && matchNewVendor && matchPastDue && matchDup && matchDeductible && matchBenefit) {
      if (r.flagReason) {
        flagged = true;
        reason = r.flagReason || 'Rule triggered';
      }
      if (r.category) {
        tags.push(r.category);
      }
      ruleStats[i] = (ruleStats[i] || 0) + 1;
    }
  }
  tags = Array.from(new Set(tags));
  return { ...invoice, flagged, flag_reason: reason, tags };
}

function getRules() {
  return rules.map((r, i) => ({ ...r, triggered: ruleStats[i] || 0 }));
}

function addRule(rule) {
  rules.push(rule);
  ruleStats.push(0);
}

function setRules(newRules) {
  rules = newRules;
  ruleStats = newRules.map(() => 0);
}

function updateRule(index, rule) {
  if (rules[index]) {
    rules[index] = rule;
  }
}

function deleteRule(index) {
  if (rules[index]) {
    rules.splice(index, 1);
    ruleStats.splice(index, 1);
  }
}

module.exports = { applyRules, getRules, addRule, setRules, updateRule, deleteRule };
