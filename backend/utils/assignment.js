const pool = require('../config/db');

const tagAssigneeMap = {
  marketing: 'Alice',
  design: 'Design Team',
  'office supplies': 'Bob',
  it: 'Charlie',
  cloud: 'Charlie',
};

const categoryAssigneeMap = {
  marketing: 'Alice',
  design: 'Design Team',
  it: 'Charlie',
  finance: 'Finance Lead',
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

async function getAssigneeFromVendorProfile(vendor) {
  if (!vendor) return null;
  try {
    const res = await pool.query(
      'SELECT category FROM vendor_profiles WHERE vendor = $1',
      [vendor]
    );
    const cat = res.rows[0]?.category?.toLowerCase();
    if (cat && categoryAssigneeMap[cat]) {
      return categoryAssigneeMap[cat];
    }
    return null;
  } catch (err) {
    console.error('Vendor profile lookup error:', err);
    return null;
  }
}

module.exports = {
  getAssigneeFromVendorHistory,
  getAssigneeFromTags,
  getAssigneeFromVendorProfile,
};
