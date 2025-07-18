const fs = require('fs');
module.exports = async function processContract(path) {
  const text = fs.readFileSync(path, 'utf8').toLowerCase();
  const clauses = ['governing law','termination','confidentiality'];
  const missing = clauses.filter(c => !text.includes(c));
  return { complianceIssues: missing };
};
