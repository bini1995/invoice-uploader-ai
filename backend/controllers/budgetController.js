const pool = require('../config/db');

exports.setBudget = async (req, res) => {
  const { vendor, tag, period, amount } = req.body;
  if (!period || !amount || (!vendor && !tag)) {
    return res.status(400).json({ message: 'vendor or tag, period and amount required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO budgets (vendor, tag, period, amount)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (vendor, tag, period)
       DO UPDATE SET amount = EXCLUDED.amount
       RETURNING *`,
      [vendor || null, tag || null, period, amount]
    );
    res.json({ budget: result.rows[0] });
  } catch (err) {
    console.error('Set budget error:', err);
    res.status(500).json({ message: 'Failed to set budget' });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM budgets');
    res.json(result.rows);
  } catch (err) {
    console.error('Get budgets error:', err);
    res.status(500).json({ message: 'Failed to fetch budgets' });
  }
};

exports.checkBudgetWarnings = async (req, res) => {
  const period = req.query.period || 'monthly';
  const now = new Date();
  const start = period === 'quarterly'
    ? new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = period === 'quarterly'
    ? new Date(start.getFullYear(), start.getMonth() + 3, 1)
    : new Date(start.getFullYear(), start.getMonth() + 1, 1);
  try {
    const budgetsRes = await pool.query('SELECT * FROM budgets WHERE period = $1', [period]);
    const budgets = budgetsRes.rows;
    const warnings = [];
    for (const b of budgets) {
      let total = 0;
      if (b.vendor) {
        const r = await pool.query(
          'SELECT SUM(amount) AS sum FROM invoices WHERE vendor = $1 AND date >= $2 AND date < $3',
          [b.vendor, start, end]
        );
        total = parseFloat(r.rows[0].sum) || 0;
      } else if (b.tag) {
        const r = await pool.query(
          `SELECT SUM(amount) AS sum FROM invoices WHERE tags ? $1 AND date >= $2 AND date < $3`,
          [b.tag, start, end]
        );
        total = parseFloat(r.rows[0].sum) || 0;
      }
      if (total >= 0.9 * parseFloat(b.amount)) {
        warnings.push({
          budget: b,
          spent: total,
          message: `You've reached 90% of your $${b.amount} '${b.vendor || b.tag}' budget`
        });
      }
    }
    res.json({ warnings });
  } catch (err) {
    console.error('Budget warning error:', err);
    res.status(500).json({ message: 'Failed to check budget warnings' });
  }
};
