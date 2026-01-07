
import { sendMail } from '../utils/email.js';
import pool from '../config/db.js';
import { sendSlackNotification, sendTeamsNotification } from '../utils/notify.js';
import { broadcastNotification } from '../utils/chatServer.js';
import 'dotenv/config';
async function sendApprovalReminders() {
  const days = parseInt(process.env.APPROVAL_REMINDER_DAYS || '2', 10);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  try {
    const { rows } = await pool.query(
      `SELECT id, invoice_number, vendor
       FROM invoices
       WHERE approval_status IN ('Pending','In Progress')
         AND created_at <= $1`,
      [cutoff]
    );
    if (!rows.length) return;

    for (const inv of rows) {
      const msg = `Invoice ${inv.invoice_number} from ${inv.vendor} is awaiting approval.`;
      try {
        await sendMail({
          to: process.env.EMAIL_TO,
          subject: 'Approval reminder',
          text: msg,
        });
        await sendSlackNotification?.(`Approval reminder sent: ${inv.invoice_number}`);
        await sendTeamsNotification?.(`Approval reminder sent: ${inv.invoice_number}`);
        broadcastNotification?.(msg);
      } catch (err) {
        console.error('Approval reminder email error:', err);
      }
    }
  } catch (err) {
    console.error('Approval reminder error:', err);
  }
}

export { sendApprovalReminders };
