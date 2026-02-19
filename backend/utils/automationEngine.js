
import pool from '../config/db.js';
import axios from 'axios';
import { exportToErpA, exportToErpB } from './erpExport.js';
import logger from './logger.js';
const SAFE_OPERATORS = ['===', '!==', '==', '!=', '>', '<', '>=', '<=', '&&', '||'];

function evalCondition(condition, payload) {
  try {
    if (!condition || typeof condition !== 'string') return false;
    if (condition.length > 500) return false;
    const forbidden = /\b(function|eval|import|require|process|global|window|document|fetch|XMLHttp|setTimeout|setInterval|constructor)\b|=>|\.\.\./i;
    if (forbidden.test(condition)) {
      logger.warn({ condition }, 'Blocked unsafe automation condition');
      return false;
    }
    const normalized = condition.replace(/(===|!==|==|!=|>=|<=|>|<|&&|\|\|)/g, ' $1 ');
    const tokens = normalized.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      if (SAFE_OPERATORS.includes(token)) continue;
      if (/^payload(\.\w+)+$/.test(token)) continue;
      if (/^['"][^'"]*['"]$/.test(token)) continue;
      if (/^\d+(\.\d+)?$/.test(token)) continue;
      if (/^(true|false|null|undefined)$/.test(token)) continue;
      if (/^\(+$/.test(token) || /^\)+$/.test(token)) continue;
      return false;
    }
    const fn = new Function('payload', `"use strict"; return (${condition})`);
    return fn(Object.freeze({...payload}));
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

export { triggerAutomations };
