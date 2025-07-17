const pool = require('../config/db');
const axios = require('axios');
const { exportToErpA, exportToErpB } = require('./erpExport');
const logger = require('./logger');

function evalCondition(condition, payload) {
  try {
    return Function('payload', `return (${condition})`)(payload);
  } catch (err) {
    logger.error({ err }, 'Automation condition eval error');
    return false;
  }
}

async function triggerAutomations(event, payload, attempt = 0) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM automations WHERE event = $1 AND active = TRUE',
      [event]
    );
    for (const rule of rows) {
      if (rule.condition && !evalCondition(rule.condition, payload)) continue;
      switch (rule.action) {
        case 'export_erp_a':
          await exportToErpA(payload.invoice);
          break;
        case 'export_erp_b':
          await exportToErpB(payload.invoice);
          break;
        case 'http_post':
          if (rule.config?.url) {
            await axios.post(rule.config.url, payload);
          }
          break;
        default:
          logger.warn({ action: rule.action }, 'Unknown automation action');
      }
    }
  } catch (err) {
    logger.error({ err }, 'Automation trigger error');
    if (attempt < 3) {
      setTimeout(() => triggerAutomations(event, payload, attempt + 1), 5000);
    }
  }
}

module.exports = { triggerAutomations };
