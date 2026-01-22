
import { getRules, addRule as addRuleUtil, updateRule as updateRuleUtil, deleteRule as deleteRuleUtil } from '../utils/rulesEngine.js';
export const listRules = (_req, res) => {
  res.json({ rules: getRules() });
};

export const addRule = (req, res) => {
  const rule = req.body;
  const hasMatchField =
    rule &&
    (rule.vendor ||
      rule.amountGreaterThan ||
      rule.descriptionContains ||
      rule.deductibleGreaterThan ||
      rule.benefitMax);
  const hasAction = rule && (rule.category || rule.flagReason);
  if (!hasMatchField || !hasAction) {
    return res.status(400).json({ message: 'Invalid rule' });
  }
  if (rule.deductibleGreaterThan !== undefined) {
    const num = Number(rule.deductibleGreaterThan);
    if (Number.isNaN(num)) {
      return res.status(400).json({ message: 'Invalid rule' });
    }
    rule.deductibleGreaterThan = num;
  }
  if (rule.benefitMax !== undefined) {
    const num = Number(rule.benefitMax);
    if (Number.isNaN(num)) {
      return res.status(400).json({ message: 'Invalid rule' });
    }
    rule.benefitMax = num;
  }
  addRuleUtil(rule);
  res.json({ message: 'Rule added', rules: getRules() });
};

export const updateRule = (req, res) => {
  const idx = parseInt(req.params.idx);
  const rule = req.body;
  if (isNaN(idx) || !rule) return res.status(400).json({ message: 'Invalid request' });
  if (rule.deductibleGreaterThan !== undefined) {
    const num = Number(rule.deductibleGreaterThan);
    if (Number.isNaN(num)) {
      return res.status(400).json({ message: 'Invalid rule' });
    }
    rule.deductibleGreaterThan = num;
  }
  if (rule.benefitMax !== undefined) {
    const num = Number(rule.benefitMax);
    if (Number.isNaN(num)) {
      return res.status(400).json({ message: 'Invalid rule' });
    }
    rule.benefitMax = num;
  }
  updateRuleUtil(idx, rule);
  res.json({ message: 'Rule updated', rules: getRules() });
};

export const deleteRule = (req, res) => {
  const idx = parseInt(req.params.idx);
  if (isNaN(idx)) return res.status(400).json({ message: 'Invalid request' });
  deleteRuleUtil(idx);
  res.json({ message: 'Rule deleted', rules: getRules() });
};
