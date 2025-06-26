const pool = require('../config/db');

async function calculateScenario(delayDays) {
  const result = await pool.query(
    `SELECT amount, COALESCE(due_date, date) AS pay_date, priority FROM invoices`
  );
  const baseline = {};
  const scenario = {};
  for (const row of result.rows) {
    const amount = parseFloat(row.amount);
    const payDate = new Date(row.pay_date);
    const baseKey = payDate.toISOString().slice(0, 10);
    baseline[baseKey] = (baseline[baseKey] || 0) + amount;

    const scenarioDate = new Date(payDate);
    if (!row.priority) {
      scenarioDate.setDate(scenarioDate.getDate() + delayDays);
    }
    const scenarioKey = scenarioDate.toISOString().slice(0, 10);
    scenario[scenarioKey] = (scenario[scenarioKey] || 0) + amount;
  }
  const format = (obj) =>
    Object.keys(obj)
      .sort()
      .map((d) => ({ date: d, total: obj[d] }));
  return { delayDays, baseline: format(baseline), scenario: format(scenario) };
}

exports.scenarioCashFlow = async (req, res) => {
  const delayDays = parseInt(req.body.delayDays, 10) || 0;
  try {
    const data = await calculateScenario(delayDays);
    res.json(data);
  } catch (err) {
    console.error('Scenario cash flow error:', err);
    res.status(500).json({ message: 'Failed to calculate scenario cash flow' });
  }
};

exports.saveScenario = async (req, res) => {
  const userId = req.user?.userId;
  const { name, delayDays } = req.body;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!name) return res.status(400).json({ message: 'Name required' });
  const delay = parseInt(delayDays, 10) || 0;
  try {
    const result = await pool.query(
      `INSERT INTO cashflow_scenarios (user_id, name, delay_days) VALUES ($1,$2,$3) RETURNING id`,
      [userId, name, delay]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error('Save scenario error:', err);
    res.status(500).json({ message: 'Failed to save scenario' });
  }
};

exports.listScenarios = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const { rows } = await pool.query(
      `SELECT id, name, delay_days, created_at FROM cashflow_scenarios WHERE user_id=$1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ scenarios: rows });
  } catch (err) {
    console.error('List scenarios error:', err);
    res.status(500).json({ message: 'Failed to list scenarios' });
  }
};

exports.getScenario = async (req, res) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const result = await pool.query(
      `SELECT delay_days FROM cashflow_scenarios WHERE id=$1 AND user_id=$2`,
      [id, userId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    const data = await calculateScenario(parseInt(result.rows[0].delay_days, 10));
    res.json(data);
  } catch (err) {
    console.error('Get scenario error:', err);
    res.status(500).json({ message: 'Failed to get scenario' });
  }
};
