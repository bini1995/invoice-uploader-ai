const express = require('express');
const router = express.Router();
const { createRecurringTemplate, getRecurringTemplates } = require('../controllers/recurringController');
const { authMiddleware } = require('../controllers/userController');

router.post('/', authMiddleware, createRecurringTemplate);
router.get('/', authMiddleware, getRecurringTemplates);

module.exports = router;
