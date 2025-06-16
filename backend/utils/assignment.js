const pool = require('../config/db');

const tagAssigneeMap = {
  marketing: 'Alice',
  design: 'Design Team',
  'office supplies': 'Bob',
  it: 'Charlie',
  cloud: 'Charlie',
};

async function getAssigneeFromVendorHistory(vendor) {
  if (!vendor) return null;
  try {
    const res = await pool.query(
      `SELECT assignee, COUNT(*) AS cnt
       FROM invoices
       WHERE LOWER(vendor) = LOWER($1) AND assignee IS NOT NULL
       GROUP BY assignee
       ORDER BY cnt DESC
       LIMIT 1`,
      [vendor]
    );
    return res.rows[0]?.assignee || null;
  } catch (err) {
    console.error('Vendor history lookup error:', err);
    return null;
  }
}

function getAssigneeFromTags(tags = []) {
  const lower = (tags || []).map((t) => t.toLowerCase());
  for (const tag of lower) {
    if (tagAssigneeMap[tag]) {
      return tagAssigneeMap[tag];
    }
  }
  return null;
}

module.exports = { getAssigneeFromVendorHistory, getAssigneeFromTags };
