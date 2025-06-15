const { getRules, addRule } = require('../utils/rulesEngine');

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
