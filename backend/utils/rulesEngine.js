
import pool from '../config/db.js';
let rules = [
  { vendor: 'X', amountGreaterThan: 500, flagReason: 'Vendor X amount > $500' },
  { amountGreaterThan: 5000, flagReason: 'Amount exceeds $5000' },
  // Claim-specific examples
  { deductibleGreaterThan: 1000, flagReason: 'Deductible over $1000' },
  { benefitMax: 10000, flagReason: 'Benefit exceeds $10000' },
];

// Track how many times each rule triggered
let ruleStats = rules.map(() => 0);

/**
 * Resolve deductible and benefit amounts for claim-related rules.
 *
 * Domain-specific precedence:
 * 1. Use invoice-level fields (`deductible`, `benefit_amount`) when present.
 * 2. Otherwise fall back to the same fields inside `invoice.claim`.
 * 3. If neither level provides a value, default both amounts to `0` so
 *    threshold comparisons behave consistently.
 *
 * @param {Object} invoice - The invoice object which may include claim data.
 * @returns {{deductible: number, benefit: number}} Amounts used for rule
 *   evaluation where invoice values trump claim-level values and missing
 *   fields become zero.
 */
function getInvoiceDeductibleBenefit(invoice) {
  const deductible = invoice.deductible ?? invoice.claim?.deductible ?? 0; // invoice > claim > 0
  const benefit = invoice.benefit_amount ?? invoice.claim?.benefit_amount ?? 0; // invoice > claim > 0
  return { deductible, benefit };
}

/**
 * Apply the active rule set to an invoice.
 *
 * Deductible and benefit thresholds rely on `getInvoiceDeductibleBenefit`,
 * which enforces the invoice > claim > 0 precedence. This ensures rule
 * matching uses invoice-level values first, falls back to claim data, and
 * treats missing fields as zero.
 *
 * @param {Object} invoice - Invoice being evaluated.
 * @returns {Object} The invoice annotated with flags and tags.
 */
async function applyRules(invoice) {
  let flagged = false;
  let reason = null;
  let tags = Array.isArray(invoice.tags) ? [...invoice.tags] : [];
  // Resolve deductible/benefit with invoice-first precedence; see helper for details.
  const { deductible: invoiceDeductible, benefit: invoiceBenefit } = getInvoiceDeductibleBenefit(invoice);
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    const matchVendor = !r.vendor || (invoice.vendor && invoice.vendor.toLowerCase().includes(r.vendor.toLowerCase()));
    const matchAmount = r.amountGreaterThan ? parseFloat(invoice.amount) > r.amountGreaterThan : true;
    const matchDesc = !r.descriptionContains || ((invoice.description || '').toLowerCase().includes(r.descriptionContains.toLowerCase()));
    // These comparisons use amounts where invoice overrides claim and defaults to 0
    const matchDeductible = r.deductibleGreaterThan
      ? parseFloat(invoiceDeductible) > r.deductibleGreaterThan
      : true;
    const matchBenefit = r.benefitMax
      ? parseFloat(invoiceBenefit) > r.benefitMax
      : true;
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

export { applyRules, getRules, addRule, setRules, updateRule, deleteRule };
