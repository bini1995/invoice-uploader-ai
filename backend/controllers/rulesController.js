const { getRules, addRule, updateRule, deleteRule } = require('../utils/rulesEngine');

exports.listRules = (_req, res) => {
  res.json({ rules: getRules() });
};

exports.addRule = (req, res) => {
  const rule = req.body;
  const hasMatchField = rule && (rule.vendor || rule.amountGreaterThan || rule.descriptionContains);
  const hasAction = rule && (rule.category || rule.flagReason);
  if (!hasMatchField || !hasAction) {
    return res.status(400).json({ message: 'Invalid rule' });
  }
  addRule(rule);
  res.json({ message: 'Rule added', rules: getRules() });
};

exports.updateRule = (req, res) => {
  const idx = parseInt(req.params.idx);
  const rule = req.body;
  if (isNaN(idx) || !rule) return res.status(400).json({ message: 'Invalid request' });
  updateRule(idx, rule);
  res.json({ message: 'Rule updated', rules: getRules() });
};

exports.deleteRule = (req, res) => {
  const idx = parseInt(req.params.idx);
  if (isNaN(idx)) return res.status(400).json({ message: 'Invalid request' });
  deleteRule(idx);
  res.json({ message: 'Rule deleted', rules: getRules() });
};
