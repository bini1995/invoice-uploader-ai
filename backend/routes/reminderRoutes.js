import express from 'express';
import { sendApprovalReminders } from '../controllers/reminderController.js';
import { authMiddleware, authorizeRoles } from '../controllers/userController.js';
const router = express.Router();

router.post('/approval', authMiddleware, authorizeRoles('admin','approver'), async (req, res) => {
  try {
    await sendApprovalReminders();
    res.json({ message: 'Approval reminders sent' });
  } catch (err) {
    console.error('Approval reminders error:', err);
    res.status(500).json({ message: 'Failed to send reminders' });
  }
});

export default router;
