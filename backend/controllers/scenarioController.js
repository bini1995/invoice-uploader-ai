const pool = require('../config/db');

exports.scenarioCashFlow = async (req, res) => {
  const delayDays = parseInt(req.body.delayDays, 10) || 0;
  try {
    const result = await pool.query(
      `SELECT amount, COALESCE(due_date, date) AS pay_date, priority
       FROM invoices`
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
    const format = obj => Object.keys(obj).sort().map(d => ({ date: d, total: obj[d] }));
    res.json({ delayDays, baseline: format(baseline), scenario: format(scenario) });
  } catch (err) {
    console.error('Scenario cash flow error:', err);
    res.status(500).json({ message: 'Failed to calculate scenario cash flow' });
  }
};
