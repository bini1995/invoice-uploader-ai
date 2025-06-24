const pool = require('../config/db');
const axios = require('axios');
const { exportToQuickBooks, exportToSAP } = require('./erpExport');

function evalCondition(condition, payload) {
  try {
    return Function('payload', `return (${condition})`)(payload);
  } catch (err) {
    console.error('Automation condition eval error:', err.message);
    return false;
  }
}

async function triggerAutomations(event, payload) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM automations WHERE event = $1 AND active = TRUE',
      [event]
    );
    for (const rule of rows) {
      if (rule.condition && !evalCondition(rule.condition, payload)) continue;
      switch (rule.action) {
        case 'export_quickbooks':
          await exportToQuickBooks(payload.invoice);
          break;
        case 'export_sap':
          await exportToSAP(payload.invoice);
          break;
        case 'http_post':
          if (rule.config?.url) {
            await axios.post(rule.config.url, payload);
          }
          break;
        default:
          console.log('Unknown automation action:', rule.action);
      }
    }
  } catch (err) {
    console.error('Automation trigger error:', err.message);
  }
}

module.exports = { triggerAutomations };
