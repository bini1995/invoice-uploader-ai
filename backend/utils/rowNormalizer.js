function normalizeRow(row) {
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
    result[normalizedKey] = typeof value === 'string' ? value.trim() : value;
  }
  return result;
}

module.exports = { normalizeRow };
