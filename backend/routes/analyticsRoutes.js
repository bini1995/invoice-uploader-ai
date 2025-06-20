const express = require('express');
const router = express.Router();
const { getReport, exportReportPDF, getTrends, getAgingReport, predictCashFlowRisk, getDashboardMetadata, getApprovalStats } = require('../controllers/analyticsController');
const { listRules, addRule } = require('../controllers/rulesController');
const { authMiddleware } = require('../controllers/userController');

router.get('/report', authMiddleware, getReport);
router.get('/report/pdf', authMiddleware, exportReportPDF);
router.get('/trends', authMiddleware, getTrends);
router.get('/aging', authMiddleware, getAgingReport);
router.get('/cash-flow/predict', authMiddleware, predictCashFlowRisk);
router.get('/rules', authMiddleware, listRules);
router.post('/rules', authMiddleware, addRule);
router.get('/approvals/stats', authMiddleware, getApprovalStats);
router.get('/metadata', authMiddleware, getDashboardMetadata);

module.exports = router;
