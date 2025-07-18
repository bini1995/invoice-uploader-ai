const fs = require('fs');
const { extractEntities } = require('../ai/entityExtractor');
module.exports = async function processInvoice(path) {
  const text = fs.readFileSync(path, 'utf8').slice(0, 4000);
  const fields = await extractEntities(text);
  return { fields };
};
