const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

function loadSchema(docType) {
  const p = path.join(__dirname, '../schemas', `${docType}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function validate(docType, data) {
  const schema = loadSchema(docType);
  if (!schema) return [];
  const validate = ajv.compile(schema);
  const ok = validate(data);
  if (ok) return [];
  return (validate.errors || []).map(e => ({ field: e.instancePath.replace('/', ''), message: e.message }));
}

module.exports = { validate };
