const express = require('express');
const router = express.Router();
const { validateHeaders, validateRow, listRules, addRule } = require('../controllers/validationController');
const { authMiddleware } = require('../controllers/userController');

router.post('/validate-headers', authMiddleware, validateHeaders);
router.post('/validate-row', authMiddleware, validateRow);
router.get('/rules', authMiddleware, listRules);
router.post('/rules', authMiddleware, addRule);

module.exports = router;
