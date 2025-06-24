const express = require('express');
const router = express.Router();
const { sendApprovalReminders } = require('../controllers/reminderController');
const { authMiddleware, authorizeRoles } = require('../controllers/userController');

router.post('/approval', authMiddleware, authorizeRoles('admin','approver'), async (req, res) => {
  try {
    await sendApprovalReminders();
    res.json({ message: 'Approval reminders sent' });
  } catch (err) {
    console.error('Approval reminders error:', err);
    res.status(500).json({ message: 'Failed to send reminders' });
  }
});

module.exports = router;
