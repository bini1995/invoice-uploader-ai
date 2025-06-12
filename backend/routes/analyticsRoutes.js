const express = require('express');
const router = express.Router();
const { getReport, exportReportPDF } = require('../controllers/analyticsController');
const { listRules, addRule } = require('../controllers/rulesController');
const { authMiddleware } = require('../controllers/userController');

router.get('/report', authMiddleware, getReport);
router.get('/report/pdf', authMiddleware, exportReportPDF);
router.get('/rules', authMiddleware, listRules);
router.post('/rules', authMiddleware, addRule);

module.exports = router;
