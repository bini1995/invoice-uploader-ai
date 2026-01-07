
import axios from 'axios';
import logger from './logger.js';
async function exportToErpA(invoice) {
  if (!process.env.ERP_A_URL || !process.env.ERP_A_TOKEN) return;
  try {
    await axios.post(`${process.env.ERP_A_URL}/invoices`, invoice, {
      headers: { Authorization: `Bearer ${process.env.ERP_A_TOKEN}` },
    });
    logger.info('Exported invoice to ERP A');
  } catch (err) {
    logger.error({ err }, 'ERP A export error');
  }
}

async function exportToErpB(invoice) {
  if (!process.env.ERP_B_URL || !process.env.ERP_B_TOKEN) return;
  try {
    await axios.post(`${process.env.ERP_B_URL}/invoices`, invoice, {
      headers: { Authorization: `Bearer ${process.env.ERP_B_TOKEN}` },
    });
    logger.info('Exported invoice to ERP B');
  } catch (err) {
    logger.error({ err }, 'ERP B export error');
  }
}

export { exportToErpA, exportToErpB };
