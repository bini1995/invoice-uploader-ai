const { validateHeaders, getValidationRules, addValidationRule } = require('../utils/validationEngine');
const { validate } = require('../utils/schemaValidator');

exports.validateHeaders = (req, res) => {
  const { headers } = req.body;
  if (!Array.isArray(headers)) {
    return res.status(400).json({ message: 'Invalid headers' });
  }
  const missing = validateHeaders(headers);
  res.json({ missing });
};

exports.validateRow = (req, res) => {
  const row = req.body;
  if (!row || typeof row !== 'object') {
    return res.status(400).json({ message: 'Invalid row data' });
  }
  const docType = row.document_type || row.doc_type || 'invoice';
  const errors = validate(docType, row);
  res.json({ errors });
};

exports.listRules = (_req, res) => {
  res.json({ rules: getValidationRules() });
};

exports.addRule = (req, res) => {
  const rule = req.body;
  if (!rule || !rule.field || !rule.type) {
    return res.status(400).json({ message: 'Invalid rule' });
  }
  addValidationRule(rule);
  res.json({ message: 'Rule added', rules: getValidationRules() });
};
